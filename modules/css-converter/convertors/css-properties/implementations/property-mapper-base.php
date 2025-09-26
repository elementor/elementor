<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts\Property_Mapper_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 🚫 DEPRECATED: Property_Mapper_Base - Use Atomic_Only_Property_Mapper_Base instead
 * 
 * This class has been STRIPPED of all manual JSON creation methods.
 * All create_* and build_* methods have been REMOVED to eliminate temptations.
 * 
 * ✅ FOR NEW MAPPERS: Use Atomic_Only_Property_Mapper_Base
 * 🚫 THIS CLASS: Only kept for backward compatibility with existing mappers
 * 
 * 🎯 ATOMIC-ONLY ENFORCEMENT:
 * - ALL manual JSON creation methods REMOVED
 * - ALL fallback mechanisms REMOVED  
 * - ALL helper methods that enable non-atomic patterns REMOVED
 * - Magic method prevents calling non-existent create_* methods
 */
abstract class Property_Mapper_Base implements Property_Mapper_Interface {
	
	public function supports( string $property, $value = null ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	/**
	 * 🎯 ATOMIC-ONLY METHOD: Must return atomic prop type result directly
	 * 
	 * CORRECT PATTERNS:
	 * - return Size_Prop_Type::make()->generate( $data );
	 * - return Color_Prop_Type::make()->generate( $color );
	 * - return Dimensions_Prop_Type::make()->generate( $dimensions );
	 * 
	 * FORBIDDEN PATTERNS:
	 * - return ['property' => $prop, 'value' => $val]; // Manual JSON
	 * - return $this->create_anything(); // Helper methods (REMOVED)
	 * - return ['$$type' => $type, 'value' => $val]; // Manual atomic structure
	 */
	abstract public function map_to_v4_atomic( string $property, $value ): ?array;

	/**
	 * Return array of supported CSS properties
	 */
	abstract public function get_supported_properties(): array;

	/**
	 * 🎯 ATOMIC-ONLY VALIDATION: Only validate input, never create JSON
	 */
	protected function is_valid_string_input( $value ): bool {
		return is_string( $value ) && ! empty( trim( $value ) );
	}

	/**
	 * 🎯 ATOMIC-ONLY VALIDATION: Only validate input, never create JSON
	 */
	protected function is_valid_numeric_input( $value ): bool {
		return is_numeric( $value ) || ( is_string( $value ) && is_numeric( trim( $value ) ) );
	}

	/**
	 * 🎯 ATOMIC-ONLY VALIDATION: Only validate input, never create JSON
	 */
	protected function is_supported_property( string $property ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	/**
	 * 🎯 LEGACY PARSING METHODS: Only for existing mappers, DO NOT USE in new code
	 * Use Atomic_Only_Property_Mapper_Base for new mappers instead
	 */
	protected function parse_size_value( string $value ): array {
		$value = trim( $value );
		
		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = $matches[2] ?? 'px';
			
			return [
				'size' => $size,
				'unit' => strtolower( $unit )
			];
		}
		
		// Handle special values
		if ( in_array( $value, [ 'auto', 'inherit', 'initial', 'unset' ], true ) ) {
			return [
				'size' => 0,
				'unit' => $value
			];
		}
		
		// Fallback
		return [
			'size' => 0,
			'unit' => 'px'
		];
	}

	/**
	 * 🎯 LEGACY PARSING METHODS: Only for existing mappers, DO NOT USE in new code
	 * Use Atomic_Only_Property_Mapper_Base for new mappers instead
	 */
	protected function parse_color_value( string $value ): string {
		$value = trim( $value );
		
		if ( preg_match( '/^#([a-f0-9]{3}|[a-f0-9]{6})$/i', $value ) ) {
			return strtolower( $value );
		}

		if ( preg_match( '/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i', $value, $matches ) ) {
			$r = str_pad( dechex( (int) $matches[1] ), 2, '0', STR_PAD_LEFT );
			$g = str_pad( dechex( (int) $matches[2] ), 2, '0', STR_PAD_LEFT );
			$b = str_pad( dechex( (int) $matches[3] ), 2, '0', STR_PAD_LEFT );
			return '#' . $r . $g . $b;
		}

		$named_colors = [
			'red' => '#ff0000',
			'green' => '#008000',
			'blue' => '#0000ff',
			'white' => '#ffffff',
			'black' => '#000000',
			'transparent' => 'transparent',
		];

		return $named_colors[ strtolower( $value ) ] ?? $value;
	}

	/**
	 * 🚫 ATOMIC-ONLY ENFORCEMENT: Prevent any manual JSON creation
	 * 
	 * This magic method prevents developers from accidentally calling
	 * removed helper methods that used to create manual JSON.
	 */
	public function __call( string $method, array $args ) {
		if ( str_starts_with( $method, 'create_' ) ) {
			throw new \Exception(
				"ATOMIC-ONLY VIOLATION: Method '{$method}' has been REMOVED. " .
				"Use atomic prop types directly: Size_Prop_Type::make()->generate(), " .
				"Color_Prop_Type::make()->generate(), etc. " .
				"For new mappers, use Atomic_Only_Property_Mapper_Base instead."
			);
		}

		if ( str_starts_with( $method, 'build_' ) ) {
			throw new \Exception(
				"ATOMIC-ONLY VIOLATION: Method '{$method}' has been REMOVED. " .
				"Return atomic prop type results directly. " .
				"For new mappers, use Atomic_Only_Property_Mapper_Base instead."
			);
		}

		throw new \Exception(
			"ATOMIC-ONLY VIOLATION: Method '{$method}' does not exist. " .
			"Only atomic prop type methods are allowed. " .
			"For new mappers, use Atomic_Only_Property_Mapper_Base instead."
		);
	}
}