<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Css_Block_Scanner_Trait {

	/**
	 * Returns true when the quote/character at $pos is preceded by an odd number of backslashes,
	 * meaning it is escaped. Counting consecutive backslashes handles `"\\"` correctly
	 * (even count → backslash itself escaped → the following char is NOT escaped).
	 */
	private function is_escaped( string $css, int $pos ): bool {
		$count = 0;
		$j     = $pos - 1;
		while ( $j >= 0 && '\\' === $css[ $j ] ) {
			++$count;
			--$j;
		}
		return 1 === $count % 2;
	}

	private function find_block_end( string $css, int $start, int $len ): ?int {
		$depth     = 1;
		$in_string = false;
		$str_char  = '';

		for ( $i = $start; $i < $len; $i++ ) {
			$c = $css[ $i ];

			if ( $in_string ) {
				if ( $str_char === $c && ! $this->is_escaped( $css, $i ) ) {
					$in_string = false;
				}
				continue;
			}

			if ( '"' === $c || "'" === $c ) {
				$in_string = true;
				$str_char  = $c;
				continue;
			}

			if ( '{' === $c ) {
				++$depth;
			} elseif ( '}' === $c ) {
				--$depth;
				if ( 0 === $depth ) {
					return $i + 1;
				}
			}
		}

		return null;
	}
}
