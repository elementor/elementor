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

	/**
	 * Elementor's own custom properties (`--e-transform-*`, `--nav-menu-icon-size`, ...) are an
	 * implementation detail of how a widget renders. An LLM writes real CSS properties, so
	 * exposing them would only invite unusable declarations.
	 */
	const INTERNAL_PROPERTY_PREFIX = '--';

	/**
	 * @param array                $controls Widget controls from get_config()['controls'].
	 * @param array<string, array> $style_overrides Registry overrides (excluded from generic index).
	 * @param string[]|null        $group_setting_keys Group-control sibling keys to skip; detected
	 *                                                 from the controls themselves when omitted.
	 * @return array<string, array{setting: string, resolver: string, responsive: bool}>
	 *         Keyed by "property" or "property@state". Only unique matches are kept.
	 */
	public static function build( array $controls, array $style_overrides = [], ?array $group_setting_keys = null ): array {
		$group_setting_keys = array_flip( $group_setting_keys ?? V3_Group_Control_Detector::setting_keys( $controls ) );
		$candidates = [];

		foreach ( $controls as $setting_key => $control ) {
			if ( ! is_array( $control ) || ! is_string( $setting_key ) ) {
				continue;
			}

			if ( isset( $group_setting_keys[ $setting_key ] ) ) {
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
				if ( null === $property || self::is_internal_property( $property ) ) {
					continue;
				}

				$state = self::extract_pseudo_state( $selector_template );
				$match_key = null === $state ? $property : $property . '@' . $state;

				if ( isset( $style_overrides[ $match_key ] ) ) {
					continue;
				}

				$candidates[ $match_key ][] = [
					'setting' => $setting_key,
					'resolver' => V3_Control_Value_Compatibility::infer_resolver( $control, $property ),
					'responsive' => V3_Control_Introspector::is_responsive_setting( $setting_key, $controls ),
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

	public static function is_internal_property( string $property ): bool {
		return str_starts_with( $property, self::INTERNAL_PROPERTY_PREFIX );
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

}
