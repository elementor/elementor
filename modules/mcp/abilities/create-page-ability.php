<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Links;
use Elementor\Modules\PageTemplates\Module as Page_Templates_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Create_Page_Ability extends Abstract_Ability {

	const TEMPLATES = [
		'default',
		Page_Templates_Module::TEMPLATE_THEME,
		Page_Templates_Module::TEMPLATE_HEADER_FOOTER,
		Page_Templates_Module::TEMPLATE_CANVAS,
	];

	protected function get_ability_id(): string {
		return 'elementor/create-page';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Create Elementor Page', 'elementor' ),
			__( 'Creates a new draft post or page and marks it as built with Elementor, with no elements yet. Use when the user wants a new layout shell to design in Elementor. On the frontend the theme still wraps it: its page title, and the active header and footer site parts. Pass template `elementor_canvas` for a page with no header, footer or title, or hide_title to remove only the title. Returns the new post ID, edit URL, template and hide_title.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'id' => [ 'type' => 'integer' ],
					'edit_url' => [ 'type' => 'string' ],
					'status' => [ 'type' => 'string' ],
					'type' => [ 'type' => 'string' ],
					'template' => [ 'type' => 'string' ],
					'hide_title' => [ 'type' => 'boolean' ],
					'preview_url' => Document_Mutation_Links::preview_schema_property(),
					'llm_instructions' => Document_Mutation_Links::llm_instructions_schema_property(),
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
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
					'template' => [
						'type' => 'string',
						'enum' => self::TEMPLATES,
						'description' => 'Page layout. `default` follows Site Settings; `elementor_theme` uses the theme template (title, header, footer); `elementor_header_footer` keeps the header and footer but not the title; `elementor_canvas` renders only the Elementor content.',
						'default' => 'default',
					],
					'hide_title' => [
						'type' => 'boolean',
						'description' => 'Hide the page title the theme prints above the content.',
						'default' => false,
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$post_type = ! empty( $input['post_type'] ) ? sanitize_key( $input['post_type'] ) : 'page';

		$type_error = $this->validate_post_type( $post_type );
		if ( $type_error ) {
			return $type_error;
		}

		$permission_error = $this->check_create_permission( $post_type );
		if ( $permission_error ) {
			return $permission_error;
		}

		$template = isset( $input['template'] ) && is_string( $input['template'] ) ? $input['template'] : 'default';

		if ( ! in_array( $template, self::TEMPLATES, true ) ) {
			return new \WP_Error(
				'invalid_template',
				/* translators: %s: Comma-separated list of supported templates. */
				sprintf( __( 'Unknown template. Use one of: %s.', 'elementor' ), implode( ', ', self::TEMPLATES ) ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$title = isset( $input['title'] ) && is_string( $input['title'] ) ? $input['title'] : '';

		return $this->create_post( $post_type, $title, $template, ! empty( $input['hide_title'] ) );
	}

	private function validate_post_type( string $post_type ): ?\WP_Error {
		if ( ! post_type_exists( $post_type ) || ! post_type_supports( $post_type, 'elementor' ) ) {
			return new \WP_Error(
				'invalid_post_type',
				__( 'This post type does not support Elementor.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	private function check_create_permission( string $post_type ): ?\WP_Error {
		$post_type_object = get_post_type_object( $post_type );

		if ( ! $post_type_object || ! current_user_can( $post_type_object->cap->create_posts ) ) {
			return new \WP_Error(
				'rest_cannot_create',
				__( 'Sorry, you are not allowed to create posts of this type.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return null;
	}

	private function create_post( string $post_type, string $title, string $template, bool $hide_title ) {
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
			return new \WP_Error(
				'document_not_found',
				__( 'Document could not be loaded.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$document->set_is_built_with_elementor( true );

		$settings = $this->page_settings( $template, $hide_title );

		if ( ! empty( $settings ) ) {
			$document->save( [ 'settings' => $settings ] );
		}

		return [
			'id' => (int) $post_id,
			'edit_url' => $document->get_edit_url(),
			'status' => get_post_status( $post_id ),
			'type' => $post_type,
			'template' => $template,
			'hide_title' => $hide_title,
		] + Document_Mutation_Links::for_document(
			$document,
			__( 'Page created.', 'elementor' )
		);
	}

	private function page_settings( string $template, bool $hide_title ): array {
		$settings = [];

		if ( 'default' !== $template ) {
			$settings['template'] = $template;
		}

		if ( $hide_title ) {
			$settings['hide_title'] = 'yes';
		}

		return $settings;
	}
}
