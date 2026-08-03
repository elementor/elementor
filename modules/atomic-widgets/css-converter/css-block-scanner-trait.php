<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Css_Block_Scanner_Trait {

	private function find_block_end( string $css, int $start, int $len ): ?int {
		$depth     = 1;
		$in_string = false;
		$str_char  = '';

		for ( $i = $start; $i < $len; $i++ ) {
			$c = $css[ $i ];

			if ( $in_string ) {
				if ( $str_char === $c && ( 0 === $i || '\\' !== $css[ $i - 1 ] ) ) {
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
