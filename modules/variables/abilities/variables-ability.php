<?php

namespace Elementor\Modules\Variables\Abilities;

use Elementor\Core\Abilities\Abstract_Ability;
use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Modules\Variables\Storage\Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variables_Ability extends Abstract_Ability {

	private Kits_Manager $kits_manager;

	public function __construct( Kits_Manager $kits_manager ) {
		$this->kits_manager = $kits_manager;
	}

	protected function get_name(): string {
		return 'elementor/variables';
	}

	protected function get_config(): array {
		return [
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
		];
	}

	public function execute( array $_input ): array {
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
