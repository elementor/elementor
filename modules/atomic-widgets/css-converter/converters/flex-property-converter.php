<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Flex_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for the `flex` shorthand: Flex_Prop_Type{flexGrow: Number, flexShrink: Number, flexBasis: Size}.
 *
 * Supported forms:
 *   flex: none          -> 0 1 auto  (CSS spec equivalent)
 *   flex: auto          -> 1 1 auto
 *   flex: <grow>        -> <grow> 1 0  (unitless number only)
 *   flex: <grow> <basis>            (unitless grow + size basis)
 *   flex: <grow> <shrink> <basis>
 *
 * Declines to custom_css for any unrecognised syntax.
 */
class Flex_Property_Converter extends Property_Converter_Base {
	const AUTO_BASIS = [ 'size' => 'auto', 'unit' => 'custom' ];
	const ZERO_BASIS = [ 'size' => 0, 'unit' => 'px' ];

	protected function get_supported_properties(): array {
		return [ 'flex' ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$value = trim( $rule['value'] );

		$parsed = $this->parse( $value );

		if ( null === $parsed ) {
			return false;
		}

		[ $grow, $shrink, $basis ] = $parsed;

		$context->set_prop( 'flex', Flex_Prop_Type::generate( [
			'flexGrow'   => Number_Prop_Type::generate( $grow ),
			'flexShrink' => Number_Prop_Type::generate( $shrink ),
			'flexBasis'  => Size_Prop_Type::generate( $basis ),
		] ) );

		return true;
	}

	private function parse( string $value ): ?array {
		$lower = strtolower( $value );

		if ( 'none' === $lower ) {
			return [ 0, 1, self::AUTO_BASIS ];
		}

		if ( 'auto' === $lower ) {
			return [ 1, 1, self::AUTO_BASIS ];
		}

		$tokens = Css_Token_Splitter::split_by_whitespace( $value );

		if ( 1 === count( $tokens ) ) {
			$grow = $this->parse_number( $tokens[0] );
			if ( null === $grow ) {
				return null;
			}
			return [ $grow, 1, self::ZERO_BASIS ];
		}

		if ( 2 === count( $tokens ) ) {
			$grow = $this->parse_number( $tokens[0] );
			if ( null === $grow ) {
				return null;
			}
			$basis = Size_Value_Parser::parse( $tokens[1] );
			if ( null === $basis ) {
				return null;
			}
			return [ $grow, 1, $basis ];
		}

		if ( 3 === count( $tokens ) ) {
			$grow   = $this->parse_number( $tokens[0] );
			$shrink = $this->parse_number( $tokens[1] );
			$basis  = $this->parse_basis( $tokens[2] );

			if ( null === $grow || null === $shrink || null === $basis ) {
				return null;
			}

			return [ $grow, $shrink, $basis ];
		}

		return null;
	}

	private function parse_number( string $token ): ?float {
		if ( ! is_numeric( $token ) ) {
			return null;
		}
		return (float) $token;
	}

	private function parse_basis( string $token ): ?array {
		$lower = strtolower( $token );

		if ( 'auto' === $lower ) {
			return self::AUTO_BASIS;
		}

		return Size_Value_Parser::parse( $token );
	}
}
