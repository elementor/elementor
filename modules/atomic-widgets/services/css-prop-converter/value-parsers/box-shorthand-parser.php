<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Box_Shorthand_Parser {

	public static function expand_box( string $value, array $box_keys ): ?array {
		if ( 4 !== count( $box_keys ) ) {
			return null;
		}

		$sizes = self::parse_size_tokens( $value, 4 );

		if ( null === $sizes ) {
			return null;
		}

		[ $top, $right, $bottom, $left ] = self::distribute_box_values( $sizes );

		return [
			$box_keys[0] => $top,
			$box_keys[1] => $right,
			$box_keys[2] => $bottom,
			$box_keys[3] => $left,
		];
	}

	public static function expand_axis( string $value, array $axis_keys ): ?array {
		if ( 2 !== count( $axis_keys ) ) {
			return null;
		}

		$sizes = self::parse_size_tokens( $value, 2 );

		if ( null === $sizes ) {
			return null;
		}

		return [
			$axis_keys[0] => $sizes[0],
			$axis_keys[1] => $sizes[1] ?? $sizes[0],
		];
	}

	private static function parse_size_tokens( string $value, int $max_count ): ?array {
		$trimmed = trim( $value );

		if ( '' === $trimmed ) {
			return null;
		}

		$parts = preg_split( '/\s+/', $trimmed );

		if ( count( $parts ) > $max_count ) {
			return null;
		}

		return Size_Value_Parser::parse_list( $parts );
	}

	private static function distribute_box_values( array $sizes ): array {
		switch ( count( $sizes ) ) {
			case 1:
				return [ $sizes[0], $sizes[0], $sizes[0], $sizes[0] ];
			case 2:
				return [ $sizes[0], $sizes[1], $sizes[0], $sizes[1] ];
			case 3:
				return [ $sizes[0], $sizes[1], $sizes[2], $sizes[1] ];
			case 4:
				return [ $sizes[0], $sizes[1], $sizes[2], $sizes[3] ];
		}

		return [];
	}
}
