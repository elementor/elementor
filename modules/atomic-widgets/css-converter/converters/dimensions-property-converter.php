<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for the box shorthands backed by Union(Dimensions | Size) (padding/margin). One
 * instance per property. Every space-separated token is parsed as a Size leaf (paren-aware so
 * calc()/min()/... survive); any unparsable token declines the whole declaration (-> custom_css).
 *
 * A single token emits the Size member (the union accepts it). Two-to-four tokens expand via the CSS
 * box rule (top/right/bottom/left) and map physical->logical (top=block-start, right=inline-end,
 * bottom=block-end, left=inline-start) into a Dimensions PropValue.
 */
class Dimensions_Property_Converter extends Property_Converter_Base {
	const MAX_SIDES = 4;

	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$tokens = self::split_top_level( trim( $rule['value'] ) );
		$count = count( $tokens );

		if ( $count < 1 || $count > self::MAX_SIDES ) {
			return false;
		}

		$sizes = [];

		foreach ( $tokens as $token ) {
			$parsed = Size_Value_Parser::parse( $token );

			if ( null === $parsed ) {
				return false;
			}

			$sizes[] = $parsed;
		}

		if ( 1 === $count ) {
			$context->set_prop( $this->property, Size_Prop_Type::generate( $sizes[0] ) );

			return true;
		}

		[ $top, $right, $bottom, $left ] = self::expand_box( $sizes );

		$context->set_prop( $this->property, Dimensions_Prop_Type::generate( [
			'block-start' => Size_Prop_Type::generate( $top ),
			'inline-end' => Size_Prop_Type::generate( $right ),
			'block-end' => Size_Prop_Type::generate( $bottom ),
			'inline-start' => Size_Prop_Type::generate( $left ),
		] ) );

		return true;
	}

	/**
	 * @param array<int, array> $sizes 2..4 parsed Size leaves.
	 * @return array{0: array, 1: array, 2: array, 3: array} [top, right, bottom, left]
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

	/**
	 * Split on whitespace runs that sit at parenthesis depth 0, so function values such as
	 * "calc(50% - 10px)" stay intact as a single token.
	 *
	 * @return string[]
	 */
	private static function split_top_level( string $value ): array {
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
