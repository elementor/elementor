<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Projects an element's stored `styles` map into the MCP round-trip shape:
 *
 *   [
 *     '__style_id' => 'e-widget1-abc1234',
 *     'css'        => 'color: red; &:hover { color: blue; } @media(--mobile) { ... }',
 *   ]
 *
 * The `css` value follows the same raw CSS format that the write-side tools
 * (manage-classes, manage-elements.update.style, build-composition.style)
 * accept as input, so consumers can round-trip styles without transformation.
 */
class Local_Style_Serializer {

	public static function serialize( array $styles ): array {
		$local_style = self::find_local_style( $styles );

		if ( ! $local_style || empty( $local_style['variants'] ) ) {
			return [];
		}

		$projected = [];

		if ( isset( $local_style['id'] ) ) {
			$projected['__style_id'] = $local_style['id'];
		}

		$projected['css'] = Style_Variants_To_Css::to_css( $local_style['variants'] );

		return $projected;
	}

	private static function find_local_style( array $styles ): ?array {
		if ( empty( $styles ) ) {
			return null;
		}

		$local_style = reset( $styles );

		return is_array( $local_style ) ? $local_style : null;
	}
}
