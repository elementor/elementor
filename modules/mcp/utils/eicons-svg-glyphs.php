<?php

namespace Elementor\Modules\Mcp\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Eicons_Svg_Glyphs {

	const SVG_PATH = ELEMENTOR_PATH . 'assets/lib/eicons/fonts/eicons.svg';

	private static ?array $font_metrics = null;

	private static ?array $paths_by_name = null;

	public static function markup_for_icon( string $icon_class ): string {
		$glyph_name = self::glyph_name_from_class( $icon_class );

		if ( '' === $glyph_name ) {
			return '';
		}

		$path = self::path_for_glyph( $glyph_name );

		if ( '' === $path ) {
			return '';
		}

		self::ensure_loaded();

		$ascent = (int) ( self::$font_metrics['ascent'] ?? 850 );
		$units  = (int) ( self::$font_metrics['units_per_em'] ?? 1000 );

		return sprintf(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %1$d %1$d" width="100%%" height="100%%" aria-hidden="true"><g transform="scale(1,-1) translate(0,-%2$d)"><path fill="currentColor" d="%3$s"/></g></svg>',
			$units,
			$ascent,
			esc_attr( $path )
		);
	}

	private static function glyph_name_from_class( string $icon_class ): string {
		$icon_class = trim( $icon_class );

		if ( '' === $icon_class ) {
			return '';
		}

		if ( preg_match( '/\beicon-([a-z0-9-]+)\b/i', $icon_class, $matches ) ) {
			return strtolower( $matches[1] );
		}

		return '';
	}

	private static function path_for_glyph( string $glyph_name ): string {
		self::ensure_loaded();

		return (string) ( self::$paths_by_name[ $glyph_name ] ?? '' );
	}

	private static function ensure_loaded(): void {
		if ( null !== self::$paths_by_name ) {
			return;
		}

		self::$paths_by_name = [];
		self::$font_metrics = [
			'units_per_em' => 1000,
			'ascent' => 850,
		];

		if ( ! is_readable( self::SVG_PATH ) ) {
			return;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$svg = file_get_contents( self::SVG_PATH );

		if ( ! is_string( $svg ) || '' === $svg ) {
			return;
		}

		if ( preg_match( '/units-per-em="(\d+)"/', $svg, $units_match ) ) {
			self::$font_metrics['units_per_em'] = (int) $units_match[1];
		}

		if ( preg_match( '/ascent="(\d+)"/', $svg, $ascent_match ) ) {
			self::$font_metrics['ascent'] = (int) $ascent_match[1];
		}

		if ( preg_match_all( '/<glyph\s+glyph-name="([^"]+)"[^>]*\sd="([^"]+)"/', $svg, $matches, PREG_SET_ORDER ) ) {
			foreach ( $matches as $match ) {
				self::$paths_by_name[ $match[1] ] = $match[2];
			}
		}
	}
}
