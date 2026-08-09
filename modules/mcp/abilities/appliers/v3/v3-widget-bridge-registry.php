<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Per-widget allowlists and CSS→legacy-setting overrides for MCP-allowlisted V3 widgets.
 *
 * Entry shape:
 * [
 *   'non_style_keys' => string[],
 *   'style_overrides' => [
 *     // Match key: "css-property" or "css-property@pseudo" (pseudo: hover|focus|active)
 *     'color' => [
 *       'setting' => 'title_color',          // single setting key
 *       'resolver' => 'color',               // V3_Value_Resolvers::resolve name
 *       'responsive' => true,               // write _tablet/_mobile suffix when breakpoint != desktop
 *     ],
 *     'font-size' => [
 *       'typography_prefix' => 'typography', // expands via resolve_typography_group
 *     ],
 *     'border' => [
 *       'border_prefix' => 'image_border',   // expands via resolve_border_shorthand
 *     ],
 *     'box-shadow' => [
 *       'setting' => 'image_box_shadow',     // writes box_shadow_type + box_shadow under this prefix
 *       'resolver' => 'box_shadow',
 *     ],
 *   ],
 * ]
 */
class V3_Widget_Bridge_Registry {

	/**
	 * @return array{non_style_keys: string[], style_overrides: array<string, array>}|null
	 */
	public static function get( string $widget_type ): ?array {
		$entries = self::entries();

		return $entries[ $widget_type ] ?? null;
	}

	/**
	 * @return string[]
	 */
	public static function get_non_style_keys( string $widget_type ): array {
		$entry = self::get( $widget_type );

		return $entry['non_style_keys'] ?? [];
	}

	/**
	 * @return array<string, array>
	 */
	public static function get_style_overrides( string $widget_type ): array {
		$entry = self::get( $widget_type );

		return $entry['style_overrides'] ?? [];
	}

	/**
	 * @return array<string, array{non_style_keys: string[], style_overrides: array<string, array>}>
	 */
	private static function entries(): array {
		return [
			'nav-menu' => self::nav_menu(),
			'theme-post-content' => self::theme_post_content(),
			'theme-post-title' => self::theme_post_title(),
			'theme-post-featured-image' => self::theme_post_featured_image(),
			'theme-post-excerpt' => self::theme_post_excerpt(),
			'theme-archive-title' => self::theme_archive_title(),
		];
	}

	private static function nav_menu(): array {
		return [
			'non_style_keys' => [
				'menu_name',
				'menu',
				'layout',
				'align_items',
				'pointer',
				'animation_line',
				'animation_framed',
				'animation_background',
				'animation_text',
				'submenu_icon',
				'dropdown',
				'full_width',
				'text_align',
				'toggle',
				'toggle_icon_normal',
				'toggle_icon_hover_animation',
				'toggle_icon_active',
				'toggle_align',
			],
			'style_overrides' => array_merge(
				self::typography_overrides( 'dropdown_typography' ),
				self::typography_overrides( 'menu_typography' ),
				[
					'color' => [ 'setting' => 'color_menu_item', 'resolver' => 'color' ],
					'color@hover' => [ 'setting' => 'color_menu_item_hover', 'resolver' => 'color' ],
					'color@active' => [ 'setting' => 'color_menu_item_active', 'resolver' => 'color' ],
					'background-color@hover' => [ 'setting' => 'pointer_color_menu_item_hover', 'resolver' => 'color' ],
					'background-color@active' => [ 'setting' => 'pointer_color_menu_item_active', 'resolver' => 'color' ],
					'padding-left' => [ 'setting' => 'padding_horizontal_menu_item', 'resolver' => 'dimension', 'responsive' => true ],
					'padding-right' => [ 'setting' => 'padding_horizontal_menu_item', 'resolver' => 'dimension', 'responsive' => true ],
					'padding-top' => [ 'setting' => 'padding_vertical_menu_item', 'resolver' => 'dimension', 'responsive' => true ],
					'padding-bottom' => [ 'setting' => 'padding_vertical_menu_item', 'resolver' => 'dimension', 'responsive' => true ],
				]
			),
		];
	}

	private static function theme_post_content(): array {
		return [
			'non_style_keys' => [],
			'style_overrides' => array_merge(
				self::typography_overrides( 'typography' ),
				[
					'color' => [ 'setting' => 'text_color', 'resolver' => 'color' ],
					'text-align' => [ 'setting' => 'align', 'resolver' => 'text' ],
				]
			),
		];
	}

	private static function theme_post_title(): array {
		return [
			'non_style_keys' => [
				'title',
				'link',
				'size',
				'header_size',
			],
			'style_overrides' => self::heading_style_overrides(),
		];
	}

	private static function theme_archive_title(): array {
		return [
			'non_style_keys' => [
				'title',
				'link',
				'size',
				'header_size',
			],
			'style_overrides' => self::heading_style_overrides(),
		];
	}

	private static function theme_post_excerpt(): array {
		return [
			'non_style_keys' => [
				'excerpt',
			],
			'style_overrides' => array_merge(
				self::typography_overrides( 'typography' ),
				[
					'color' => [ 'setting' => 'title_color', 'resolver' => 'color' ],
					'text-align' => [ 'setting' => 'align', 'resolver' => 'text' ],
					'margin-bottom' => [ 'setting' => 'paragraph_spacing', 'resolver' => 'dimension', 'responsive' => true ],
				]
			),
		];
	}

	private static function theme_post_featured_image(): array {
		return [
			'non_style_keys' => [
				'image',
				'image_size',
				'image_custom_dimension',
				'caption_source',
				'caption',
				'link_to',
				'link',
				'open_lightbox',
			],
			'style_overrides' => array_merge(
				self::typography_overrides( 'caption_typography' ),
				[
					'text-align' => [ 'setting' => 'align', 'resolver' => 'text' ],
					'width' => [ 'setting' => 'width', 'resolver' => 'dimension', 'responsive' => true ],
					'max-width' => [ 'setting' => 'space', 'resolver' => 'dimension', 'responsive' => true ],
					'height' => [ 'setting' => 'height', 'resolver' => 'dimension', 'responsive' => true ],
					'object-fit' => [ 'setting' => 'object_fit', 'resolver' => 'text' ],
					'object-position' => [ 'setting' => 'object_position', 'resolver' => 'text' ],
					'opacity' => [ 'setting' => 'opacity', 'resolver' => 'text' ],
					'opacity@hover' => [ 'setting' => 'opacity_hover', 'resolver' => 'text' ],
					'border-radius' => [ 'setting' => 'image_border_radius', 'resolver' => 'sides', 'responsive' => true ],
					'border' => [ 'border_prefix' => 'image_border' ],
					'box-shadow' => [ 'box_shadow_prefix' => 'image_box_shadow' ],
				]
			),
		];
	}

	/**
	 * Shared heading-style overrides for theme-post-title / theme-archive-title.
	 *
	 * @return array<string, array>
	 */
	private static function heading_style_overrides(): array {
		return array_merge(
			self::typography_overrides( 'typography' ),
			[
				'color' => [ 'setting' => 'title_color', 'resolver' => 'color' ],
				'color@hover' => [ 'setting' => 'title_hover_color', 'resolver' => 'color' ],
				'text-align' => [ 'setting' => 'align', 'resolver' => 'text' ],
				'mix-blend-mode' => [ 'setting' => 'blend_mode', 'resolver' => 'text' ],
			]
		);
	}

	/**
	 * @return array<string, array{typography_prefix: string, responsive?: bool}>
	 */
	private static function typography_overrides( string $prefix ): array {
		$props = [
			'font-family',
			'font-weight',
			'font-style',
			'text-transform',
			'text-decoration',
			'font-size',
			'line-height',
			'letter-spacing',
			'word-spacing',
		];

		$overrides = [];
		foreach ( $props as $prop ) {
			$overrides[ $prop ] = [
				'typography_prefix' => $prefix,
				'responsive' => in_array( $prop, [ 'font-size', 'line-height', 'letter-spacing', 'word-spacing' ], true ),
			];
		}

		return $overrides;
	}
}
