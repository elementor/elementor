<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Finds keys of a plain input value that did not survive plain → envelope resolution,
 * either because they are not fields of the prop or because their value could not be resolved.
 * Compares against the resolver output instead of the schema so unions, custom resolvers
 * and open slots are judged by what was actually stored.
 */
class Dropped_Plain_Keys_Finder {

	/**
	 * @return string[] Dotted paths relative to $path.
	 */
	public static function find( $plain_value, $resolved_value, string $path ): array {
		$plain_fields = self::unwrap( $plain_value );
		$resolved_fields = self::unwrap( $resolved_value );

		if ( ! self::is_object_map( $plain_fields ) || ! is_array( $resolved_fields ) || ! self::is_envelope( $resolved_value ) ) {
			return [];
		}

		$dropped = [];

		foreach ( $plain_fields as $key => $sub_value ) {
			if ( null === $sub_value ) {
				continue;
			}

			$sub_path = $path . '.' . $key;

			if ( ! array_key_exists( $key, $resolved_fields ) ) {
				$dropped[] = $sub_path;
				continue;
			}

			$dropped = array_merge( $dropped, self::find( $sub_value, $resolved_fields[ $key ], $sub_path ) );
		}

		return $dropped;
	}

	private static function unwrap( $value ) {
		return self::is_envelope( $value ) ? $value['value'] : $value;
	}

	private static function is_envelope( $value ): bool {
		return is_array( $value ) && isset( $value['$$type'] ) && array_key_exists( 'value', $value );
	}

	private static function is_object_map( $value ): bool {
		return is_array( $value ) && ! empty( $value ) && ! wp_is_numeric_array( $value );
	}
}
