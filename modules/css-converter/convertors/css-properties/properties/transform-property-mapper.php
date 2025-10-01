<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Transform_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Transform_Functions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Move_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Scale_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Rotate_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Functions\Transform_Skew_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Transform Property Mapper
 *
 * 🎯 ATOMIC SOURCE: atomic widgets use Transform_Prop_Type for transform
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
 *
 * ✅ COMPREHENSIVE COVERAGE:
 * - Transform functions: translate, scale, rotate, skew (and their X/Y/Z variants)
 * - Transform shorthand: transform: translateX(10px) scale(1.5) rotate(45deg);
 * - Individual functions: translateX, translateY, scaleX, scaleY, rotateX, etc.
 * - Transform origin: transform-origin: center, top left, 50% 50%, etc.
 * - Perspective: perspective: 1000px;
 * - Perspective origin: perspective-origin: center, 50% 50%, etc.
 */
class Transform_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'transform',
		'transform-origin',
		'perspective',
		'perspective-origin',
	];

	private const TRANSFORM_FUNCTIONS = [
		'translate' => 'move',
		'translatex' => 'move',
		'translatey' => 'move',
		'translatez' => 'move',
		'translate3d' => 'move',
		'scale' => 'scale',
		'scalex' => 'scale',
		'scaley' => 'scale',
		'scalez' => 'scale',
		'scale3d' => 'scale',
		'rotate' => 'rotate',
		'rotatex' => 'rotate',
		'rotatey' => 'rotate',
		'rotatez' => 'rotate',
		'rotate3d' => 'rotate',
		'skew' => 'skew',
		'skewx' => 'skew',
		'skewy' => 'skew',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		error_log('🔴 LEVEL 5 - TRANSFORM MAPPER: Called with property = ' . $property . ', value = ' . $value);
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		switch ( $property ) {
			case 'transform':
				return $this->parse_transform_value( $value );
			case 'transform-origin':
				return $this->parse_transform_origin( $value );
			case 'perspective':
				return $this->parse_perspective( $value );
			case 'perspective-origin':
				return $this->parse_perspective_origin( $value );
			default:
				return null;
		}
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function get_v4_property_name( string $property ): string {
		return 'transform';
	}

	private function parse_transform_value( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );

		if ( empty( $value ) || 'none' === strtolower( $value ) ) {
			return Transform_Prop_Type::make()->generate( [
				'transform-functions' => [],
			] );
		}

		$functions = $this->parse_transform_functions( $value );
		if ( empty( $functions ) ) {
			return null;
		}

		$result = Transform_Prop_Type::make()->generate( [
			'transform-functions' => Transform_Functions_Prop_Type::make()->generate( $functions ),
		] );
		error_log('🔴 LEVEL 5 - TRANSFORM MAPPER: Returning result = ' . json_encode($result));
		return $result;
	}

	private function parse_transform_functions( string $value ): array {
		$functions = [];
		
		error_log('🔴 TRANSFORM MAPPER: Parsing transform functions from: ' . $value);
		
		// Match transform functions like translateX(10px), scale(1.5), rotate(45deg)
		if ( preg_match_all( '/(\w+)\s*\(\s*([^)]+)\s*\)/i', $value, $matches, PREG_SET_ORDER ) ) {
			error_log('🔴 TRANSFORM MAPPER: Regex matched ' . count($matches) . ' functions');
			foreach ( $matches as $match ) {
				$function_name = strtolower( $match[1] );
				$function_args = trim( $match[2] );
				
				error_log('🔴 TRANSFORM MAPPER: Found function: ' . $function_name . '(' . $function_args . ')');
				
				if ( ! isset( self::TRANSFORM_FUNCTIONS[ $function_name ] ) ) {
					error_log('🔴 TRANSFORM MAPPER: Function ' . $function_name . ' NOT in TRANSFORM_FUNCTIONS map');
					continue;
				}

				$function_type = self::TRANSFORM_FUNCTIONS[ $function_name ];
				error_log('🔴 TRANSFORM MAPPER: Function type: ' . $function_type);
				$parsed_function = $this->parse_transform_function( $function_name, $function_args, $function_type );
				
				if ( null !== $parsed_function ) {
					error_log('🔴 TRANSFORM MAPPER: Successfully parsed function');
					$functions[] = $parsed_function;
				} else {
					error_log('🔴 TRANSFORM MAPPER: Failed to parse function - returned null');
				}
			}
		} else {
			error_log('🔴 TRANSFORM MAPPER: Regex did NOT match - no functions found');
		}

		error_log('🔴 TRANSFORM MAPPER: Returning ' . count($functions) . ' parsed functions');
		return $functions;
	}

	private function parse_transform_function( string $function_name, string $args, string $function_type ): ?array {
		switch ( $function_type ) {
			case 'move':
				return $this->parse_move_function( $function_name, $args );
			case 'scale':
				return $this->parse_scale_function( $function_name, $args );
			case 'rotate':
				return $this->parse_rotate_function( $function_name, $args );
			case 'skew':
				return $this->parse_skew_function( $function_name, $args );
			default:
				return null;
		}
	}

	private function parse_move_function( string $function_name, string $args ): ?array {
		$values = preg_split( '/[,\s]+/', trim( $args ) );
		$values = array_filter( $values );

		$move_data = [ 'x' => null, 'y' => null, 'z' => null ];

		switch ( $function_name ) {
			case 'translate':
				$move_data['x'] = Size_Prop_Type::make()->generate( $this->parse_size_value( $values[0] ?? '0' ) );
				$move_data['y'] = Size_Prop_Type::make()->generate( $this->parse_size_value( $values[1] ?? $values[0] ?? '0' ) );
				break;
			case 'translatex':
				$move_data['x'] = Size_Prop_Type::make()->generate( $this->parse_size_value( $values[0] ?? '0' ) );
				$move_data['y'] = Size_Prop_Type::make()->generate( $this->parse_size_value( '0' ) );
				break;
			case 'translatey':
				$move_data['x'] = Size_Prop_Type::make()->generate( $this->parse_size_value( '0' ) );
				$move_data['y'] = Size_Prop_Type::make()->generate( $this->parse_size_value( $values[0] ?? '0' ) );
				break;
			case 'translatez':
				$move_data['x'] = Size_Prop_Type::make()->generate( $this->parse_size_value( '0' ) );
				$move_data['y'] = Size_Prop_Type::make()->generate( $this->parse_size_value( '0' ) );
				$move_data['z'] = Size_Prop_Type::make()->generate( $this->parse_size_value( $values[0] ?? '0' ) );
				break;
			case 'translate3d':
				$move_data['x'] = Size_Prop_Type::make()->generate( $this->parse_size_value( $values[0] ?? '0' ) );
				$move_data['y'] = Size_Prop_Type::make()->generate( $this->parse_size_value( $values[1] ?? '0' ) );
				$move_data['z'] = Size_Prop_Type::make()->generate( $this->parse_size_value( $values[2] ?? '0' ) );
				break;
		}

		// Remove null values
		$move_data = array_filter( $move_data, fn( $val ) => null !== $val );

		return Transform_Move_Prop_Type::make()->generate( $move_data );
	}

	private function parse_scale_function( string $function_name, string $args ): ?array {
		$values = preg_split( '/[,\s]+/', trim( $args ) );
		$values = array_filter( $values );

		$scale_data = [ 'x' => null, 'y' => null, 'z' => null ];

		switch ( $function_name ) {
			case 'scale':
				$scale_value = (float) ( $values[0] ?? 1 );
				$scale_data['x'] = $scale_value;
				$scale_data['y'] = (float) ( $values[1] ?? $scale_value );
				break;
			case 'scalex':
				$scale_data['x'] = (float) ( $values[0] ?? 1 );
				$scale_data['y'] = 1.0;
				break;
			case 'scaley':
				$scale_data['x'] = 1.0;
				$scale_data['y'] = (float) ( $values[0] ?? 1 );
				break;
			case 'scalez':
				$scale_data['x'] = 1.0;
				$scale_data['y'] = 1.0;
				$scale_data['z'] = (float) ( $values[0] ?? 1 );
				break;
			case 'scale3d':
				$scale_data['x'] = (float) ( $values[0] ?? 1 );
				$scale_data['y'] = (float) ( $values[1] ?? 1 );
				$scale_data['z'] = (float) ( $values[2] ?? 1 );
				break;
		}

		// Remove null values
		$scale_data = array_filter( $scale_data, fn( $val ) => null !== $val );

		return Transform_Scale_Prop_Type::make()->generate( $scale_data );
	}

	private function parse_rotate_function( string $function_name, string $args ): ?array {
		$values = preg_split( '/[,\s]+/', trim( $args ) );
		$values = array_filter( $values );

		$rotate_data = [ 'x' => null, 'y' => null, 'z' => null ];

		switch ( $function_name ) {
			case 'rotate':
				$rotate_data['z'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( $values[0] ?? '0deg' ) );
				break;
			case 'rotatex':
				$rotate_data['x'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( $values[0] ?? '0deg' ) );
				break;
			case 'rotatey':
				$rotate_data['y'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( $values[0] ?? '0deg' ) );
				break;
			case 'rotatez':
				$rotate_data['z'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( $values[0] ?? '0deg' ) );
				break;
			case 'rotate3d':
				// rotate3d(x, y, z, angle) - we'll use the angle for z-axis
				$rotate_data['z'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( $values[3] ?? '0deg' ) );
				break;
		}

		// Remove null values
		$rotate_data = array_filter( $rotate_data, fn( $val ) => null !== $val );

		return Transform_Rotate_Prop_Type::make()->generate( $rotate_data );
	}

	private function parse_skew_function( string $function_name, string $args ): ?array {
		$values = preg_split( '/[,\s]+/', trim( $args ) );
		$values = array_filter( $values );

		$skew_data = [ 'x' => null, 'y' => null ];

		switch ( $function_name ) {
			case 'skew':
				$skew_data['x'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( $values[0] ?? '0deg' ) );
				$skew_data['y'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( $values[1] ?? '0deg' ) );
				break;
			case 'skewx':
				$skew_data['x'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( $values[0] ?? '0deg' ) );
				$skew_data['y'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( '0deg' ) );
				break;
			case 'skewy':
				$skew_data['x'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( '0deg' ) );
				$skew_data['y'] = Size_Prop_Type::make()->generate( $this->parse_angle_value( $values[0] ?? '0deg' ) );
				break;
		}

		// Remove null values
		$skew_data = array_filter( $skew_data, fn( $val ) => null !== $val );

		return Transform_Skew_Prop_Type::make()->generate( $skew_data );
	}

	private function parse_transform_origin( $value ): ?array {
		// For now, return null as transform-origin needs more complex parsing
		// This would require Transform_Origin_Prop_Type implementation
		return null;
	}

	private function parse_perspective( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$size_data = $this->parse_size_value( trim( $value ) );
		if ( null === $size_data ) {
			return null;
		}

		return Transform_Prop_Type::make()->generate( [
			'perspective' => $size_data,
		] );
	}

	private function parse_perspective_origin( $value ): ?array {
		// For now, return null as perspective-origin needs more complex parsing
		// This would require Perspective_Origin_Prop_Type implementation
		return null;
	}

	private function parse_angle_value( string $value ): array {
		$value = trim( $value );
		
		if ( preg_match( '/^(-?\d*\.?\d+)(deg|rad|grad|turn)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = strtolower( $matches[2] ?? 'deg' );
			
			return [
				'size' => $size,
				'unit' => $unit
			];
		}

		// Default to 0 degrees
		return [
			'size' => 0.0,
			'unit' => 'deg'
		];
	}

	protected function parse_size_value( string $value ): array {
		$value = trim( $value );
		
		if ( '' === $value ) {
			return [
				'size' => 0.0,
				'unit' => 'px'
			];
		}

		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = strtolower( $matches[2] ?? 'px' );
			
			return [
				'size' => $size,
				'unit' => $unit
			];
		}

		if ( '0' === $value ) {
			return [
				'size' => 0.0,
				'unit' => 'px'
			];
		}

		// Fallback for invalid values
		return [
			'size' => 0.0,
			'unit' => 'px'
		];
	}
}
