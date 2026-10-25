<?php

namespace Elementor\Modules\Promotions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Promotion_Cdn_Url_Validator {

	private const UNDERSCORE_TEMPLATE_MARKERS = [
		'{{{',
		'}}}',
		'{{',
		'}}',
		'<#',
		'#>',
	];

	public static function read_string_field( array $assets_data, string $key ): string {
		$value = $assets_data[ $key ] ?? '';

		if ( ! is_string( $value ) ) {
			return '';
		}

		return self::sanitize_promotion_display_string( $value );
	}

	public static function sanitize_promotion_display_string( string $value ): string {
		$value = trim( $value );

		if ( '' === $value ) {
			return '';
		}

		$value = sanitize_text_field( $value );

		if ( '' === $value || self::contains_underscore_template_markers( $value ) ) {
			return '';
		}

		return $value;
	}

	private static function contains_underscore_template_markers( string $value ): bool {
		foreach ( self::UNDERSCORE_TEMPLATE_MARKERS as $marker ) {
			if ( str_contains( $value, $marker ) ) {
				return true;
			}
		}

		return false;
	}

	public static function is_allowed_promotion_url( string $url ): bool {
		$parsed = wp_parse_url( $url );

		if ( ! is_array( $parsed ) ) {
			return false;
		}

		$scheme = $parsed['scheme'] ?? '';
		$host   = strtolower( $parsed['host'] ?? '' );

		if ( 'https' !== $scheme ) {
			return false;
		}

		return in_array( $host, [ 'elementor.com', 'go.elementor.com' ], true );
	}

	public static function sanitize_promotion_url( string $url ): string {
		if ( ! self::is_allowed_promotion_url( $url ) ) {
			return '';
		}

		return esc_url_raw( $url );
	}
}
