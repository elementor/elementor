<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Structure_Ability {

	public function register() {
		wp_register_ability(
			'elementor/get-page-structure',
			[
				'label' => __( 'Get Elementor Page Structure', 'elementor' ),
				'description' => __( 'Returns the Elementor element tree (widgets, containers, and nested content) for a single post or page ID. Use after list-pages when you need the live JSON structure to reason about layout, widget types, or to plan edits. Only works for posts that were saved with Elementor.', 'elementor' ),
				'category' => 'elementor',
				'input_schema' => [
					'type' => 'object',
					'required' => [ 'post_id' ],
					'properties' => [
						'post_id' => [
							'type' => 'integer',
							'description' => 'WordPress post ID of the Elementor document.',
						],
					],
				],
				'output_schema' => [
					'type' => 'object',
					'properties' => [
						'elements' => [
							'type' => 'array',
							'description' => 'Root-level Elementor elements for the document.',
						],
					],
				],
				'meta' => [
					'annotations' => [
						'readonly' => true,
						'idempotent' => true,
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

	public function execute( $input ) {
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;

		if ( ! $post_id ) {
			return new \WP_Error( 'invalid_post_id', __( 'A valid post_id is required.', 'elementor' ), [ 'status' => 400 ] );
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error( 'rest_cannot_view', __( 'Sorry, you are not allowed to access this document.', 'elementor' ), [ 'status' => 403 ] );
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error( 'document_not_found', __( 'Document not found.', 'elementor' ), [ 'status' => 404 ] );
		}

		if ( ! $document->is_built_with_elementor() ) {
			return new \WP_Error( 'not_elementor', __( 'This post is not built with Elementor.', 'elementor' ), [ 'status' => 400 ] );
		}

		if ( ! $document->is_editable_by_current_user() ) {
			return new \WP_Error( 'rest_cannot_view', __( 'Sorry, you are not allowed to edit this document.', 'elementor' ), [ 'status' => 403 ] );
		}

		$elements = $document->get_elements_data();

		return [
			'elements' => is_array( $elements ) ? $elements : [],
		];
	}
}
