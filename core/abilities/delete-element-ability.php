<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Delete_Element_Ability extends Abstract_Ability {

	use Element_Tree_Helpers;

	protected function get_name(): string {
		return 'elementor/delete-element';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Delete Element',
			'description' => 'Removes a single element from an Elementor post by element ID.',
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
						'description' => 'The id of the element to remove.',
					],
				],
				'required'             => [ 'post_id', 'element_id' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'    => [ 'type' => 'integer' ],
					'element_id' => [ 'type' => 'string' ],
					'success'    => [
						'type'        => 'boolean',
						'description' => 'False when element_id was not found in the document tree.',
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Removes the element with the given id from the post and saves.',
						'Removing a container also removes all of its children recursively.',
						'Returns success:false (does not throw) if element_id is not found.',
						'Call elementor/get-post-content first to obtain element IDs if needed.',
					] ),
					'readonly'    => false,
					'destructive' => true,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id    = (int) $input['post_id'];
		$element_id = $input['element_id'];

		wp_cache_delete( $post_id, 'post_meta' );

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$raw_elements = $document->get_elements_data();
		$elements     = $raw_elements ? $raw_elements : [];

		$found = $this->delete_element( $elements, $element_id );

		if ( ! $found ) {
			return [
				'post_id'    => $post_id,
				'element_id' => $element_id,
				'success'    => false,
			];
		}

		$saved = $document->save( [ 'elements' => $elements ] );

		return [
			'post_id'    => $post_id,
			'element_id' => $element_id,
			'success'    => (bool) $saved,
		];
	}
}
