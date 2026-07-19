<?php

namespace Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Empty_Values_Filter {
	public static function filter( $value ) {
		if ( self::is_empty( $value ) ) {
			return null;
		}

		if ( is_array( $value ) && self::is_list_array( $value ) ) {
			$filtered = [];

			foreach ( $value as $item ) {
				$filtered_item = self::filter( $item );

				if ( null !== $filtered_item && ! self::is_empty( $filtered_item ) ) {
					$filtered[] = $filtered_item;
				}
			}

			return $filtered;
		}

		if ( is_array( $value ) ) {
			$filtered = [];

			foreach ( $value as $key => $val ) {
				$filtered_val = self::filter( $val );

				if ( null !== $filtered_val && ! self::is_empty( $filtered_val ) ) {
					$filtered[ $key ] = $filtered_val;
				}
			}

			return $filtered;
		}

		return $value;
	}

	public static function is_empty( $value ): bool {
		if ( self::is_transformable( $value ) ) {
			return self::is_empty( $value['value'] );
		}

		return self::is_nullish( $value ) || self::is_nullish_array( $value ) || self::is_nullish_object( $value );
	}

	private static function is_transformable( $value ): bool {
		return is_array( $value )
			&& array_key_exists( '$$type', $value )
			&& array_key_exists( 'value', $value )
			&& is_string( $value['$$type'] );
	}

	private static function is_nullish( $value ): bool {
		return null === $value || '' === $value;
	}

	private static function is_nullish_array( $value ): bool {
		if ( ! is_array( $value ) || ! self::is_list_array( $value ) ) {
			return false;
		}

		foreach ( $value as $item ) {
			if ( ! self::is_empty( $item ) ) {
				return false;
			}
		}

		return true;
	}

	private static function is_nullish_object( $value ): bool {
		if ( ! is_array( $value ) || self::is_list_array( $value ) ) {
			return false;
		}

		if ( [] === $value ) {
			return true;
		}

		foreach ( $value as $item ) {
			if ( ! self::is_empty( $item ) ) {
				return false;
			}
		}

		return true;
	}

	private static function is_list_array( array $value ): bool {
		if ( [] === $value ) {
			return true;
		}

		return array_keys( $value ) === range( 0, count( $value ) - 1 );
	}
}
