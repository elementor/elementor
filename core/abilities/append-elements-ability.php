<?php

namespace Elementor\Core\Abilities;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Append_Elements_Ability extends Abstract_Ability {

	use Element_Tree_Helpers;

	protected function get_name(): string {
		return 'elementor/append-elements';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Append Elements (Batch)',
			'description' => 'Appends multiple elements to a post in a single document read + save. Use instead of multiple append-element calls.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'  => [
						'type'        => 'integer',
						'description' => 'WordPress post ID.',
					],
					'elements' => [
						'type'        => 'array',
						'description' => 'Ordered list of elements to append.',
						'items'       => [
							'type'       => 'object',
							'properties' => [
								'element'   => [
									'type'        => 'object',
									'description' => 'Element object to append. Must include: id (unique string), elType, settings. For widgets: widgetType.',
								],
								'parent_id' => [
									'type'        => [ 'string', 'null' ],
									'description' => 'ID of the parent element to append into. null or omitted = append at root.',
								],
							],
							'required'             => [ 'element' ],
							'additionalProperties' => false,
						],
					],
				],
				'required'             => [ 'post_id', 'elements' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'results' => [
						'type'  => 'array',
						'items' => [
							'type'       => 'object',
							'properties' => [
								'appended_id' => [ 'type' => [ 'string', 'null' ] ],
								'parent_id'   => [ 'type' => [ 'string', 'null' ] ],
								'found'       => [ 'type' => 'boolean' ],
							],
						],
					],
					'success' => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Appends multiple elements to a post in one document read + save.',
						'Use this instead of multiple sequential append-element calls.',
						'elements: ordered array of { element, parent_id } pairs.',
						'parent_id: ID of the container to append into. Omit or null = root level.',
						'Each element id must be unique within the document.',
						'results: one entry per input element — found:false means the parent_id was not found (element was skipped).',
						'The document is saved once at the end even if some insertions fail.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id       = (int) $input['post_id'];
		$items         = $input['elements'];

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$raw_elements = $document->get_elements_data();
		$elements     = $raw_elements ? $raw_elements : [];
		$results      = [];

		foreach ( $items as $item ) {
			$element   = $item['element'];
			$parent_id = $item['parent_id'] ?? null;

			if ( null === $parent_id ) {
				$elements[] = $element;
				$found      = true;
			} else {
				$found = $this->append_to_parent( $elements, $parent_id, $element );
			}

			$results[] = [
				'appended_id' => $element['id'] ?? null,
				'parent_id'   => $parent_id,
				'found'       => $found,
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

		$local_ids = [];
		$this->collect_local_style_ids( $elements, $local_ids );
		$this->validate_elements( $elements, array_merge( $known_ids, $local_ids ) );

		$saved = $document->save( [ 'elements' => $elements ] );

		return [
			'post_id' => $post_id,
			'results' => $results,
			'success' => (bool) $saved,
		];
	}
}
