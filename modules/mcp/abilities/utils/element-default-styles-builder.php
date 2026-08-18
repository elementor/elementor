<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\AtomicWidgets\Styles\Style_Props_To_Css;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds the effective default-style CSS map that the browser would apply to a V4 atomic
 * element before any inline/global class overrides.
 *
 * Merge order mirrors the render-time class order in
 * modules/atomic-widgets/elements/base/_macros.html.twig — widget `base_styles` first,
 * then the kit's site-wide default style for the element's rendered tag on top (kit wins on conflict).
 */
class Element_Default_Styles_Builder {

	public static function build( array $base_styles, ?string $tag, ?Default_Styles_Repository $repository ): array {
		$props = self::collect_merged_props( $base_styles, $tag, $repository );

		if ( empty( $props ) ) {
			return [];
		}

		return Style_Props_To_Css::to_map( $props );
	}

	public static function collect_merged_props( array $base_styles, ?string $tag, ?Default_Styles_Repository $repository ): array {
		$props = self::collect_base_style_props( $base_styles );

		$kit_props = self::collect_kit_default_props( $tag, $repository );

		if ( ! empty( $kit_props ) ) {
			$props = array_merge( $props, $kit_props );
		}

		return $props;
	}

	public static function collect_base_style_props( array $base_styles ): array {
		$props = [];

		foreach ( $base_styles as $style ) {
			$props = array_merge( $props, self::collect_variant_props( $style['variants'] ?? [] ) );
		}

		return $props;
	}

	private static function collect_kit_default_props( ?string $tag, ?Default_Styles_Repository $repository ): array {
		if ( null === $tag || null === $repository ) {
			return [];
		}

		$item = $repository->get( $tag );

		if ( ! is_array( $item ) ) {
			return [];
		}

		return self::collect_variant_props( $item['variants'] ?? [] );
	}

	private static function collect_variant_props( array $variants ): array {
		$props = [];

		foreach ( $variants as $variant ) {
			$variant_props = $variant['props'] ?? [];

			if ( is_array( $variant_props ) ) {
				$props = array_merge( $props, $variant_props );
			}
		}

		return $props;
	}
}
