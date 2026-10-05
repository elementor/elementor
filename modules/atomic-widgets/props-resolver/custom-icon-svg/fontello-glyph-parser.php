<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Fontello_Glyph_Parser {
	private static array $glyph_indexes = [];

	public static function reset_memory(): void {
		self::$glyph_indexes = [];
	}

	public static function to_svg( string $config_json, string $svg_font, string $icon_name, string $prefix = '' ): string {
		$from_config = self::svg_path_from_config( $config_json, $icon_name, $prefix );

		if ( $from_config ) {
			return $from_config;
		}

		$codepoint = self::find_codepoint( $config_json, $icon_name, $prefix );
		$glyph = self::find_glyph( $svg_font, $codepoint ?? -1, $icon_name );

		if ( ! $glyph ) {
			return '';
		}

		$path = $glyph['d'];
		$units = $glyph['units'];
		$advance = $glyph['advance'];

		if ( '' === $path || $units <= 0 || $advance <= 0 ) {
			return '';
		}

		return self::markup( $path, $advance, $units );
	}

	private static function svg_path_from_config( string $config_json, string $icon_name, string $prefix ): string {
		$data = json_decode( $config_json, true );

		if ( ! is_array( $data ) || empty( $data['glyphs'] ) || ! is_array( $data['glyphs'] ) ) {
			return '';
		}

		$candidates = self::name_candidates( $icon_name, $prefix );

		foreach ( $data['glyphs'] as $glyph ) {
			if ( ! is_array( $glyph ) ) {
				continue;
			}

			$css = isset( $glyph['css'] ) && is_string( $glyph['css'] ) ? $glyph['css'] : '';

			if ( '' === $css || ! in_array( $css, $candidates, true ) ) {
				continue;
			}

			$path = '';

			if ( isset( $glyph['svg'] ) && is_string( $glyph['svg'] ) ) {
				$path = $glyph['svg'];
			} elseif ( isset( $glyph['svg']['path'] ) && is_string( $glyph['svg']['path'] ) ) {
				$path = $glyph['svg']['path'];
			}

			if ( '' === $path ) {
				return '';
			}

			$advance = isset( $glyph['svg']['width'] ) && is_numeric( $glyph['svg']['width'] )
				? (int) $glyph['svg']['width']
				: 1000;

			return self::markup( $path, $advance > 0 ? $advance : 1000, 1000 );
		}

		return '';
	}

	private static function markup( string $path, int $advance, int $units ): string {
		$escaped_path = htmlspecialchars( $path, ENT_QUOTES, 'UTF-8' );

		return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' . $advance . ' ' . $units . '" fill="currentColor" width="100%" height="100%">'
			. '<g transform="translate(0,' . $units . ') scale(1,-1)">'
			. '<path d="' . $escaped_path . '" fill="currentColor"></path>'
			. '</g>'
			. '</svg>';
	}

	private static function find_codepoint( string $config_json, string $icon_name, string $prefix ): ?int {
		$data = json_decode( $config_json, true );

		if ( ! is_array( $data ) || empty( $data['glyphs'] ) || ! is_array( $data['glyphs'] ) ) {
			return null;
		}

		$candidates = self::name_candidates( $icon_name, $prefix );

		foreach ( $data['glyphs'] as $glyph ) {
			if ( ! is_array( $glyph ) ) {
				continue;
			}

			$css = isset( $glyph['css'] ) && is_string( $glyph['css'] ) ? $glyph['css'] : '';

			if ( '' === $css || ! in_array( $css, $candidates, true ) ) {
				continue;
			}

			if ( ! isset( $glyph['code'] ) || ! is_numeric( $glyph['code'] ) ) {
				return null;
			}

			return (int) $glyph['code'];
		}

		return null;
	}

	private static function name_candidates( string $icon_name, string $prefix ): array {
		$names = [ $icon_name ];

		if ( '' !== $prefix && str_starts_with( $icon_name, $prefix ) ) {
			$names[] = substr( $icon_name, strlen( $prefix ) );
		}

		return array_values( array_unique( array_filter( $names, static fn( $name ) => '' !== $name ) ) );
	}

	private static function find_glyph( string $svg_font, int $codepoint, string $icon_name ): ?array {
		$index = self::glyph_index( $svg_font );

		if ( isset( $index['by_name'][ $icon_name ] ) ) {
			return $index['by_name'][ $icon_name ];
		}

		if ( $codepoint >= 0 && isset( $index['by_code'][ $codepoint ] ) ) {
			return $index['by_code'][ $codepoint ];
		}

		return null;
	}

	/**
	 * @return array{by_name: array<string, array{d: string, units: int, advance: int}>, by_code: array<int, array{d: string, units: int, advance: int}>}
	 */
	private static function glyph_index( string $svg_font ): array {
		$key = md5( $svg_font );

		if ( isset( self::$glyph_indexes[ $key ] ) ) {
			return self::$glyph_indexes[ $key ];
		}

		$index = [
			'by_name' => [],
			'by_code' => [],
		];

		$document = new \DOMDocument();
		$previous = libxml_use_internal_errors( true );
		$loaded = $document->loadXML( self::strip_doctype( $svg_font ), LIBXML_NONET | LIBXML_NOERROR | LIBXML_NOWARNING );
		libxml_clear_errors();
		libxml_use_internal_errors( $previous );

		if ( ! $loaded ) {
			self::$glyph_indexes[ $key ] = $index;

			return $index;
		}

		$xpath = new \DOMXPath( $document );
		$font = $xpath->query( '//*[local-name()="font"]' )->item( 0 );
		$face = $xpath->query( '//*[local-name()="font-face"]' )->item( 0 );
		$font_advance = self::positive_int_attribute( $font, 'horiz-adv-x', 1000 );
		$units = self::positive_int_attribute( $face, 'units-per-em', $font_advance );

		foreach ( $xpath->query( '//*[local-name()="glyph"]' ) as $node ) {
			if ( ! $node instanceof \DOMElement ) {
				continue;
			}

			$d = $node->getAttribute( 'd' );

			if ( '' === $d ) {
				continue;
			}

			$record = [
				'd' => $d,
				'units' => $units,
				'advance' => self::positive_int_attribute( $node, 'horiz-adv-x', $font_advance ),
			];
			$glyph_name = $node->getAttribute( 'glyph-name' );
			$code = self::unicode_codepoint( $node->getAttribute( 'unicode' ) );

			if ( '' !== $glyph_name ) {
				$index['by_name'][ $glyph_name ] = $record;
			}

			if ( null !== $code ) {
				$index['by_code'][ $code ] = $record;
			}
		}

		self::$glyph_indexes[ $key ] = $index;

		return $index;
	}

	private static function strip_doctype( string $svg_font ): string {
		$stripped = preg_replace( '/<!DOCTYPE[^>]*>/si', '', $svg_font );

		return is_string( $stripped ) ? $stripped : $svg_font;
	}

	private static function unicode_codepoint( string $unicode ): ?int {
		if ( '' === $unicode ) {
			return null;
		}

		if ( function_exists( 'mb_ord' ) ) {
			$code = mb_ord( $unicode, 'UTF-8' );

			return false === $code ? null : $code;
		}

		$converted = unpack( 'N', mb_convert_encoding( $unicode, 'UCS-4BE', 'UTF-8' ) );

		return is_array( $converted ) ? (int) $converted[1] : null;
	}

	private static function positive_int_attribute( $node, string $attribute, int $fallback ): int {
		if ( ! $node instanceof \DOMElement ) {
			return $fallback;
		}

		$value = $node->getAttribute( $attribute );

		if ( '' === $value || ! is_numeric( $value ) ) {
			return $fallback;
		}

		$int = (int) $value;

		return $int > 0 ? $int : $fallback;
	}
}
