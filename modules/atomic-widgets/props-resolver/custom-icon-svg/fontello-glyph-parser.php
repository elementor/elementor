<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Fontello_Glyph_Parser {
	public static function to_svg( string $config_json, string $svg_font, string $icon_name, string $prefix = '' ): string {
		$codepoint = self::find_codepoint( $config_json, $icon_name, $prefix );

		if ( null === $codepoint ) {
			return '';
		}

		$glyph = self::find_glyph( $svg_font, $codepoint, $icon_name );

		if ( ! $glyph ) {
			return '';
		}

		$path = $glyph['d'];
		$units = $glyph['units'];
		$advance = $glyph['advance'];

		if ( '' === $path || $units <= 0 || $advance <= 0 ) {
			return '';
		}

		$escaped_path = htmlspecialchars( $path, ENT_QUOTES, 'UTF-8' );

		return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' . $advance . ' ' . $units . '">'
			. '<g transform="translate(0,' . $units . ') scale(1,-1)">'
			. '<path d="' . $escaped_path . '"></path>'
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
		$document = new \DOMDocument();
		$previous = libxml_use_internal_errors( true );
		$loaded = $document->loadXML( $svg_font );
		libxml_clear_errors();
		libxml_use_internal_errors( $previous );

		if ( ! $loaded ) {
			return null;
		}

		$xpath = new \DOMXPath( $document );
		$xpath->registerNamespace( 'svg', 'http://www.w3.org/2000/svg' );

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

			$glyph_name = $node->getAttribute( 'glyph-name' );
			$unicode = $node->getAttribute( 'unicode' );
			$matches_name = '' !== $glyph_name && ( $glyph_name === $icon_name || str_ends_with( $icon_name, $glyph_name ) );
			$matches_code = self::unicode_codepoint( $unicode ) === $codepoint;

			if ( ! $matches_name && ! $matches_code ) {
				continue;
			}

			return [
				'd' => $d,
				'units' => $units,
				'advance' => self::positive_int_attribute( $node, 'horiz-adv-x', $font_advance ),
			];
		}

		return null;
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
