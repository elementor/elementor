<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Uniform_Size_Detector {

	public static function find( array $sides_by_key, array $required_keys ): ?array {
		if ( ! self::has_all_keys( $sides_by_key, $required_keys ) ) {
			return null;
		}

		$first = $sides_by_key[ $required_keys[0] ];

		foreach ( $required_keys as $key ) {
			if ( ! self::sizes_match( $sides_by_key[ $key ], $first ) ) {
				return null;
			}
		}

		return $first;
	}

	private static function has_all_keys( array $sides_by_key, array $required_keys ): bool {
		foreach ( $required_keys as $key ) {
			if ( ! isset( $sides_by_key[ $key ] ) ) {
				return false;
			}
		}

		return true;
	}

	private static function sizes_match( array $a, array $b ): bool {
		return ( $a['size'] ?? null ) === ( $b['size'] ?? null )
			&& ( $a['unit'] ?? null ) === ( $b['unit'] ?? null );
	}
}
