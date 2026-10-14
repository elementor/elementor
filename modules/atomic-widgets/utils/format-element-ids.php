<?php

namespace Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Format_Element_Ids {
	public static function format( array $elements, array $path ): array {
		return array_map( function( $element ) use ( $path ) {
			$origin_id   = $element['id'];
			$nesting_path = [ ...$path, $origin_id ];

			$element['id']        = self::hash_string( implode( '_', $nesting_path ), 7 );
			$element['origin_id'] = $origin_id;
			$element['elements']  = self::format( $element['elements'] ?? [], $nesting_path );

			return $element;
		}, $elements );
	}

	/**
	 * Deterministic djb2-based hash kept in sync with the TypeScript implementation
	 * in @elementor/utils (packages/packages/libs/utils/src/hash.ts) so that inner
	 * element ids are consistent between the PHP render and the editor's JS layer.
	 *
	 * @param string   $str    String to hash.
	 * @param int|null $length Optional desired output length.
	 * @return string          Base-36, lowercase, padded to $length when provided.
	 */
	public static function hash_string( string $str, ?int $length ): string {
		$hash_basis = 5381;

		$i = strlen( $str );
		while ( $i > 0 ) {
			--$i;
			$hash_basis = ( $hash_basis * 33 ) ^ ord( $str[ $i ] );
			// Keep hash within 32-bit range to match JavaScript bitwise operations.
			$hash_basis = $hash_basis & 0xFFFFFFFF;
		}

		$result = base_convert( (string) $hash_basis, 10, 36 );

		if ( ! isset( $length ) ) {
			return $result;
		}

		$sliced = substr( $result, -$length );
		return str_pad( $sliced, $length, '0', STR_PAD_LEFT );
	}
}
