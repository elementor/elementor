<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Post_Content_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/get-post-content';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Get Post Content',
			'description' => 'Returns the decoded Elementor elements tree (_elementor_data) for any post or page.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [
						'type'        => 'integer',
						'description' => 'WordPress post ID.',
					],
				],
				'required'             => [ 'post_id' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'  => [ 'type' => 'integer' ],
					'elements' => [
						'type'        => 'array',
						'description' => 'Decoded Elementor elements tree. Pass this array (modified) to elementor/set-post-content.',
					],
					'is_built_with_elementor' => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Returns the Elementor elements tree for a post.',
						'elements is an array of top-level sections/containers. Each element has: id, elType, widgetType, settings, styles, elements (children).',
						'Modify elements and pass back to elementor/set-post-content to update the page.',
						'is_built_with_elementor is false if the post has never been edited with Elementor.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$post_id  = (int) $input['post_id'];
		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \InvalidArgumentException( "Post $post_id not found or not an Elementor document." );
		}

		$elements = $document->get_elements_data();

		return [
			'post_id'                 => $post_id,
			'elements'                => $elements ? $elements : [],
			'is_built_with_elementor' => ! empty( $elements ),
		];
	}
}
