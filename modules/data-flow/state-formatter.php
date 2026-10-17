<?php

namespace Elementor\Modules\DataFlow;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class State_Formatter {
	const FORMAT_RAW = 'raw';
	const FORMAT_NUMBER = 'number';
	const FORMAT_PERCENT = 'percent';
	const FORMATS = [ self::FORMAT_RAW, self::FORMAT_NUMBER, self::FORMAT_PERCENT ];
	const MAX_DECIMALS = 2;
	const PERCENT_FACTOR = 100;

	public static function format( $value, string $format = self::FORMAT_RAW, string $prefix = '', string $suffix = '' ): string {
		if ( null === $value ) {
			return '';
		}

		return $prefix . self::format_value( $value, $format ) . $suffix;
	}

	private static function format_value( $value, string $format ): string {
		switch ( $format ) {
			case self::FORMAT_NUMBER:
				return self::format_number( $value );
			case self::FORMAT_PERCENT:
				return is_numeric( $value ) ? self::format_number( $value * self::PERCENT_FACTOR ) . '%' : (string) $value;
			default:
				return self::to_string( $value );
		}
	}

	private static function format_number( $value ): string {
		if ( ! is_numeric( $value ) ) {
			return self::to_string( $value );
		}

		$formatted = number_format( (float) $value, self::MAX_DECIMALS, '.', ',' );

		return rtrim( rtrim( $formatted, '0' ), '.' );
	}

	private static function to_string( $value ): string {
		if ( is_bool( $value ) ) {
			return $value ? 'true' : 'false';
		}

		if ( is_array( $value ) || is_object( $value ) ) {
			return (string) wp_json_encode( $value );
		}

		return (string) $value;
	}
}
