<?php

namespace Elementor\Modules\GlobalClasses\Abilities;

use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Ability {

	public function __construct( private Kits_Manager $kits_manager ) {}

	public function register_hooks(): void {
		add_action( 'wp_abilities_api_init', [ $this, 'register_ability' ] );
	}

	public function register_ability(): void {
		wp_register_ability( 'elementor/global-classes', [
			'label'       => 'Elementor Global Classes',
			'description' => 'Returns all global CSS classes stored in the Elementor Kit, including frontend classes, preview-only classes, and count.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'                 => 'object',
				'properties'           => [],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'frontend' => [ 'type' => 'object',  'description' => 'Published global classes (items + order).' ],
					'preview'  => [ 'type' => 'object',  'description' => 'Preview-only global classes (items + order).' ],
					'count'    => [ 'type' => 'integer', 'description' => 'Total number of published global classes.' ],
				],
			],
			'execute_callback'    => [ $this, 'execute' ],
			'permission_callback' => [ $this, 'permission' ],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Returns all Elementor global CSS classes from the active Kit.',
						'Use class IDs in element settings.classes to apply global styles:',
						'  {"$$type":"classes","value":["existing-global-class-id","e-{elementId}-s"]}',
						'Preview classes are editor-only and not rendered on the frontend.',
						'To create or modify global classes, use the REST API: PUT /wp-json/elementor/v1/global-classes',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		] );
	}

	public function permission(): bool {
		return current_user_can( 'manage_options' );
	}

	public function execute( array $input ): array {
		$kit      = $this->kits_manager->get_active_kit();
		$frontend = $kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$preview  = $kit->get_json_meta( Global_Classes_Repository::META_KEY_PREVIEW );

		if ( ! is_array( $frontend ) ) {
			$frontend = [ 'items' => [], 'order' => [] ];
		}
		if ( ! is_array( $preview ) ) {
			$preview = [ 'items' => [], 'order' => [] ];
		}

		return [
			'frontend' => $frontend,
			'preview'  => $preview,
			'count'    => count( $frontend['items'] ?? [] ),
		];
	}
}
