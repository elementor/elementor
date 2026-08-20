<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Auto_Mapper;
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
	const V3_DYNAMIC_SETTING = '__dynamic__';

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
	 * @param array<string, mixed> $node           Subtree node (by reference).
	 * @param string               $widget_type    V3 widget type name.
	 * @param array<string, mixed> $widget_config  Widget config from Widget_Context_Helper::get_widget_config().
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
	public static function apply_custom_css( array &$node, string $css_string, string $widget_type = '' ): ?string {
		$css_string = trim( $css_string );

		if ( '' === $css_string ) {
			unset( $node['settings'][ self::V3_CUSTOM_CSS_SETTING ] );
			return null;
		}

		if ( ! Utils::has_pro() ) {
			$widget_label = '' !== $widget_type ? $widget_type : esc_html__( 'this V3 widget', 'elementor' );

			return sprintf(
				/* translators: %s: V3 widget type name. */
				__( 'V3 widget styles for `%s` require Elementor Pro (Custom CSS module) and were not applied. Do not retry the `style` field for this widget in the current environment — either fall back to `settings`-only edits, or ask the user to install and activate Elementor Pro.', 'elementor' ),
				$widget_label
			);
		}

		$node['settings'][ self::V3_CUSTOM_CSS_SETTING ] = self::wrap_with_selector( $css_string );

		return null;
	}

	/**
	 * @param string               $widget_type    V3 widget type name.
	 * @param array<string, mixed> $widget_config  Widget config from Widget_Context_Helper::get_widget_config().
	 * @return string[]
	 */
	private static function collect_style_setting_keys( string $widget_type, array $widget_config ): array {
		$keys = [];
		$controls = is_array( $widget_config['controls'] ?? null ) ? $widget_config['controls'] : [];
		$inner_elements = V3_Widget_Bridge_Registry::get_inner_elements( $widget_type );

		if ( ! empty( $inner_elements ) ) {
			foreach ( $inner_elements as $inner_element ) {
				$pattern = $inner_element['control_pattern'] ?? '';
				$keys = array_merge(
					$keys,
					V3_Auto_Mapper::collect_setting_keys_for_pattern( $controls, (string) $pattern )
				);

				$mapping = V3_Auto_Mapper::for_scope( $widget_config, $inner_element );
				$keys = array_merge( $keys, self::keys_from_mapping( $mapping, $controls ) );
			}

			$wrapper_overrides = V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );
			foreach ( $wrapper_overrides as $override ) {
				$keys = array_merge( $keys, self::expand_override_keys( $override ) );
			}

			return array_values( array_unique( $keys ) );
		}

		$overrides = V3_Widget_Bridge_Registry::get_style_overrides( $widget_type );

		foreach ( $overrides as $override ) {
			$keys = array_merge( $keys, self::expand_override_keys( $override ) );
		}

		$generic = V3_Style_Settings_Index::build( $controls, $overrides );
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
	 * @param array{overrides: array<string, array>, generic_index: array<string, array>} $mapping
	 * @param array<string, mixed>                                                       $controls
	 * @return string[]
	 */
	private static function keys_from_mapping( array $mapping, array $controls ): array {
		$keys = [];

		foreach ( $mapping['overrides'] ?? [] as $override ) {
			$keys = array_merge( $keys, self::expand_override_keys( $override ) );
		}

		foreach ( $mapping['generic_index'] ?? [] as $rule ) {
			$setting = (string) ( $rule['setting'] ?? '' );
			if ( '' === $setting ) {
				continue;
			}

			$keys[] = $setting;

			if ( ! empty( $rule['responsive'] ) ) {
				foreach ( self::RESPONSIVE_SUFFIXES as $suffix ) {
					if ( isset( $controls[ $setting . $suffix ] ) ) {
						$keys[] = $setting . $suffix;
					}
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
