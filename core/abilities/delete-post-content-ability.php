<?php

namespace Elementor\Core\Abilities;

use Elementor\Core\Base\Document;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Delete_Post_Content_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/delete-post-content';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Delete Post Content',
			'description' => 'Clears all Elementor data from a post, reverting it to an empty canvas. Does not delete the post itself.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [
						'type'        => 'integer',
						'description' => 'WordPress post ID to clear.',
					],
				],
				'required'             => [ 'post_id' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'deleted' => [ 'type' => 'boolean' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Clears all Elementor element data from a post (empties the canvas).',
						'The post itself is NOT deleted — only its Elementor content is removed.',
						'CSS cache and document cache are cleared automatically.',
						'After this call, elementor/get-post-content will return an empty elements array.',
						'This is destructive and not easily reversible — confirm the post_id before calling.',
					] ),
					'readonly'    => false,
					'destructive' => true,
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

		$document->save( [ 'elements' => [] ] );
		delete_post_meta( $post_id, Document::ELEMENTOR_DATA_META_KEY );

		return [
			'post_id' => $post_id,
			'deleted' => true,
		];
	}
}
