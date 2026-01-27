<?php

namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Import_Export_Utils {
	const LABEL_PREFIX = 'DUP_';
	const MAX_LABEL_LENGTH = 50;

	public static function items_equal( array $a, array $b ): bool {
		$a = self::recursive_ksort( $a );
		$b = self::recursive_ksort( $b );

		return wp_json_encode( $a ) === wp_json_encode( $b );
	}

	public static function recursive_ksort( $value ) {
		if ( is_array( $value ) ) {
			foreach ( $value as $k => $v ) {
				$value[ $k ] = self::recursive_ksort( $v );
			}
			ksort( $value );
		}

		return $value;
	}

	public static function generate_unique_id( array $existing_ids, string $prefix = 'g-' ): string {
		$existing = array_fill_keys( $existing_ids, true );

		do {
			$random = substr( strtolower( dechex( wp_rand( 0, PHP_INT_MAX ) ) ), 0, 7 );
			$id = $prefix . $random;
		} while ( isset( $existing[ $id ] ) );

		return $id;
	}

	public static function generate_unique_label( string $original_label, array $existing_labels ): string {
		$prefix = self::LABEL_PREFIX;
		$max_length = self::MAX_LABEL_LENGTH;

		$has_prefix = 0 === strpos( $original_label, $prefix );

		if ( $has_prefix ) {
			$base_label = substr( $original_label, strlen( $prefix ) );
			$counter = 1;
			$new_label = $prefix . $base_label . $counter;

			while ( in_array( $new_label, $existing_labels, true ) ) {
				++$counter;
				$new_label = $prefix . $base_label . $counter;
			}

			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix . $counter );
				$base_label = substr( $base_label, 0, $available_length );
				$new_label = $prefix . $base_label . $counter;
			}
		} else {
			$new_label = $prefix . $original_label;

			if ( strlen( $new_label ) > $max_length ) {
				$available_length = $max_length - strlen( $prefix );
				$new_label = $prefix . substr( $original_label, 0, $available_length );
			}

			$counter = 1;
			$base_label = substr( $original_label, 0, $available_length ?? strlen( $original_label ) );

			while ( in_array( $new_label, $existing_labels, true ) ) {
				$new_label = $prefix . $base_label . $counter;

				if ( strlen( $new_label ) > $max_length ) {
					$available_length = $max_length - strlen( $prefix . $counter );
					$base_label = substr( $original_label, 0, $available_length );
					$new_label = $prefix . $base_label . $counter;
				}

				++$counter;
			}
		}

		return $new_label;
	}
}
