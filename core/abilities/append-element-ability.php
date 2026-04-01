<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Append_Element_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/append-element';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Append Element',
			'description' => 'Appends a single element to a post without requiring a full read-modify-write cycle. Faster than get-post-content + set-post-content for simple insertions.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [
						'type'        => 'integer',
						'description' => 'WordPress post ID.',
					],
					'element' => [
						'type'        => 'object',
						'description' => 'Element object to append. Must include: id (unique string), elType, settings. For widgets: widgetType. For containers: elements (children array).',
					],
					'parent_id' => [
						'type'        => [ 'string', 'null' ],
						'description' => 'ID of the parent element to append into. null or omitted = append to the root of the document.',
					],
				],
				'required'             => [ 'post_id', 'element' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'      => [ 'type' => 'integer' ],
					'appended_id'  => [ 'type' => 'string', 'description' => 'id of the appended element.' ],
					'parent_id'    => [ 'type' => [ 'string', 'null' ] ],
					'success'      => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Appends one element to a post without fetching the full content first.',
						'Use this for simple insertions instead of get-post-content + set-post-content.',
						'parent_id: ID of the container element to append into. Omit or pass null to append at root level.',
						'The element id must be unique within the document — generate one (e.g. a short random string).',
						'Returns success:false (does not throw) if parent_id is provided but not found in the tree.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id   = (int) $input['post_id'];
		$element   = $input['element'];
		$parent_id = $input['parent_id'] ?? null;

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$elements = $document->get_elements_data() ?: [];

		if ( null === $parent_id ) {
			$elements[] = $element;
			$found      = true;
		} else {
			$found = $this->append_to_parent( $elements, $parent_id, $element );
		}

		if ( ! $found ) {
			return [
				'post_id'     => $post_id,
				'appended_id' => $element['id'] ?? null,
				'parent_id'   => $parent_id,
				'success'     => false,
			];
		}

		$saved = $document->save( [ 'elements' => $elements ] );

		return [
			'post_id'     => $post_id,
			'appended_id' => $element['id'] ?? null,
			'parent_id'   => $parent_id,
			'success'     => (bool) $saved,
		];
	}

	/**
	 * Recursively walk $elements looking for an element whose 'id' matches
	 * $parent_id, then append $new_element to its 'elements' children.
	 *
	 * @param array  $elements    The elements array (modified in-place via reference).
	 * @param string $parent_id   Target parent ID.
	 * @param array  $new_element Element to append.
	 * @return bool True if the parent was found and the element was appended.
	 */
	private function append_to_parent( array &$elements, string $parent_id, array $new_element ): bool {
		foreach ( $elements as &$el ) {
			if ( isset( $el['id'] ) && $el['id'] === $parent_id ) {
				$el['elements']   = $el['elements'] ?? [];
				$el['elements'][] = $new_element;
				return true;
			}

			if ( ! empty( $el['elements'] ) && is_array( $el['elements'] ) ) {
				if ( $this->append_to_parent( $el['elements'], $parent_id, $new_element ) ) {
					return true;
				}
			}
		}
		unset( $el );

		return false;
	}
}
