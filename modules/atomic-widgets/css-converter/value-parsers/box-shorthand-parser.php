<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Stateless parser for the CSS box shorthands (padding/margin/border-width/border-radius): a raw
 * value -> 1..4 Size leaves, or null to decline (the caller routes the declaration to custom_css).
 * It never touches the registry, context, or PropTypes; the caller maps the result onto its own keys.
 *
 * Tokenizing is paren-aware so function values such as calc(100% / 4) survive as one token (and are
 * parsed as a Size leaf). This also makes the elliptical border-radius form (a "/" separator) decline
 * for free: a bare "/" is an unparsable token, and "a / b" exceeds four tokens.
 *
 * - 1 token  -> [ 'single' => <Size leaf> ]            (the union's Size member)
 * - 2-4 tokens -> [ 'sides' => [ s0, s1, s2, s3 ] ]    (expanded via the CSS box rule)
 * - 0 / >4 tokens, or any unparsable token -> null
 */
class Box_Shorthand_Parser {
	const MAX_SIDES = 4;

	/**
	 * @return array{single: array}|array{sides: array<int, array>}|null
	 */
	public static function parse( string $value ): ?array {
		$tokens = Css_Token_Splitter::split_by_whitespace( trim( $value ) );
		$count = count( $tokens );

		if ( $count < 1 || $count > self::MAX_SIDES ) {
			return null;
		}

		$sizes = [];

		foreach ( $tokens as $token ) {
			$parsed = Size_Value_Parser::parse( $token );

			if ( null === $parsed ) {
				return null;
			}

			$sizes[] = $parsed;
		}

		if ( 1 === $count ) {
			return [ 'single' => $sizes[0] ];
		}

		return [ 'sides' => self::expand_box( $sizes ) ];
	}

	/**
	 * Expand 2..4 values onto four sides via the CSS box rule. The result is positional and the same
	 * for every box shorthand; the caller assigns the four slots to its own keys.
	 *
	 * @param array<int, array> $sizes 2..4 parsed Size leaves.
	 * @return array{0: array, 1: array, 2: array, 3: array}
	 */
	private static function expand_box( array $sizes ): array {
		switch ( count( $sizes ) ) {
			case 2:
				return [ $sizes[0], $sizes[1], $sizes[0], $sizes[1] ];
			case 3:
				return [ $sizes[0], $sizes[1], $sizes[2], $sizes[1] ];
			default:
				return [ $sizes[0], $sizes[1], $sizes[2], $sizes[3] ];
		}
	}
}
