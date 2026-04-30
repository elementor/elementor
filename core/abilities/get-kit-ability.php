<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Get_Kit_Ability extends Abstract_Ability {

	const PAGE_SETTINGS_META_KEY = '_elementor_page_settings';

	protected function get_name(): string {
		return 'elementor/get-kit';
	}

	protected function get_config(): array {
		return [
			'label'        => 'Elementor Get Kit',
			'description'  => 'Returns the active Kit settings: custom CSS, system colors, and system typography. Read this before calling update-kit with custom_css to avoid overwriting existing styles.',
			'category'     => 'elementor',
			'input_schema' => [
				'type'                 => 'object',
				'properties'           => [],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'kit_id'            => [ 'type' => 'integer' ],
					'custom_css'        => [ 'type' => 'string', 'description' => 'Raw CSS injected on every page.' ],
					'system_colors'     => [ 'type' => 'array', 'description' => 'Global color palette entries.' ],
					'system_typography' => [ 'type' => 'array', 'description' => 'Global typography preset entries.' ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Returns the current active Elementor Kit settings.',
						'custom_css: the raw CSS string currently injected on every page.',
						'system_colors: the global color palette (same shape as update-kit input).',
						'system_typography: the global typography presets (same shape as update-kit input).',
						'Use custom_css_append on elementor/update-kit to append CSS without reading first.',
						'Call this ability when you need to inspect or reference existing kit values before making changes.',
					] ),
					'readonly'    => true,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$kit    = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$settings = get_post_meta( $kit_id, self::PAGE_SETTINGS_META_KEY, true );
		if ( ! is_array( $settings ) ) {
			$settings = [];
		}

		return [
			'kit_id'            => $kit_id,
			'custom_css'        => $settings['custom_css'] ?? '',
			'system_colors'     => $settings['system_colors'] ?? [],
			'system_typography' => $settings['system_typography'] ?? [],
		];
	}
}
