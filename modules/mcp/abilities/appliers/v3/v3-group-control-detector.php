<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Detects `Group_Control_*` usages in a V3 widget's controls by their key naming convention.
 *
 * A group control writes several sibling settings that only make sense together, so both the
 * mapper (which routes a CSS property to the whole group) and the generic single-setting index
 * (which must ignore those siblings) resolve them from here instead of hand-written lists.
 */
class V3_Group_Control_Detector {

	const TYPOGRAPHY_SUFFIXES = [
		'typography',
		'font_family',
		'font_size',
		'font_weight',
		'font_style',
		'text_transform',
		'text_decoration',
		'line_height',
		'letter_spacing',
		'word_spacing',
	];

	const BORDER_SUFFIXES = [
		'border',
		'width',
		'color',
	];

	const BOX_SHADOW_SUFFIXES = [
		'box_shadow',
		'box_shadow_type',
		'box_shadow_position',
	];

	const RESPONSIVE_SUFFIXES = [
		'',
		'_widescreen',
		'_laptop',
		'_tablet_extra',
		'_tablet',
		'_mobile_extra',
		'_mobile',
	];

	/**
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function typography_prefixes( array $controls ): array {
		$prefixes = [];

		foreach ( array_keys( $controls ) as $key ) {
			if ( preg_match( '/^(?:(.+)_)?typography_(?:typography|font_|line_|letter_|word_|text_)/', $key, $matches ) ) {
				$prefix = '' === ( $matches[1] ?? '' ) ? 'typography' : $matches[1] . '_typography';
				$prefixes[ $prefix ] = true;
			}
		}

		return array_keys( $prefixes );
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function border_prefixes( array $controls ): array {
		$prefixes = [];

		foreach ( array_keys( $controls ) as $key ) {
			if ( preg_match( '/^(.+)_border_(?:border|width|color)$/', $key, $matches ) ) {
				$prefixes[ $matches[1] . '_border' ] = true;
			}
		}

		return array_keys( $prefixes );
	}

	/**
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function box_shadow_prefixes( array $controls ): array {
		$prefixes = [];

		foreach ( array_keys( $controls ) as $key ) {
			if ( preg_match( '/^(.+)_box_shadow(?:_type)?$/', $key, $matches ) ) {
				$prefixes[ $matches[1] ] = true;
			}
		}

		return array_keys( $prefixes );
	}

	/**
	 * Exact sibling keys owned by the detected groups. Matching is exact rather than by prefix so
	 * that a standalone control sharing a group's prefix (`image_border_radius` next to the
	 * `image_border` group) stays available to the generic index.
	 *
	 * @param array<string, mixed> $controls
	 * @return string[]
	 */
	public static function setting_keys( array $controls ): array {
		$keys = [];

		$groups = [
			[ self::typography_prefixes( $controls ), self::TYPOGRAPHY_SUFFIXES ],
			[ self::border_prefixes( $controls ), self::BORDER_SUFFIXES ],
			[ self::box_shadow_prefixes( $controls ), self::BOX_SHADOW_SUFFIXES ],
		];

		foreach ( $groups as [ $prefixes, $suffixes ] ) {
			foreach ( $prefixes as $prefix ) {
				foreach ( $suffixes as $suffix ) {
					foreach ( self::RESPONSIVE_SUFFIXES as $responsive_suffix ) {
						$keys[ $prefix . '_' . $suffix . $responsive_suffix ] = true;
					}
				}
			}
		}

		return array_keys( array_intersect_key( $keys, $controls ) );
	}
}
