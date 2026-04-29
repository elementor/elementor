<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Create_Page_Ability {

	public function register() {
		wp_register_ability(
			'elementor/create-page',
			[
				'label' => __( 'Create Elementor Page', 'elementor' ),
				'description' => __( 'Creates a new draft post or page and marks it as built with Elementor (blank canvas in the editor). Use when the user wants a new layout shell to design in Elementor. Returns the new post ID and edit URL.', 'elementor' ),
				'category' => 'elementor',
				'input_schema' => [
					'type' => 'object',
					'properties' => [
						'title' => [
							'type' => 'string',
							'description' => 'Optional title for the new post.',
						],
						'post_type' => [
							'type' => 'string',
							'description' => 'Post type slug; must support Elementor. Defaults to page.',
							'default' => 'page',
						],
					],
				],
				'output_schema' => [
					'type' => 'object',
					'properties' => [
						'id' => [ 'type' => 'integer' ],
						'edit_url' => [ 'type' => 'string' ],
						'status' => [ 'type' => 'string' ],
						'type' => [ 'type' => 'string' ],
					],
				],
				'meta' => [
					'annotations' => [
						'readonly' => false,
						'idempotent' => false,
						'destructive' => false,
					],
				],
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'execute_callback' => [ $this, 'execute' ],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$post_type = ! empty( $input['post_type'] ) ? sanitize_key( $input['post_type'] ) : 'page';

		if ( ! post_type_exists( $post_type ) || ! post_type_supports( $post_type, 'elementor' ) ) {
			return new \WP_Error( 'invalid_post_type', __( 'This post type does not support Elementor.', 'elementor' ), [ 'status' => 400 ] );
		}

		$post_type_object = get_post_type_object( $post_type );

		if ( ! $post_type_object || ! current_user_can( $post_type_object->cap->create_posts ) ) {
			return new \WP_Error( 'rest_cannot_create', __( 'Sorry, you are not allowed to create posts of this type.', 'elementor' ), [ 'status' => 403 ] );
		}

		$title = isset( $input['title'] ) && is_string( $input['title'] ) ? $input['title'] : '';

		$post_id = wp_insert_post(
			[
				'post_title' => $title ? $title : __( 'Elementor Draft', 'elementor' ),
				'post_status' => 'draft',
				'post_type' => $post_type,
			],
			true
		);

		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error( 'document_not_found', __( 'Document could not be loaded.', 'elementor' ), [ 'status' => 500 ] );
		}

		$document->set_is_built_with_elementor( true );

		return [
			'id' => (int) $post_id,
			'edit_url' => $document->get_edit_url(),
			'status' => get_post_status( $post_id ),
			'type' => $post_type,
		];
	}
}
