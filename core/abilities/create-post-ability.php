<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Thin wrapper over wp_insert_post that also marks the post as an Elementor
 * v4-built document. Removes the need to call wp_insert_post via execute-php
 * every time a new page is being built.
 */
class Create_Post_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'elementor/create-post';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Create Post',
			'description' => 'Creates a WordPress post/page (or any registered post type) and marks it as an Elementor v4 document so build-page can target it immediately.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'title'     => [
						'type'        => 'string',
						'description' => 'Post title.',
					],
					'post_type' => [
						'type'        => 'string',
						'description' => 'Post type slug. Default: "page".',
					],
					'post_status' => [
						'type'        => 'string',
						'description' => 'Post status. Default: "draft". Common: draft | publish | private.',
					],
					'slug'      => [
						'type'        => 'string',
						'description' => 'Optional post slug (post_name). WordPress will sanitize and de-duplicate automatically.',
					],
				],
				'required'             => [ 'title' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'post_id'   => [ 'type' => 'integer' ],
					'edit_url'  => [ 'type' => 'string' ],
					'permalink' => [ 'type' => 'string' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'ABILITY NAME: elementor/create-post — NOT wordpress/create-post.',
						'Creates a new post/page and marks it as an Elementor v4 document (sets _elementor_edit_mode=builder and _elementor_version).',
						'To create a post AND build its content in one call, use elementor/make-page with title instead of post_id.',
						'Default post_type=page, post_status=draft.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$title       = (string) $input['title'];
		$post_type   = $input['post_type'] ?? 'page';
		$post_status = $input['post_status'] ?? 'draft';
		$slug        = $input['slug'] ?? '';

		$args = [
			'post_title'  => $title,
			'post_type'   => $post_type,
			'post_status' => $post_status,
			'post_author' => get_current_user_id(),
		];

		if ( is_string( $slug ) && '' !== $slug ) {
			$args['post_name'] = $slug;
		}

		$post_id = wp_insert_post( $args, true );

		if ( is_wp_error( $post_id ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \RuntimeException( 'wp_insert_post failed: ' . $post_id->get_error_message() );
		}

		update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $post_id, '_elementor_version', defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : '' );

		return [
			'post_id'   => (int) $post_id,
			'edit_url'  => (string) admin_url( 'post.php?post=' . $post_id . '&action=elementor' ),
			'permalink' => (string) get_permalink( $post_id ),
		];
	}
}
