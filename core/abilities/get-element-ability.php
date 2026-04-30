<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Element_Ability extends Abstract_Ability {

	use Element_Tree_Helpers;

	protected function get_name(): string {
		return 'elementor/get-element';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Get Element',
			'description' => 'Fetches a single element node from an Elementor document by ID. Faster than get-post-content when you only need one element.',
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
						'description' => 'The id of the element to retrieve.',
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
					'element'    => [
						'type'        => [ 'object', 'null' ],
						'description' => 'The element node including its children. null when not found.',
					],
					'found'      => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Retrieves a single element node (with all its children) from a post by element ID.',
						'Use this instead of get-post-content when you only need to inspect or copy one element.',
						'Returns found:false (does not throw) if element_id is not in the document.',
						'The returned element object can be modified and passed directly to update-element or used as input when building new content.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id    = (int) $input['post_id'];
		$element_id = $input['element_id'];

		// Bust the WP object cache so get_elements_data reads from DB, not a stale cache.
		wp_cache_delete( $post_id, 'post_meta' );

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$raw_elements = $document->get_elements_data();
		$elements     = $raw_elements ? $raw_elements : [];

		$element = $this->find_element( $elements, $element_id );

		return [
			'post_id'    => $post_id,
			'element_id' => $element_id,
			'element'    => $element,
			'found'      => null !== $element,
		];
	}
}
