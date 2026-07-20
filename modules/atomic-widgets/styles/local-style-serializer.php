<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Projects an element's stored `styles` map into a flat, LLM/consumer-friendly
 * shape by picking the local style (`type=class`, id prefixed `s-`) and its
 * desktop / no-state variant.
 *
 * Output shape:
 *   [
 *     '__style_id'   => 's-abc',
 *     '<cssProp>'    => '<value>',
 *     ...
 *     '__custom_css' => '<decoded raw>',   // only if present
 *     '__variants'   => [ <non-desktop variants raw> ],  // only if present
 *   ]
 */
class Local_Style_Serializer {

	const LOCAL_STYLE_ID_PREFIX = 's-';
	const LOCAL_STYLE_TYPE      = 'class';
	const DESKTOP_BREAKPOINT    = 'desktop';

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
		foreach ( $styles as $style_id => $style_def ) {
			$is_local = is_array( $style_def )
				&& ( $style_def['type'] ?? null ) === self::LOCAL_STYLE_TYPE
				&& str_starts_with( (string) $style_id, self::LOCAL_STYLE_ID_PREFIX );

			if ( $is_local ) {
				return $style_def;
			}
		}

		return null;
	}

	/**
	 * @return array{0: array|null, 1: array<int, array>}
	 */
	private static function split_variants( array $variants ): array {
		$desktop_variant = null;
		$other_variants  = [];

		foreach ( $variants as $variant ) {
			$meta        = $variant['meta'] ?? [];
			$is_desktop  = ( $meta['breakpoint'] ?? self::DESKTOP_BREAKPOINT ) === self::DESKTOP_BREAKPOINT;
			$is_no_state = null === ( $meta['state'] ?? null );

			if ( $is_desktop && $is_no_state && null === $desktop_variant ) {
				$desktop_variant = $variant;
				continue;
			}

			$other_variants[] = $variant;
		}

		return [ $desktop_variant, $other_variants ];
	}
}
