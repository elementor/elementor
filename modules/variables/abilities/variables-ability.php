<?php

namespace Elementor\Modules\Variables\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variables_Ability {

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
					'data'            => [ 'type' => 'object',  'description' => 'Raw variable data from Kit post meta.' ],
					'count'           => [ 'type' => 'integer', 'description' => 'Total number of variables.' ],
					'supported_types' => [ 'type' => 'array',   'description' => 'Supported variable types.' ],
					'max_per_site'    => [ 'type' => 'integer', 'description' => 'Maximum variables per site.' ],
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
		$kit_id   = (int) get_option( 'elementor_active_kit' );
		$variables = get_post_meta( $kit_id, '_elementor_global_variables', true );

		if ( ! is_array( $variables ) ) {
			$variables = [ 'format_version' => 2, 'data' => [] ];
		}

		return [
			'data'            => $variables,
			'count'           => count( $variables['data'] ?? [] ),
			'supported_types' => [ 'color', 'font', 'size' ],
			'max_per_site'    => 1000,
		];
	}
}
