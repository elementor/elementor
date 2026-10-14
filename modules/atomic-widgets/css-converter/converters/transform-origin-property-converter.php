<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Transform_Origin_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Transform_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for the `transform-origin` CSS property.
 *
 * Maps into the `transform-origin` field nested inside the `transform` Prop_Type
 * (merging with any prior transform fields already in the context).
 *
 * Accepted CSS syntax (1, 2, or 3 tokens, order = x y z):
 *   - keywords:   left | right | center | top | bottom
 *   - length:     <number><px|em|rem>
 *   - percentage: <number>%
 *
 * Unit rules:
 *   - x/y: % px em rem
 *   - z:   px em rem  (no %)
 *
 * Anything else declines the entire declaration to customCss.
 */
class Transform_Origin_Property_Converter extends Property_Converter_Base {
	const XY_UNITS = [ '%', 'px', 'em', 'rem' ];
	const Z_UNITS  = [ 'px', 'em', 'rem' ];

	const X_KEYWORDS = [
		'left' => 0,
		'center' => 50,
		'right' => 100,
	];
	const Y_KEYWORDS = [
		'top' => 0,
		'center' => 50,
		'bottom' => 100,
	];

	const CENTER = [
		'size' => 50,
		'unit' => '%',
	];

	protected function get_supported_properties(): array {
		return [ 'transform-origin' ];
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$axes = $this->parse( trim( $rule['value'] ) );

		if ( null === $axes ) {
			return false;
		}

		$existing = $context->get_prop( 'transform' );
		$fields = $this->current_fields( $existing );
		$fields['transform-origin'] = Transform_Origin_Prop_Type::generate( [
			'x' => Size_Prop_Type::generate( $axes['x'] ),
			'y' => Size_Prop_Type::generate( $axes['y'] ),
			'z' => Size_Prop_Type::generate( $axes['z'] ),
		] );

		$context->set_prop( 'transform', Transform_Prop_Type::generate( $fields ) );

		return true;
	}

	private function parse( string $value ): ?array {
		$tokens = Css_Token_Splitter::split_by_whitespace( $value );
		$count = count( $tokens );

		if ( $count < 1 || $count > 3 ) {
			return null;
		}

		[ $x, $y ] = $this->parse_xy( $tokens );

		if ( null === $x || null === $y ) {
			return null;
		}

		$z = 3 === $count ? $this->parse_z( $tokens[2] ) : [
			'size' => 0,
			'unit' => 'px',
		];

		if ( null === $z ) {
			return null;
		}

		return [
			'x' => $x,
			'y' => $y,
			'z' => $z,
		];
	}

	private function parse_xy( array $tokens ): array {
		if ( 1 === count( $tokens ) ) {
			return $this->parse_single_xy( strtolower( $tokens[0] ) );
		}

		return [
			$this->parse_axis( strtolower( $tokens[0] ), self::X_KEYWORDS ),
			$this->parse_axis( strtolower( $tokens[1] ), self::Y_KEYWORDS ),
		];
	}

	private function parse_single_xy( string $token ): array {
		if ( isset( self::X_KEYWORDS[ $token ] ) && ! isset( self::Y_KEYWORDS[ $token ] ) ) {
			return [ $this->keyword_size( self::X_KEYWORDS[ $token ] ), self::CENTER ];
		}

		if ( isset( self::Y_KEYWORDS[ $token ] ) && ! isset( self::X_KEYWORDS[ $token ] ) ) {
			return [ self::CENTER, $this->keyword_size( self::Y_KEYWORDS[ $token ] ) ];
		}

		if ( 'center' === $token ) {
			return [ self::CENTER, self::CENTER ];
		}

		$size = $this->xy_size( $token );

		return null === $size ? [ null, null ] : [ $size, self::CENTER ];
	}

	private function parse_axis( string $token, array $keywords ): ?array {
		if ( isset( $keywords[ $token ] ) ) {
			return $this->keyword_size( $keywords[ $token ] );
		}

		return $this->xy_size( $token );
	}

	private function xy_size( string $token ): ?array {
		$parsed = Size_Value_Parser::parse( $token );

		if ( null === $parsed || ! in_array( $parsed['unit'], self::XY_UNITS, true ) ) {
			return null;
		}

		return $parsed;
	}

	private function parse_z( string $token ): ?array {
		$parsed = Size_Value_Parser::parse( $token );

		if ( null === $parsed || ! in_array( $parsed['unit'], self::Z_UNITS, true ) ) {
			return null;
		}

		return $parsed;
	}

	private function keyword_size( int $percent ): array {
		return [
			'size' => $percent,
			'unit' => '%',
		];
	}

	private function current_fields( $existing ): array {
		if ( is_array( $existing ) && isset( $existing['value'] ) ) {
			return $existing['value'];
		}

		return [];
	}
}
