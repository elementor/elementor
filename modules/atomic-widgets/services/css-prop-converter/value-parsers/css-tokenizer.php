<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Tokenizer {

	public static function split( string $value, string $separator ): array {
		$items = [];
		$buffer = '';
		$depth = 0;
		$length = strlen( $value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $value[ $i ];
			$depth = self::adjust_depth( $depth, $char );

			if ( $separator === $char && 0 === $depth ) {
				$items[] = trim( $buffer );
				$buffer = '';
				continue;
			}

			$buffer .= $char;
		}

		if ( '' !== trim( $buffer ) ) {
			$items[] = trim( $buffer );
		}

		return $items;
	}

	public static function words( string $value ): array {
		$tokens = [];
		$buffer = '';
		$depth = 0;
		$length = strlen( $value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $value[ $i ];

			if ( self::is_whitespace( $char ) && 0 === $depth ) {
				if ( '' !== $buffer ) {
					$tokens[] = $buffer;
					$buffer = '';
				}
				continue;
			}

			$depth = self::adjust_depth( $depth, $char );
			$buffer .= $char;
		}

		if ( '' !== $buffer ) {
			$tokens[] = $buffer;
		}

		return $tokens;
	}

	private static function adjust_depth( int $depth, string $char ): int {
		if ( '(' === $char ) {
			return $depth + 1;
		}

		if ( ')' === $char ) {
			return max( 0, $depth - 1 );
		}

		return $depth;
	}

	private static function is_whitespace( string $char ): bool {
		return ' ' === $char || "\t" === $char;
	}
}
