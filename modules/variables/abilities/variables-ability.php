<?php

namespace Elementor\Modules\Variables\Abilities;

use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Modules\Variables\Storage\Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variables_Ability {

	private Kits_Manager $kits_manager;

	public function __construct( Kits_Manager $kits_manager ) {
		$this->kits_manager = $kits_manager;
	}

	public function register_hooks(): void {
		add_action( 'wp_abilities_api_init', [ $this, 'register_ability' ] );
	}

	public function register_ability(): void {
		wp_register_ability( 'elementor/variables', [
			'label'       => 'Elementor Global Variables',
			'description' => 'Returns all global CSS variables (color, font, size) stored in the Elementor Kit.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'                 => 'object',
				'properties'           => [],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'data'            => [
						'type'        => 'object',
						'description' => 'Raw variable data from Kit post meta.',
					],
					'count'           => [
						'type'        => 'integer',
						'description' => 'Total number of variables.',
					],
					'supported_types' => [
						'type'        => 'array',
						'description' => 'Supported variable types.',
					],
					'max_per_site'    => [
						'type'        => 'integer',
						'description' => 'Maximum variables per site.',
					],
				],
			],
			'execute_callback'    => [ $this, 'execute' ],
			'permission_callback' => [ $this, 'permission' ],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Returns all Elementor global CSS variables from the active Kit.',
						'Variable IDs can be referenced in style props using:',
						'  - {"$$type":"global-color-variable","value":"<id>"} for colors',
						'  - {"$$type":"global-font-variable","value":"<id>"} for fonts',
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
		$kit       = $this->kits_manager->get_active_kit();
		$variables = $kit->get_json_meta( Constants::VARIABLES_META_KEY );

		if ( ! is_array( $variables ) ) {
			$variables = [
				'format_version' => Constants::FORMAT_VERSION_V2,
				'data'           => [],
			];
		}

		return [
			'data'            => $variables,
			'count'           => count( $variables['data'] ?? [] ),
			'supported_types' => [ 'color', 'font', 'size' ],
			'max_per_site'    => Constants::TOTAL_VARIABLES_COUNT,
		];
	}
}
