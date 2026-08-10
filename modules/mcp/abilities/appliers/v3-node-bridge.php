<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Settings_Index;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Bridge_Registry;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Bridges V4-shape MCP inputs (global-class labels, plain CSS strings) onto the V3
 * settings shape (`_css_classes`, `custom_css`) for allowlisted V3 widgets so the
 * same LLM contract works for both widget generations.
 */
class V3_Node_Bridge {

	const V3_CUSTOM_CSS_SETTING = 'custom_css';
	const V3_CSS_CLASSES_SETTING = '_css_classes';

	const RESPONSIVE_SUFFIXES = [ '_tablet', '_mobile' ];

	const TYPOGRAPHY_SETTING_SUFFIXES = [
		'typography',
		'font_family',
		'font_weight',
		'font_style',
		'text_transform',
		'text_decoration',
		'font_size',
		'line_height',
		'letter_spacing',
		'word_spacing',
	];

	const TYPOGRAPHY_RESPONSIVE_SUFFIXES = [
		'font_size',
		'line_height',
		'letter_spacing',
		'word_spacing',
	];

	public static function is_v3_node( array $node ): bool {
		// V3 non-widget elements (containers/sections) are intentionally not supported at this layer for now.
		if ( 'widget' !== ( $node['elType'] ?? null ) ) {
			return false;
		}

		$type = $node['widgetType'] ?? null;

		return is_string( $type ) && Widget_Context_Helper::is_v3_allowlisted( $type );
	}

	/**
	 * Writes labels directly to V3's `_css_classes` (space-separated, deduped).
	 * V4 global class labels are the CSS class names themselves.
	 */
	public static function apply_classes( array &$node, array $labels ): void {
		$existing = self::split_css_classes( $node['settings'][ self::V3_CSS_CLASSES_SETTING ] ?? '' );
		$merged = array_values( array_unique( array_merge( $labels, $existing ) ) );

		$node['settings'][ self::V3_CSS_CLASSES_SETTING ] = implode( ' ', $merged );
	}

	public static function clear_classes( array &$node ): void {
		unset( $node['settings'][ self::V3_CSS_CLASSES_SETTING ] );
	}

	/**
	 * Clears all known mapped style settings and custom_css for a V3 widget.
	 * Mirrors V4 replace semantics (wipe existing style before applying a new one).
	 *
	 * @param array<string, mixed> $widget_config
	 */
	public static function clear_style_settings( array &$node, string $widget_type, array $widget_config = [] ): void {
		$keys = self::collect_style_setting_keys( $widget_type, $widget_config );
		$keys[] = self::V3_CUSTOM_CSS_SETTING;

		foreach ( array_unique( $keys ) as $key ) {
			unset( $node['settings'][ $key ] );
		}
	}

	/**
	 * Writes a CSS string into V3's `custom_css`. Plain declaration lists (`color: red;`)
	 * are wrapped in `selector { ... }` — the Pro custom-css module replaces `selector`
	 * with the widget's wrapper at render.
	 *
	 * @return string|null Warning message when Pro is missing, otherwise null.
	 */
	public static function apply_custom_css( array &$node, string $css_string ): ?string {
		$css_string = trim( $css_string );

		if ( '' === $css_string ) {
			unset( $node['settings'][ self::V3_CUSTOM_CSS_SETTING ] );
			return null;
		}

		if ( ! Utils::has_pro() ) {
			return __( 'V3 widget styles require Elementor Pro (Custom CSS module). Style not applied.', 'elementor' );
		}

		$node['settings'][ self::V3_CUSTOM_CSS_SETTING ] = self::wrap_with_selector( $css_string );

		return null;
	}

	/**
	 * @param array<string, mixed> $widget_config
	 * @return string[]
	 */
	private static function collect_style_setting_keys( string $widget_type, array $widget_config ): array {
		$keys = [];
		$overrides = V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );

		foreach ( $overrides as $override ) {
			$keys = array_merge( $keys, self::expand_override_keys( $override ) );
		}

		$generic = V3_Style_Settings_Index::build( $widget_config['controls'] ?? [], $overrides );
		foreach ( $generic as $rule ) {
			$setting = (string) ( $rule['setting'] ?? '' );
			if ( '' === $setting ) {
				continue;
			}
			$keys[] = $setting;
			if ( ! empty( $rule['responsive'] ) ) {
				foreach ( self::RESPONSIVE_SUFFIXES as $suffix ) {
					$keys[] = $setting . $suffix;
				}
			}
		}

		return $keys;
	}

	/**
	 * @param array<string, mixed> $override
	 * @return string[]
	 */
	private static function expand_override_keys( array $override ): array {
		if ( isset( $override['typography_prefix'] ) ) {
			return self::expand_typography_keys( (string) $override['typography_prefix'] );
		}

		if ( isset( $override['border_prefix'] ) ) {
			return self::expand_border_keys( (string) $override['border_prefix'] );
		}

		if ( isset( $override['box_shadow_prefix'] ) ) {
			$prefix = (string) $override['box_shadow_prefix'];
			return [
				$prefix . '_box_shadow_type',
				$prefix . '_box_shadow',
			];
		}

		$setting = $override['setting'] ?? null;
		if ( ! is_string( $setting ) || '' === $setting ) {
			return [];
		}

		$keys = [ $setting ];
		if ( ! empty( $override['responsive'] ) ) {
			foreach ( self::RESPONSIVE_SUFFIXES as $suffix ) {
				$keys[] = $setting . $suffix;
			}
		}

		if ( 'box_shadow' === ( $override['resolver'] ?? null ) ) {
			$keys[] = $setting . '_type';
		}

		return $keys;
	}

	/**
	 * @return string[]
	 */
	private static function expand_typography_keys( string $prefix ): array {
		$keys = [];

		foreach ( self::TYPOGRAPHY_SETTING_SUFFIXES as $suffix ) {
			$keys[] = $prefix . '_' . $suffix;
			if ( ! in_array( $suffix, self::TYPOGRAPHY_RESPONSIVE_SUFFIXES, true ) ) {
				continue;
			}
			foreach ( self::RESPONSIVE_SUFFIXES as $responsive_suffix ) {
				$keys[] = $prefix . '_' . $suffix . $responsive_suffix;
			}
		}

		return $keys;
	}

	/**
	 * @return string[]
	 */
	private static function expand_border_keys( string $prefix ): array {
		$keys = [
			$prefix . '_border',
			$prefix . '_width',
			$prefix . '_color',
		];

		foreach ( self::RESPONSIVE_SUFFIXES as $suffix ) {
			$keys[] = $prefix . '_width' . $suffix;
		}

		return $keys;
	}

	private static function wrap_with_selector( string $css ): string {
		if ( 1 === preg_match( '/^\s*[^{}]+\{\s*[\s\S]*\}\s*$/', $css ) ) {
			return $css;
		}

		return 'selector { ' . rtrim( $css, "; \t\n\r" ) . '; }';
	}

	private static function split_css_classes( string $value ): array {
		if ( '' === trim( $value ) ) {
			return [];
		}

		return array_values( array_filter(
			preg_split( '/\s+/', trim( $value ) ),
			static fn( $token ) => '' !== $token
		) );
	}
}
