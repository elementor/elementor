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

	/**
	 * @param string   $css
	 * @param int      $start
	 * @param int      $len
	 * @param string[] $needles Single characters.
	 */
	private function find_unquoted( string $css, int $start, int $len, array $needles ): ?int {
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

			if ( in_array( $c, $needles, true ) ) {
				return $i;
			}
		}

		return null;
	}

	/**
	 * Splits on ';' only outside quotes, parentheses (e.g. data URIs) and comments. Comments are
	 * removed. A declaration left with an open string or parenthesis is dropped, because writing it
	 * to the page CSS would swallow the rules that follow it.
	 *
	 * @return string[]
	 */
	private function split_declarations( string $css ): array {
		$declarations = [];
		$current      = '';
		$len          = strlen( $css );
		$depth        = 0;
		$in_string    = false;
		$string_char  = '';

		for ( $i = 0; $i < $len; $i++ ) {
			$char = $css[ $i ];

			if ( $in_string ) {
				$current .= $char;

				if ( $string_char === $char && ! $this->is_escaped( $css, $i ) ) {
					$in_string = false;
				}

				continue;
			}

			if ( $this->is_escaped( $css, $i ) ) {
				$current .= $char;
				continue;
			}

			// Unquoted url() contents are raw data, so '/*' or a quote inside them is not special.
			if ( '(' === $char && 0 === strcasecmp( substr( $current, -3 ), 'url' ) && 1 !== preg_match( '/\G\s*["\']/', $css, $matches, 0, $i + 1 ) ) {
				$url_end = strpos( $css, ')', $i );

				if ( false === $url_end ) {
					$depth = 1;
					break;
				}

				$current .= substr( $css, $i, $url_end - $i + 1 );
				$i = $url_end;
				continue;
			}

			if ( '/' === $char && '*' === ( $css[ $i + 1 ] ?? '' ) ) {
				$comment_end = strpos( $css, '*/', $i + 2 );

				if ( false === $comment_end ) {
					break;
				}

				$current .= ' ';
				$i = $comment_end + 1;
				continue;
			}

			if ( '"' === $char || "'" === $char ) {
				$in_string   = true;
				$string_char = $char;
			} elseif ( '(' === $char ) {
				++$depth;
			} elseif ( ')' === $char ) {
				$depth = max( 0, $depth - 1 );
			} elseif ( ';' === $char && 0 === $depth ) {
				$declarations[] = $current;
				$current        = '';
				continue;
			}

			$current .= $char;
		}

		if ( ! $in_string && 0 === $depth ) {
			$declarations[] = $current;
		}

		return $declarations;
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
