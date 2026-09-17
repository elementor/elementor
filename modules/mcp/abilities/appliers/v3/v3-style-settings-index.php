<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Indexes a V3 widget's controls for generic CSS-property → setting reverse lookup.
 *
 * Only considers simple selector-backed controls (not Group_Control_* siblings).
 * Group controls are handled exclusively via registry style_overrides.
 */
class V3_Style_Settings_Index {

	const GROUP_CONTROL_PREFIXES = [
		'typography_',
		'text_stroke_',
		'text_shadow_',
		'box_shadow_',
		'border_',
		'background_',
		'css_filters_',
		'image_border_',
		'image_box_shadow_',
		'caption_typography_',
		'caption_text_shadow_',
		'menu_typography_',
		'dropdown_typography_',
		'dropdown_border_',
		'dropdown_box_shadow_',
		'dropdown_divider_',
	];

	/**
	 * @param array                $controls Widget controls from get_config()['controls'].
	 * @param array<string, array> $style_overrides Registry overrides (excluded from generic index).
	 * @return array<string, array{setting: string, resolver: string, responsive: bool}>
	 *         Keyed by "property" or "property@state". Only unique matches are kept.
	 */
	public static function build( array $controls, array $style_overrides = [] ): array {
		$candidates = [];

		foreach ( $controls as $setting_key => $control ) {
			if ( ! is_array( $control ) || ! is_string( $setting_key ) ) {
				continue;
			}

			if ( self::is_group_control_key( $setting_key ) ) {
				continue;
			}

			$selectors = $control['selectors'] ?? null;
			if ( ! is_array( $selectors ) || empty( $selectors ) ) {
				continue;
			}

			foreach ( $selectors as $selector_template => $css_template ) {
				if ( ! is_string( $selector_template ) || ! is_string( $css_template ) ) {
					continue;
				}

				$property = self::extract_css_property( $css_template );
				if ( null === $property ) {
					continue;
				}

				$state = self::extract_pseudo_state( $selector_template );
				$match_key = null === $state ? $property : $property . '@' . $state;

				if ( isset( $style_overrides[ $match_key ] ) ) {
					continue;
				}

				$candidates[ $match_key ][] = [
					'setting' => $setting_key,
					'resolver' => self::infer_resolver( $control, $property ),
					'responsive' => isset( $controls[ $setting_key . '_tablet' ] ) || isset( $controls[ $setting_key . '_mobile' ] ),
				];
			}
		}

		$index = [];
		foreach ( $candidates as $match_key => $matches ) {
			if ( 1 !== count( $matches ) ) {
				continue;
			}
			$index[ $match_key ] = $matches[0];
		}

		return $index;
	}

	private static function is_group_control_key( string $setting_key ): bool {
		foreach ( self::GROUP_CONTROL_PREFIXES as $prefix ) {
			if ( str_starts_with( $setting_key, $prefix ) ) {
				return true;
			}
		}

		return false;
	}

	private static function extract_css_property( string $css_template ): ?string {
		if ( ! preg_match( '/^\s*([a-zA-Z-]+)\s*:/', $css_template, $matches ) ) {
			return null;
		}

		return strtolower( $matches[1] );
	}

	private static function extract_pseudo_state( string $selector_template ): ?string {
		if ( preg_match( '/:(hover|focus|active)\b/i', $selector_template, $matches ) ) {
			return strtolower( $matches[1] );
		}

		return null;
	}

	private static function infer_resolver( array $control, string $property ): string {
		$type = $control['type'] ?? null;

		if ( 'color' === $type || str_ends_with( $property, 'color' ) || 'fill' === $property ) {
			return 'color';
		}

		if ( in_array( $property, [ 'padding', 'margin', 'border-radius' ], true ) ) {
			return 'sides';
		}

		if ( in_array( $type, [ 'slider', 'dimensions' ], true ) ) {
			return 'dimensions' === $type ? 'sides' : 'dimension';
		}

		if ( in_array( $property, [ 'width', 'height', 'max-width', 'min-height', 'font-size', 'line-height', 'letter-spacing', 'word-spacing', 'opacity', 'top', 'right', 'bottom', 'left' ], true ) ) {
			return 'dimension';
		}

		if ( 'box-shadow' === $property ) {
			return 'box_shadow';
		}

		if ( 'border' === $property ) {
			return 'border';
		}

		return 'text';
	}
}
