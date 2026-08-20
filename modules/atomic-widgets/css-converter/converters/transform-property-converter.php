<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Move_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Rotate_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Scale_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Transform_Functions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Transform_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for the `transform` CSS property -> Transform_Prop_Type.
 *
 * Supported CSS functions -> schema type:
 *   translate(x)               -> transform-move {x, y:0, z:0}
 *   translate(x, y)            -> transform-move {x, y, z:0}
 *   translateX(n)              -> transform-move {x:n, y:0, z:0}
 *   translateY(n)              -> transform-move {x:0, y:n, z:0}
 *   translateZ(n)              -> transform-move {x:0, y:0, z:n}
 *   translate3d(x, y, z)      -> transform-move {x, y, z}
 *   scale(n)                   -> transform-scale {x:n, y:n, z:1}
 *   scale(x, y)                -> transform-scale {x, y, z:1}
 *   scaleX(n)                  -> transform-scale {x:n, y:1, z:1}
 *   scaleY(n)                  -> transform-scale {x:1, y:n, z:1}
 *   scaleZ(n)                  -> transform-scale {x:1, y:1, z:n}
 *   scale3d(x, y, z)          -> transform-scale {x, y, z}
 *   rotate(a)                  -> transform-rotate {x:0, y:0, z:a}
 *   rotateX(a)                 -> transform-rotate {x:a, y:0, z:0}
 *   rotateY(a)                 -> transform-rotate {x:0, y:a, z:0}
 *   rotateZ(a)                 -> transform-rotate {x:0, y:0, z:a}
 *   rotate3d not supported     -> decline
 *   matrix / perspective / skew / etc -> decline
 *
 * Move units:   %  px  em  rem  vw  custom
 * Rotate units: deg  rad  grad  turn  custom
 * Scale values: unitless numbers (floats)
 *
 * Any unrecognised function declines the entire declaration to customCss.
 */
class Transform_Property_Converter extends Property_Converter_Base {
	const MOVE_UNITS   = [ '%', 'px', 'em', 'rem', 'vw', 'custom' ];
	const ROTATE_UNITS = [ 'deg', 'rad', 'grad', 'turn', 'custom' ];

	const ZERO_MOVE   = [
		'size' => 0,
		'unit' => 'px',
	];
	const ZERO_ROTATE = [
		'size' => 0,
		'unit' => 'deg',
	];
	const ONE_SCALE   = 1.0;

	protected function get_supported_properties(): array {
		return [ 'transform' ];
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$functions = $this->parse_functions( trim( $rule['value'] ) );

		if ( null === $functions ) {
			return false;
		}

		$existing = $context->get_prop( 'transform' );
		$fields = $this->current_fields( $existing );
		$fields['transform-functions'] = Transform_Functions_Prop_Type::generate( $functions );

		$context->set_prop( 'transform', Transform_Prop_Type::generate( $fields ) );

		return true;
	}

	private function parse_functions( string $value ): ?array {
		if ( '' === $value || 'none' === strtolower( $value ) ) {
			return [];
		}

		$raw_functions = $this->split_functions( $value );

		if ( null === $raw_functions ) {
			return null;
		}

		$items = [];

		foreach ( $raw_functions as $fn ) {
			$item = $this->parse_function( $fn );

			if ( null === $item ) {
				return null;
			}

			$items[] = $item;
		}

		return $items;
	}

	private function split_functions( string $value ): ?array {
		$functions = [];
		$current = '';
		$depth = 0;

		for ( $i = 0, $len = strlen( $value ); $i < $len; $i++ ) {
			$char = $value[ $i ];

			if ( '(' === $char ) {
				++$depth;
			} elseif ( ')' === $char ) {
				--$depth;

				if ( 0 === $depth ) {
					$current .= $char;
					$functions[] = trim( $current );
					$current = '';
					++$i;

					while ( $i < $len && ' ' === $value[ $i ] ) {
						++$i;
					}

					--$i;
					continue;
				}
			}

			$current .= $char;
		}

		if ( '' !== trim( $current ) || 0 !== $depth ) {
			return null;
		}

		return $functions;
	}

	private function parse_function( string $callback ): ?array {
		if ( ! preg_match( '/^([\w-]+)\s*\((.+)\)$/s', $callback, $m ) ) {
			return null;
		}

		$name = strtolower( $m[1] );
		$args_str = $m[2];
		$args = array_map( 'trim', Css_Token_Splitter::split_by_comma( $args_str ) );

		switch ( $name ) {
			case 'translate':
				return $this->parse_translate( $args );
			case 'translatex':
				return $this->parse_translate_axis( $args, 'x' );
			case 'translatey':
				return $this->parse_translate_axis( $args, 'y' );
			case 'translatez':
				return $this->parse_translate_axis( $args, 'z' );
			case 'translate3d':
				return $this->parse_translate_3d( $args );
			case 'scale':
				return $this->parse_scale( $args );
			case 'scalex':
				return $this->parse_scale_axis( $args, 'x' );
			case 'scaley':
				return $this->parse_scale_axis( $args, 'y' );
			case 'scalez':
				return $this->parse_scale_axis( $args, 'z' );
			case 'scale3d':
				return $this->parse_scale_3d( $args );
			case 'rotate':
			case 'rotatez':
				return $this->parse_rotate_axis( $args, 'z' );
			case 'rotatex':
				return $this->parse_rotate_axis( $args, 'x' );
			case 'rotatey':
				return $this->parse_rotate_axis( $args, 'y' );
			default:
				return null;
		}
	}

	private function parse_translate( array $args ): ?array {
		if ( 1 === count( $args ) ) {
			$x = $this->move_size( $args[0] );

			if ( null === $x ) {
				return null;
			}

			return Transform_Move_Prop_Type::generate( [
				'x' => Size_Prop_Type::generate( $x ),
				'y' => Size_Prop_Type::generate( self::ZERO_MOVE ),
				'z' => Size_Prop_Type::generate( self::ZERO_MOVE ),
			] );
		}

		if ( 2 === count( $args ) ) {
			$x = $this->move_size( $args[0] );
			$y = $this->move_size( $args[1] );

			if ( null === $x || null === $y ) {
				return null;
			}

			return Transform_Move_Prop_Type::generate( [
				'x' => Size_Prop_Type::generate( $x ),
				'y' => Size_Prop_Type::generate( $y ),
				'z' => Size_Prop_Type::generate( self::ZERO_MOVE ),
			] );
		}

		return null;
	}

	private function parse_translate_axis( array $args, string $axis ): ?array {
		if ( 1 !== count( $args ) ) {
			return null;
		}

		$val = $this->move_size( $args[0] );

		if ( null === $val ) {
			return null;
		}

		return Transform_Move_Prop_Type::generate( [
			'x' => Size_Prop_Type::generate( 'x' === $axis ? $val : self::ZERO_MOVE ),
			'y' => Size_Prop_Type::generate( 'y' === $axis ? $val : self::ZERO_MOVE ),
			'z' => Size_Prop_Type::generate( 'z' === $axis ? $val : self::ZERO_MOVE ),
		] );
	}

	private function parse_translate_3d( array $args ): ?array {
		if ( 3 !== count( $args ) ) {
			return null;
		}

		$x = $this->move_size( $args[0] );
		$y = $this->move_size( $args[1] );
		$z = $this->move_size( $args[2] );

		if ( null === $x || null === $y || null === $z ) {
			return null;
		}

		return Transform_Move_Prop_Type::generate( [
			'x' => Size_Prop_Type::generate( $x ),
			'y' => Size_Prop_Type::generate( $y ),
			'z' => Size_Prop_Type::generate( $z ),
		] );
	}

	private function parse_scale( array $args ): ?array {
		if ( 1 === count( $args ) ) {
			$n = $this->scale_number( $args[0] );

			if ( null === $n ) {
				return null;
			}

			return Transform_Scale_Prop_Type::generate( [
				'x' => Number_Prop_Type::generate( $n ),
				'y' => Number_Prop_Type::generate( $n ),
				'z' => Number_Prop_Type::generate( self::ONE_SCALE ),
			] );
		}

		if ( 2 === count( $args ) ) {
			$x = $this->scale_number( $args[0] );
			$y = $this->scale_number( $args[1] );

			if ( null === $x || null === $y ) {
				return null;
			}

			return Transform_Scale_Prop_Type::generate( [
				'x' => Number_Prop_Type::generate( $x ),
				'y' => Number_Prop_Type::generate( $y ),
				'z' => Number_Prop_Type::generate( self::ONE_SCALE ),
			] );
		}

		return null;
	}

	private function parse_scale_axis( array $args, string $axis ): ?array {
		if ( 1 !== count( $args ) ) {
			return null;
		}

		$n = $this->scale_number( $args[0] );

		if ( null === $n ) {
			return null;
		}

		return Transform_Scale_Prop_Type::generate( [
			'x' => Number_Prop_Type::generate( 'x' === $axis ? $n : self::ONE_SCALE ),
			'y' => Number_Prop_Type::generate( 'y' === $axis ? $n : self::ONE_SCALE ),
			'z' => Number_Prop_Type::generate( 'z' === $axis ? $n : self::ONE_SCALE ),
		] );
	}

	private function parse_scale_3d( array $args ): ?array {
		if ( 3 !== count( $args ) ) {
			return null;
		}

		$x = $this->scale_number( $args[0] );
		$y = $this->scale_number( $args[1] );
		$z = $this->scale_number( $args[2] );

		if ( null === $x || null === $y || null === $z ) {
			return null;
		}

		return Transform_Scale_Prop_Type::generate( [
			'x' => Number_Prop_Type::generate( $x ),
			'y' => Number_Prop_Type::generate( $y ),
			'z' => Number_Prop_Type::generate( $z ),
		] );
	}

	private function parse_rotate_axis( array $args, string $axis ): ?array {
		if ( 1 !== count( $args ) ) {
			return null;
		}

		$val = $this->rotate_size( $args[0] );

		if ( null === $val ) {
			return null;
		}

		return Transform_Rotate_Prop_Type::generate( [
			'x' => Size_Prop_Type::generate( 'x' === $axis ? $val : self::ZERO_ROTATE ),
			'y' => Size_Prop_Type::generate( 'y' === $axis ? $val : self::ZERO_ROTATE ),
			'z' => Size_Prop_Type::generate( 'z' === $axis ? $val : self::ZERO_ROTATE ),
		] );
	}

	private function move_size( string $token ): ?array {
		$parsed = Size_Value_Parser::parse( $token );

		if ( null === $parsed || ! in_array( $parsed['unit'], self::MOVE_UNITS, true ) ) {
			return null;
		}

		return $parsed;
	}

	private function rotate_size( string $token ): ?array {
		$parsed = Size_Value_Parser::parse( $token );

		if ( null === $parsed || ! in_array( $parsed['unit'], self::ROTATE_UNITS, true ) ) {
			return null;
		}

		return $parsed;
	}

	private function scale_number( string $token ): ?float {
		if ( ! is_numeric( $token ) ) {
			return null;
		}

		return (float) $token;
	}

	private function current_fields( $existing ): array {
		if ( is_array( $existing ) && isset( $existing['value'] ) ) {
			return $existing['value'];
		}

		return [];
	}
}
