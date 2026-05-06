<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Update_Settings_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/update-page-settings';
	}

	protected function get_definition(): array {
		return [
			'label' => __( 'Update Elementor Page Settings', 'elementor' ),
			'description' => __( 'Updates Elementor document-level settings for a post (for example page layout, title visibility, or custom page settings). Pass only the keys you want to change. Use list-pages to resolve IDs and get-page-structure when you also need the element tree. Requires permission to edit the target post.', 'elementor' ),
			'category' => 'elementor',
			'input_schema' => [
				'type' => 'object',
				'required' => [ 'post_id', 'settings' ],
				'properties' => [
					'post_id' => [
						'type' => 'integer',
						'description' => 'WordPress post ID of the Elementor document.',
					],
					'settings' => [
						'type' => 'object',
						'description' => 'Partial document settings object; merged into existing settings. Schema enforcement is delegated to document->save().',
						'additionalProperties' => true,
					],
				],
			],
			'output_schema' => [
				'type' => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'post_id' => [ 'type' => 'integer' ],
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
		];
	}

	public function execute( $input = [] ) {
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;
		$settings = isset( $input['settings'] ) && is_array( $input['settings'] ) ? $input['settings'] : null;

		if ( ! $post_id ) {
			return new \WP_Error( 'invalid_post_id', __( 'A valid post_id is required.', 'elementor' ), [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( null === $settings ) {
			return new \WP_Error( 'invalid_settings', __( 'The settings object is required.', 'elementor' ), [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error( 'document_not_found', __( 'Document not found.', 'elementor' ), [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		if ( ! $document->is_editable_by_current_user() ) {
			return new \WP_Error( 'rest_cannot_edit', __( 'Sorry, you are not allowed to edit this document.', 'elementor' ), [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		$saved = $document->save(
			[
				'settings' => $settings,
			]
		);

		if ( ! $saved ) {
			return new \WP_Error( 'save_failed', __( 'Could not save document settings.', 'elementor' ), [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
		}

		return [
			'success' => true,
			'post_id' => $post_id,
		];
	}
}
