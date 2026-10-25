<?php

namespace Elementor\Modules\Promotions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Promotion_Cdn_Url_Validator {

	public static function read_string_field( array $assets_data, string $key ): string {
		$value = $assets_data[ $key ] ?? '';

		if ( ! is_string( $value ) ) {
			return '';
		}

		$value = trim( $value );

		return '' === $value ? '' : $value;
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
