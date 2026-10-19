<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads of a map-driven widget return the rules that live in its `custom_css` as `selector ... { }` blocks,
 * optionally inside a site breakpoint media query. Sending them back must keep them, not drop them as
 * unknown style targets, so those blocks are lifted out of the style string before it is routed to targets.
 * Only plain declarations are accepted; anything that could break out of the rule or load code is left in
 * the string, where the router drops it with its usual warning.
 */
class V3_Custom_Css_Echo {

	const WRAPPER_PLACEHOLDER = 'selector';

	const HEADER_PATTERN = '/^selector(?:[\s:][#.\w\s>+~:()\[\]="\'*,^$|-]*)?$/';

	const MEDIA_PATTERN = '/^@media\s*\(\s*(?:max|min)-width\s*:\s*\d+px\s*\)$/i';

	const UNSAFE_PATTERN = '/[<\\\\]|javascript:|expression\s*\(|@import|behavior\s*:|-moz-binding|\*\//i';

	/**
	 * @return array{css: string, preserved: string[]} The style string without the echoed blocks, and the blocks to keep in custom CSS.
	 */
	public static function extract( string $css ): array {
		$kept = '';
		$preserved = [];
		$length = strlen( $css );
		$position = 0;

		while ( $position < $length ) {
			$brace = strpos( $css, '{', $position );

			if ( false === $brace ) {
				break;
			}

			$semicolon = strrpos( substr( $css, $position, $brace - $position ), ';' );
			$header_start = false === $semicolon ? $position : $position + $semicolon + 1;
			$header = trim( substr( $css, $header_start, $brace - $header_start ) );
			$end = self::block_end( $css, $brace + 1, $length );

			if ( null === $end ) {
				break;
			}

			$body = trim( substr( $css, $brace + 1, $end - $brace - 2 ) );
			$rule = self::accepted_rule( $header, $body );

			$kept .= substr( $css, $position, $header_start - $position );

			if ( null === $rule ) {
				$kept .= substr( $css, $header_start, $end - $header_start );
			} else {
				$preserved[] = $rule;
			}

			$position = $end;
		}

		$kept .= substr( $css, $position );

		return [
			'css' => trim( $kept ),
			'preserved' => $preserved,
		];
	}

	private static function accepted_rule( string $header, string $body ): ?string {
		if ( 1 === preg_match( self::HEADER_PATTERN, $header ) ) {
			return self::is_plain_declarations( $body ) ? sprintf( '%s { %s }', $header, $body ) : null;
		}

		if ( 1 !== preg_match( self::MEDIA_PATTERN, $header ) ) {
			return null;
		}

		$inner = self::inner_rules( $body );

		return null === $inner ? null : sprintf( '%s { %s }', preg_replace( '/\s+/', ' ', $header ), $inner );
	}

	private static function inner_rules( string $body ): ?string {
		$rules = [];
		$length = strlen( $body );
		$position = 0;

		while ( $position < $length ) {
			$brace = strpos( $body, '{', $position );

			if ( false === $brace ) {
				return '' === trim( substr( $body, $position ) ) && ! empty( $rules ) ? implode( ' ', $rules ) : null;
			}

			$end = self::block_end( $body, $brace + 1, $length );
			$header = trim( substr( $body, $position, $brace - $position ) );

			if ( null === $end || 1 !== preg_match( self::HEADER_PATTERN, $header ) ) {
				return null;
			}

			$inner = trim( substr( $body, $brace + 1, $end - $brace - 2 ) );

			if ( ! self::is_plain_declarations( $inner ) ) {
				return null;
			}

			$rules[] = sprintf( '%s { %s }', $header, $inner );
			$position = $end;
		}

		return empty( $rules ) ? null : implode( ' ', $rules );
	}

	private static function is_plain_declarations( string $body ): bool {
		return '' !== $body && false === strpbrk( $body, '{}' ) && 1 !== preg_match( self::UNSAFE_PATTERN, $body );
	}

	private static function block_end( string $css, int $from, int $length ): ?int {
		$depth = 1;

		for ( $i = $from; $i < $length; $i++ ) {
			if ( '{' === $css[ $i ] ) {
				++$depth;
			} elseif ( '}' === $css[ $i ] && 0 === --$depth ) {
				return $i + 1;
			}
		}

		return null;
	}
}
