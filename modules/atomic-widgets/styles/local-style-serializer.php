<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Projects an element's stored `styles` map into a flat, LLM/consumer-friendly
 * shape by picking its local style entry and the desktop / no-state variant.
 *
 * Output shape:
 *   [
 *     '__style_id'   => 'e-widget1-abc1234',
 *     '<cssProp>'    => '<value>',
 *     ...
 *     '__custom_css' => '<decoded raw>',   // only if present
 *     '__variants'   => [ <non-desktop variants raw> ],  // only if present
 *   ]
 */
class Local_Style_Serializer {

	const DESKTOP_BREAKPOINT = 'desktop';

	public static function serialize( array $styles ): array {
		$local_style = self::find_local_style( $styles );

		if ( ! $local_style || empty( $local_style['variants'] ) ) {
			return [];
		}

		[ $desktop_variant, $other_variants ] = self::split_variants( $local_style['variants'] );

		$projected = [];

		if ( isset( $local_style['id'] ) ) {
			$projected['__style_id'] = $local_style['id'];
		}

		if ( $desktop_variant ) {
			foreach ( Style_Props_To_Css::to_map( $desktop_variant['props'] ?? [] ) as $prop => $value ) {
				$projected[ $prop ] = (string) $value;
			}

			$custom_css = Utils::decode_string( $desktop_variant['custom_css']['raw'] ?? '', '' );
			if ( '' !== $custom_css ) {
				$projected['__custom_css'] = $custom_css;
			}
		}

		if ( ! empty( $other_variants ) ) {
			$projected['__variants'] = $other_variants;
		}

		return $projected;
	}

	private static function find_local_style( array $styles ): ?array {
		if ( empty( $styles ) ) {
			return null;
		}

		$local_style = reset( $styles );

		return is_array( $local_style ) ? $local_style : null;
	}

	/**
	 * @return array{0: array|null, 1: array<int, array>}
	 */
	private static function split_variants( array $variants ): array {
		$desktop_index = self::find_desktop_variant_index( $variants );

		if ( null === $desktop_index ) {
			return [ null, $variants ];
		}

		$desktop_variant = $variants[ $desktop_index ];
		unset( $variants[ $desktop_index ] );

		return [ $desktop_variant, array_values( $variants ) ];
	}

	private static function find_desktop_variant_index( array $variants ): ?int {
		foreach ( $variants as $index => $variant ) {
			$meta = $variant['meta'] ?? [];
			$is_desktop  = ( $meta['breakpoint'] ?? self::DESKTOP_BREAKPOINT ) === self::DESKTOP_BREAKPOINT;
			$is_no_state = null === ( $meta['state'] ?? null );

			if ( $is_desktop && $is_no_state ) {
				return $index;
			}
		}

		return null;
	}
}
