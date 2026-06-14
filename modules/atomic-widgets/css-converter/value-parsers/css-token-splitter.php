<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Stateless tokenizer shared by the box shorthands and shorthand expanders. Splits a CSS value on
 * whitespace runs that sit at parenthesis depth 0, so function values such as calc(50% - 10px) or
 * rgb(0, 0, 0) stay intact as a single token.
 */
class Css_Token_Splitter {
	/**
	 * Split a CSS value on top-level commas (paren-aware), trimming each segment.
	 *
	 * @return string[]
	 */
	public static function split_by_comma( string $value ): array {
		$tokens = [];
		$current = '';
		$depth = 0;
		$length = strlen( $value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $value[ $i ];

			if ( '(' === $char ) {
				++$depth;
			} elseif ( ')' === $char ) {
				$depth = max( 0, $depth - 1 );
			}

			if ( 0 === $depth && ',' === $char ) {
				$tokens[] = trim( $current );
				$current = '';
				continue;
			}

			$current .= $char;
		}

		$last = trim( $current );

		if ( '' !== $last ) {
			$tokens[] = $last;
		}

		return $tokens;
	}

	/**
	 * @return string[]
	 */
	public static function split_by_whitespace( string $value ): array {
		$tokens = [];
		$current = '';
		$depth = 0;
		$length = strlen( $value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $value[ $i ];

			if ( '(' === $char ) {
				++$depth;
			} elseif ( ')' === $char ) {
				$depth = max( 0, $depth - 1 );
			}

			if ( 0 === $depth && ( ' ' === $char || "\t" === $char || "\n" === $char ) ) {
				if ( '' !== $current ) {
					$tokens[] = $current;
					$current = '';
				}

				continue;
			}

			$current .= $char;
		}

		if ( '' !== $current ) {
			$tokens[] = $current;
		}

		return $tokens;
	}
}
