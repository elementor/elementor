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
 *
 * Rendering itself is delegated to `Local_Style` / `Local_Style_Variant` so each
 * domain object owns its own CSS output — the serializer only adapts the shape.
 */
class Local_Style_Serializer {

	public static function serialize( array $styles ): array {
		$local_style = Local_Style::from_styles_map( $styles );

		if ( null === $local_style ) {
			return [];
		}

		return [
			'__style_id' => $local_style->id(),
			'css'        => $local_style->to_css(),
		];
	}
}
