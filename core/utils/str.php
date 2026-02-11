<?php
namespace Elementor\Core\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Str {

	/**
	 * Convert a non-latin URL to an IDN one.
	 * Note: Max length is 64 chars.
	 *
	 * @param string $url - A URL to encode.
	 *
	 * @return string - IDN encoded URL ( e.g. `http://é.com` will be encoded to `http://xn--9ca.com` ).
	 */
	public static function encode_idn_url( $url ) {
		return preg_replace_callback( '/(https?:\/\/)(.+)/', function ( $matches ) {
			// WP >= 6.2-alpha
			if ( class_exists( '\WpOrg\Requests\IdnaEncoder' ) ) {
				$class = \WpOrg\Requests\IdnaEncoder::class;
			} else {
				$class = \Requests_IDNAEncoder::class;
			}

			return $matches[1] . $class::encode( $matches[2] );
		}, $url );
	}

	/**
	 * Checks if a string ends with a given substring
	 *
	 * @param $haystack
	 * @param $needle
	 * @return bool
	 */
	public static function ends_with( $haystack, $needle ) {
		return substr( $haystack, -strlen( $needle ) ) === $needle;
	}

	/**
	 * Generates a deterministic hash from a string using FNV-1a algorithm.
	 *
	 * FNV-1a is a fast, simple hash function that produces consistent results.
	 * It's ideal for generating short, unique identifiers.
	 *
	 * IMPORTANT: This implementation must match the TypeScript version in
	 * packages/packages/core/editor-components/src/utils/hash-string.ts
	 *
	 * @param string $str The string to hash
	 * @return int A positive 32-bit integer hash
	 *
	 * @example
	 * Str::hash_string('instance-abc'); // -> 3845729284
	 * Str::hash_string('instance-abc'); // -> 3845729284 (deterministic)
	 */
	public static function hash_string( $str ) {
		// FNV-1a offset basis (32-bit)
		$hash = 2166136261;

		$length = strlen( $str );
		for ( $i = 0; $i < $length; $i++ ) {
			// XOR with current byte
			$hash ^= ord( $str[ $i ] );
			// Multiply by FNV prime (32-bit) - use modulo to keep within 32-bit range
			$hash = ( $hash * 16777619 ) & 0xFFFFFFFF;
		}

		return $hash;
	}

	/**
	 * Converts a hash number to a short base36 string.
	 *
	 * Base36 uses 0-9 and a-z, producing compact identifiers.
	 *
	 * @param int $hash The hash number to convert
	 * @param int $length Maximum length of the result (default: 7)
	 * @return string A short alphanumeric string
	 *
	 * @example
	 * Str::hash_to_short_id(3845729284); // -> '2azk1ws'
	 */
	public static function hash_to_short_id( $hash, $length = 7 ) {
		$base36 = base_convert( $hash, 10, 36 );
		return substr( $base36, 0, $length );
	}

	/**
	 * Generates a short hash ID from a string.
	 *
	 * Combines hashing and base36 conversion into a single step.
	 *
	 * IMPORTANT: This implementation must match the TypeScript version in
	 * packages/packages/core/editor-components/src/utils/hash-string.ts
	 *
	 * @param string $str The string to hash
	 * @param int $length Maximum length of the result (default: 7)
	 * @return string A short alphanumeric hash
	 *
	 * @example
	 * Str::generate_short_hash('instance-abc'); // -> '2azk1ws'
	 */
	public static function generate_short_hash( $str, $length = 7 ) {
		$hash = self::hash_string( $str );
		return self::hash_to_short_id( $hash, $length );
	}
}
