<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts\Property_Mapper_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 🚫 DEPRECATED: Property_Mapper_Base - Use Atomic_Property_Mapper_Base instead
 * 
 * This class has been COMPLETELY STRIPPED of all non-atomic methods.
 * All property mappers now use Atomic_Property_Mapper_Base.
 * 
 * ✅ FOR NEW MAPPERS: Use Atomic_Property_Mapper_Base
 * 🚫 THIS CLASS: Only kept for interface compatibility - contains no implementation
 * 
 * 🎯 ATOMIC-ONLY ENFORCEMENT:
 * - ALL manual JSON creation methods REMOVED
 * - ALL fallback mechanisms REMOVED  
 * - ALL helper methods that enable non-atomic patterns REMOVED
 * - ALL legacy parsing methods REMOVED
 * - Magic method prevents calling any non-existent methods
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
	 * 🚫 ATOMIC-ONLY ENFORCEMENT: Prevent any method calls
	 * 
	 * This magic method prevents developers from accidentally calling
	 * any methods that used to exist in this class.
	 * 
	 * ALL MAPPERS SHOULD USE Atomic_Property_Mapper_Base INSTEAD.
	 */
	public function __call( string $method, array $args ) {
		throw new \Exception(
			"ATOMIC-ONLY VIOLATION: Method '{$method}' has been REMOVED from Property_Mapper_Base. " .
			"All property mappers must use Atomic_Property_Mapper_Base instead. " .
			"Use atomic prop types directly: Size_Prop_Type::make()->generate(), " .
			"Color_Prop_Type::make()->generate(), Dimensions_Prop_Type::make()->generate(), etc."
		);
	}
}