<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Move_Element_Ability extends Abstract_Ability {

	use Element_Tree_Helpers;

	protected function get_name(): string {
		return 'elementor/move-element';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Move Element',
			'description' => 'Moves an existing element to a different parent or position within the same Elementor document.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [
						'type'        => 'integer',
						'description' => 'WordPress post ID.',
					],
					'element_id' => [
						'type'        => 'string',
						'description' => 'ID of the element to move.',
					],
					'new_parent_id' => [
						'type'        => [ 'string', 'null' ],
						'description' => 'ID of the target parent container. null = move to root level.',
					],
					'position' => [
						'type'        => 'integer',
						'description' => '0-based index within the target parent\'s children. -1 or omit = append at end.',
					],
				],
				'required'             => [ 'post_id', 'element_id' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'       => [ 'type' => 'integer' ],
					'element_id'    => [ 'type' => 'string' ],
					'new_parent_id' => [ 'type' => [ 'string', 'null' ] ],
					'position'      => [ 'type' => 'integer' ],
					'success'       => [
						'type'        => 'boolean',
						'description' => 'False when element_id or new_parent_id was not found.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Moves element_id to a new parent and/or position within the document.',
						'new_parent_id: ID of the destination container. Pass null to move to the document root.',
						'position: 0-based index where the element should be inserted. Omit or pass -1 to append at the end.',
						'The element is first extracted from its current position, then re-inserted — all children move with it.',
						'Returns success:false (does not throw) when element_id is not found or new_parent_id is not found.',
						'Call elementor/get-post-content to inspect the current tree before moving.',
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
		$element_id    = $input['element_id'];
		$new_parent_id = $input['new_parent_id'] ?? null;
		$position      = isset( $input['position'] ) ? (int) $input['position'] : -1;

		wp_cache_delete( $post_id, 'post_meta' );

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$raw_elements = $document->get_elements_data();
		$elements     = $raw_elements ? $raw_elements : [];

		$found = $this->move_element( $elements, $element_id, $new_parent_id, $position );

		if ( ! $found ) {
			return [
				'post_id'       => $post_id,
				'element_id'    => $element_id,
				'new_parent_id' => $new_parent_id,
				'position'      => $position,
				'success'       => false,
			];
		}

		$saved = $document->save( [ 'elements' => $elements ] );

		return [
			'post_id'       => $post_id,
			'element_id'    => $element_id,
			'new_parent_id' => $new_parent_id,
			'position'      => $position,
			'success'       => (bool) $saved,
		];
	}
}
