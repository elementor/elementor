<?php

namespace Elementor\Modules\Mcp\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Post_Ability extends Abstract_Ability {

	private const OPERATIONS = [
		'create' => [ Post\Create_Post_Operation::class ],
		'update' => [ Post\Update_Post_Operation::class ],
		'replace_content' => [ Post\Content_Mutation_Operation::class, 'replace' ],
		'append_content' => [ Post\Content_Mutation_Operation::class, 'append' ],
		'trash' => [ Post\Lifecycle_Operation::class, 'trash' ],
		'restore' => [ Post\Lifecycle_Operation::class, 'restore' ],
		'delete' => [ Post\Lifecycle_Operation::class, 'delete' ],
	];

	private const DRY_RUN_OPERATIONS = [ 'create', 'replace_content', 'append_content' ];

	private function ability_description(): string {
		return __(
			'Create, update, trash, restore, delete, or write content for an Elementor v4 post in a single call. Operations: create | update | replace_content | append_content | trash | restore | delete. The `elements` field accepts plain JSON nodes ({ widget, text, tag, url, css, classes, children }); $$type wrappers are never required from agents. Build global classes via elementor/manage-global-classes and reference them by id in classes:[]. Breakpoints and pseudo-states are not part of this version.',
			'elementor'
		);
	}

	private function elements_field_description(): string {
		return __(
			'Plain JSON nodes. Each node: { widget, text?, tag?, url?, target_blank?, css?, classes?, children? }. widget: "container" | "div" | "heading" | "paragraph" | "button". text is plain string (inline <br>/<strong> allowed). url is for button (sanitized to http|https|mailto|tel|#anchor|/relative). css is a semicolon-separated declaration string converted to typed style props; unsupported declarations fall back to custom_css (see css_gaps). classes is an array of global class ids (get them from elementor/manage-global-classes). children is recursive for containers. Raw v4 nodes ({elType, widgetType, settings.* with $$type}) are also accepted for backwards compatibility. Required for replace_content/append_content; optional on create.',
			'elementor'
		);
	}

	protected function get_ability_id(): string {
		return 'elementor/manage-post';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Elementor Post', 'elementor' ),
			$this->ability_description(),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'operation' => [ 'type' => 'string' ],
					'post_id' => [ 'type' => 'integer' ],
					'post_type' => [ 'type' => 'string' ],
					'post_status' => [ 'type' => 'string' ],
					'edit_url' => [ 'type' => 'string' ],
					'permalink' => [ 'type' => 'string' ],
					'dry_run' => [ 'type' => 'boolean' ],
					'added' => [ 'type' => 'integer' ],
					'deleted' => [ 'type' => 'boolean' ],
					'css_gaps' => [ 'type' => 'array' ],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
				'show_in_rest' => true,
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'properties' => [
					'operation' => [
						'type' => 'string',
						'enum' => array_keys( self::OPERATIONS ),
						'description' => 'Which lifecycle action to take.',
					],
					'post_id' => [
						'type' => 'integer',
						'description' => 'Target post. Required for every operation except create.',
					],
					'title' => [
						'type' => 'string',
						'description' => 'Post title. Required for create.',
					],
					'post_type' => [
						'type' => 'string',
						'description' => 'Post type slug. Only honored on create. Default: page. Must support Elementor.',
					],
					'post_status' => [
						'type' => 'string',
						'description' => 'draft | publish | private (or any registered status). Default on create: draft. Transitioning to publish requires publish_post capability.',
					],
					'slug' => [
						'type' => 'string',
						'description' => 'Post name; WordPress sanitizes and de-duplicates.',
					],
					'post_template' => [
						'type' => 'string',
						'description' => 'Page template slug. New-post default: elementor_canvas. Pass an empty string to use the theme default. On update, only changed when explicitly provided.',
					],
					'elements' => [
						'type' => 'array',
						'description' => $this->elements_field_description(),
					],
					'dry_run' => [
						'type' => 'boolean',
						'description' => 'When true, do not write. Only honored when elements is supplied.',
					],
				],
				'required' => [ 'operation' ],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$operation = isset( $input['operation'] ) ? (string) $input['operation'] : '';

		if ( ! isset( self::OPERATIONS[ $operation ] ) ) {
			return new \WP_Error(
				'invalid_operation',
				sprintf(
					/* translators: %s: comma-separated list of allowed operations. */
					__( 'Operation must be one of: %s.', 'elementor' ),
					implode( ', ', array_keys( self::OPERATIONS ) )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! empty( $input['dry_run'] ) && ! in_array( $operation, self::DRY_RUN_OPERATIONS, true ) ) {
			return new \WP_Error(
				'dry_run_not_supported',
				sprintf(
					/* translators: %s: comma-separated list of operations that accept dry_run. */
					__( 'dry_run is only honored on operations that accept elements: %s.', 'elementor' ),
					implode( ', ', self::DRY_RUN_OPERATIONS )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$entry = self::OPERATIONS[ $operation ];
		$class = $entry[0];
		$mode = $entry[1] ?? null;

		$handler = null === $mode ? new $class() : new $class( $mode );

		return $handler->handle( $input );
	}
}
