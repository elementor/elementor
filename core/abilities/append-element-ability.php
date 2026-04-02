<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Append_Element_Ability extends Abstract_Ability {

	use Element_Tree_Helpers;

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
					'appended_id'  => [
						'type'        => 'string',
						'description' => 'id of the appended element.',
					],
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
						'For building a complete page from scratch, use set-post-content with the full element tree — it is one write vs N reads + N writes when called in a loop.',
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

		$raw_elements = $document->get_elements_data();
		$elements     = $raw_elements ? $raw_elements : [];

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

		$repo        = new Global_Classes_Repository();
		$all_classes = $repo->all()->get_items()->all();
		$label_to_id = [];
		$known_ids   = [];
		foreach ( $all_classes as $id => $item ) {
			$known_ids[]                         = $id;
			$label_to_id[ $item['label'] ?? '' ] = $id;
		}

		$this->resolve_class_labels( $elements, $label_to_id );
		$this->validate_elements( $elements, $known_ids );

		$saved = $document->save( [ 'elements' => $elements ] );

		return [
			'post_id'     => $post_id,
			'appended_id' => $element['id'] ?? null,
			'parent_id'   => $parent_id,
			'success'     => (bool) $saved,
		];
	}
}
