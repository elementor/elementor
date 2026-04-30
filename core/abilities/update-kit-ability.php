<?php

namespace Elementor\Core\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Update_Kit_Ability extends Abstract_Ability {

	const PAGE_SETTINGS_META_KEY = '_elementor_page_settings';

	protected function get_name(): string {
		return 'elementor/update-kit';
	}

	protected function get_config(): array {
		return [
			'label'       => 'Elementor Update Kit',
			'description' => 'Updates global Kit settings: custom CSS, global (system) colors, and global (system) typography.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'custom_css' => [
						'type'        => 'string',
						'description' => 'Replaces the global custom CSS for the site. Pass an empty string to clear it. Use custom_css_append to add CSS without overwriting.',
					],
					'custom_css_append' => [
						'type'        => 'string',
						'description' => 'Appends CSS to the existing global custom CSS. Reads the current value and concatenates — no need to call get-kit first. Applied after custom_css if both are present.',
					],
					'system_colors' => [
						'type'        => 'array',
						'description' => 'Global color palette. Each item: { _id: string, title: string, color: string (hex/rgba) }. Replaces ALL system colors — include every color you want to keep.',
						'items'       => [
							'type'       => 'object',
							'properties' => [
								'_id'   => [ 'type' => 'string', 'description' => 'Unique ID, e.g. "primary", "secondary". Slug-style, no spaces.' ],
								'title' => [ 'type' => 'string' ],
								'color' => [ 'type' => 'string', 'description' => 'CSS color value — hex, rgb(), rgba().' ],
							],
							'required' => [ '_id', 'title', 'color' ],
						],
					],
					'system_typography' => [
						'type'        => 'array',
						'description' => 'Global typography presets. Each item: { _id, title, typography_font_family?, typography_font_size?, typography_font_weight?, typography_line_height?, typography_letter_spacing?, typography_text_transform? }. Replaces ALL system typography.',
						'items'       => [
							'type'       => 'object',
							'properties' => [
								'_id'                          => [ 'type' => 'string' ],
								'title'                        => [ 'type' => 'string' ],
								'typography_font_family'       => [ 'type' => 'string' ],
								'typography_font_size'         => [ 'type' => 'object', 'description' => '{ size: number, unit: "px"|"em"|"rem"|"vw" }' ],
								'typography_font_weight'       => [ 'type' => 'string' ],
								'typography_line_height'       => [ 'type' => 'object', 'description' => '{ size: number, unit: "px"|"em"|"rem" }' ],
								'typography_letter_spacing'    => [ 'type' => 'object', 'description' => '{ size: number, unit: "px"|"em" }' ],
								'typography_text_transform'    => [ 'type' => 'string', 'description' => '"none"|"uppercase"|"lowercase"|"capitalize"' ],
							],
							'required' => [ '_id', 'title' ],
						],
					],
				],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'kit_id'  => [ 'type' => 'integer' ],
					'updated' => [
						'type'        => 'array',
						'description' => 'List of setting keys that were changed.',
						'items'       => [ 'type' => 'string' ],
					],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Updates global site-wide settings stored in the active Elementor Kit.',
						'custom_css: replaces the raw CSS injected on every page (same as the "Custom CSS" tab in Site Settings).',
						'custom_css_append: appends CSS to the existing global custom CSS without reading first. Use this instead of get-kit + update-kit when you only want to add rules.',
						'system_colors: replaces the full global color palette used by Global Color pickers. Each item requires _id (slug), title, and color. Common IDs: primary, secondary, text, accent.',
						'system_typography: replaces all global typography presets. Common IDs: primary, secondary, text, accent.',
						'IMPORTANT: system_colors and system_typography are full replacements, not merges. Include every entry you want to keep, or omit the key entirely to leave it unchanged.',
						'After updating, call elementor/force-clear-styles to regenerate the Kit CSS.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => true,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$kit    = Plugin::$instance->kits_manager->get_active_kit();
		$kit_id = $kit->get_main_id();

		$existing = get_post_meta( $kit_id, self::PAGE_SETTINGS_META_KEY, true );
		if ( ! is_array( $existing ) ) {
			$existing = [];
		}

		$updated = [];

		if ( array_key_exists( 'custom_css', $input ) ) {
			$existing['custom_css'] = $input['custom_css'];
			$updated[] = 'custom_css';
		}

		if ( array_key_exists( 'custom_css_append', $input ) && '' !== $input['custom_css_append'] ) {
			$existing['custom_css'] = rtrim( $existing['custom_css'] ?? '' ) . "\n" . $input['custom_css_append'];
			if ( ! in_array( 'custom_css', $updated, true ) ) {
				$updated[] = 'custom_css';
			}
		}

		if ( array_key_exists( 'system_colors', $input ) ) {
			$existing['system_colors'] = $this->sanitize_repeater_items( $input['system_colors'] );
			$updated[] = 'system_colors';
		}

		if ( array_key_exists( 'system_typography', $input ) ) {
			$existing['system_typography'] = $this->sanitize_repeater_items( $input['system_typography'] );
			$updated[] = 'system_typography';
		}

		if ( empty( $updated ) ) {
			return [
				'kit_id'  => $kit_id,
				'updated' => [],
			];
		}

		update_post_meta( $kit_id, self::PAGE_SETTINGS_META_KEY, $existing );

		// Invalidate Kit CSS so changes are visible on the next page load.
		try {
			Plugin::$instance->files_manager->clear_cache();
		} catch ( \Throwable $e ) {
			unset( $e );
		}

		return [
			'kit_id'  => $kit_id,
			'updated' => $updated,
		];
	}

	private function sanitize_repeater_items( array $items ): array {
		$sanitized = [];

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$sanitized[] = $item;
		}

		return $sanitized;
	}
}
