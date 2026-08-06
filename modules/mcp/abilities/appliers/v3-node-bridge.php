<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

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
	const V3_DYNAMIC_SETTING = '__dynamic__';

	/**
	 * Seeds each control's `dynamic.default` into the node's `__dynamic__` settings map when the
	 * caller did not provide one. Without this, controls whose default is a dynamic tag (e.g.
	 * `theme-post-title.title` -> post-title tag) render as their static fallback in the editor
	 * canvas immediately after mutation and only pick up the dynamic value on a full refresh.
	 *
	 * @param array $node          Subtree node (by reference).
	 * @param array $widget_config Widget config from Widget_Context_Helper::get_widget_config().
	 */
	public static function seed_dynamic_defaults( array &$node, array $widget_config ): void {
		if ( ! self::is_v3_node( $node ) ) {
			return;
		}

		$controls = $widget_config['controls'] ?? [];
		if ( empty( $controls ) || ! is_array( $controls ) ) {
			return;
		}

		$existing = $node['settings'][ self::V3_DYNAMIC_SETTING ] ?? [];

		foreach ( $controls as $name => $control ) {
			$dynamic_default = $control['dynamic']['default'] ?? null;

			if ( ! is_string( $dynamic_default ) || '' === $dynamic_default ) {
				continue;
			}

			if ( array_key_exists( $name, $existing ) ) {
				continue;
			}

			$existing[ $name ] = $dynamic_default;
		}

		if ( ! empty( $existing ) ) {
			$node['settings'][ self::V3_DYNAMIC_SETTING ] = $existing;
		}
	}

	public static function is_v3_node( array $node ): bool {
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

		if ( empty( $merged ) ) {
			unset( $node['settings'][ self::V3_CSS_CLASSES_SETTING ] );
			return;
		}

		$node['settings'][ self::V3_CSS_CLASSES_SETTING ] = implode( ' ', $merged );
	}

	public static function clear_classes( array &$node ): void {
		unset( $node['settings'][ self::V3_CSS_CLASSES_SETTING ] );
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

	private static function wrap_with_selector( string $css ): string {
		if ( false !== strpos( $css, '{' ) ) {
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
