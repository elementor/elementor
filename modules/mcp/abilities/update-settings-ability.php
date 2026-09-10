<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Core\Settings\Page\Manager as PageManager;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Links;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Update_Settings_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/update-page-settings';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Update Elementor Page Settings', 'elementor' ),
			__( 'Updates Elementor document-level settings for a post (for example page layout, title visibility, background color, or custom page settings). Pass only the keys you want to change. Use background_color to set a solid page background with a supported hex color or Elementor global color. Ask the user for the URL or post ID. Use get-page-structure when you also need the element tree. Requires permission to edit the target post.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'post_id' => [ 'type' => 'integer' ],
					'preview_url' => Document_Mutation_Links::preview_schema_property(),
					'llm_instructions' => Document_Mutation_Links::llm_instructions_schema_property(),
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'required' => [ 'post_id' ],
				'anyOf' => [
					[ 'required' => [ 'settings' ] ],
					[ 'required' => [ 'background_color' ] ],
				],
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
					'background_color' => [
						'type' => 'string',
						'description' => 'Solid page background color. Accepts #RGB, #RGBA, #RRGGBB, #RRGGBBAA, or an Elementor global color such as var(--e-global-color-primary).',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;
		$has_settings = array_key_exists( 'settings', $input );
		$settings = $has_settings && is_array( $input['settings'] ) ? $input['settings'] : null;
		$has_background_color = array_key_exists( 'background_color', $input );
		$background_color = $has_background_color && is_string( $input['background_color'] )
			? trim( $input['background_color'] )
			: null;

		if ( ! $post_id ) {
			return new \WP_Error( 'invalid_post_id', __( 'A valid post_id is required.', 'elementor' ), [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( ( $has_settings && null === $settings ) || ( ! $has_settings && ! $has_background_color ) ) {
			return new \WP_Error( 'invalid_settings', __( 'A settings object or background_color is required.', 'elementor' ), [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		if ( $has_background_color && ! $this->is_valid_background_color( $background_color ) ) {
			return new \WP_Error(
				'invalid_background_color',
				__( 'background_color must be a supported hex color or Elementor global color.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error( 'document_not_found', __( 'Document not found.', 'elementor' ), [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		if ( ! $document->is_editable_by_current_user() ) {
			return new \WP_Error( 'rest_cannot_edit', __( 'Sorry, you are not allowed to edit this document.', 'elementor' ), [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		$persisted_settings = $document->get_meta( PageManager::META_KEY );
		$persisted_settings = is_array( $persisted_settings ) ? $persisted_settings : [];
		$settings_to_save = array_replace_recursive( $persisted_settings, $settings ?? [] );

		if ( $has_background_color ) {
			$settings_to_save['background_background'] = 'classic';
			$settings_to_save['background_color'] = $background_color;
		}

		$saved = $document->save( [ 'settings' => $settings_to_save ] );

		if ( ! $saved ) {
			return new \WP_Error( 'save_failed', __( 'Could not save document settings.', 'elementor' ), [ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ] );
		}

		return [
			'success' => true,
			'post_id' => $post_id,
		] + Document_Mutation_Links::for_document( $document );
	}

	private function is_valid_background_color( ?string $background_color ): bool {
		if ( ! $background_color ) {
			return false;
		}

		$is_hex_color = (bool) preg_match( '/^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i', $background_color );
		$is_global_color = (bool) preg_match( '/^var\(\s*--e-global-color-[a-zA-Z0-9_-]+\s*\)$/', $background_color );

		return $is_hex_color || $is_global_color;
	}
}
