<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Bridges V4-shape MCP inputs (global-class labels) onto the V3 settings shape
 * (`_css_classes`) for mapped V3 widgets so the same LLM contract works for both
 * widget generations.
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
	 * @param array $node     Subtree node (by reference).
	 * @param array $controls Widget controls from Widget_Base::get_controls().
	 */
	public static function seed_dynamic_defaults( array &$node, array $controls ): void {
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

		if ( ! is_string( $type ) ) {
			return false;
		}

		return Widget_Context_Helper::is_v3_supported( $type );
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
