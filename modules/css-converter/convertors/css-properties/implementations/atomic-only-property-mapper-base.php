<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Contracts\Property_Mapper_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 🎯 ATOMIC-ONLY PROPERTY MAPPER BASE CLASS
 * 
 * This base class ELIMINATES ALL POSSIBILITIES for non-atomic implementations.
 * 
 * ✅ ATOMIC-ONLY ENFORCEMENT:
 * - NO manual JSON creation methods
 * - NO fallback mechanisms  
 * - NO string type helpers
 * - NO create_v4_property methods
 * - NO build_property_response methods
 * - NO manual $$type assignment
 * 
 * 🚫 REMOVED TEMPTATIONS:
 * - All helper methods that enable manual JSON
 * - All fallback creation patterns
 * - All non-atomic return structures
 * 
 * ✅ ONLY ATOMIC PATTERNS POSSIBLE:
 * - Direct atomic prop type usage: Size_Prop_Type::make()->generate()
 * - Pure atomic returns: return $atomic_prop_type_result
 * - Zero manual JSON creation
 */
abstract class Atomic_Only_Property_Mapper_Base implements Property_Mapper_Interface {
	
	/**
	 * Check if this mapper supports a given property
	 */
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
	 * - return $this->create_anything(); // Helper methods
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

	// 🚫 NO OTHER METHODS ALLOWED
	// 🚫 NO create_* methods
	// 🚫 NO build_* methods  
	// 🚫 NO manual JSON helpers
	// 🚫 NO fallback mechanisms
	// 🚫 NO $$type assignment methods
	
	/**
	 * 🚫 ATOMIC-ONLY ENFORCEMENT: Prevent any manual JSON creation
	 * 
	 * This magic method prevents developers from accidentally calling
	 * non-existent helper methods that might create manual JSON.
	 */
	public function __call( string $method, array $args ) {
		if ( str_starts_with( $method, 'create_' ) ) {
			throw new \Exception(
				"ATOMIC-ONLY VIOLATION: Method '{$method}' is forbidden. " .
				"Use atomic prop types directly: Size_Prop_Type::make()->generate(), " .
				"Color_Prop_Type::make()->generate(), etc. " .
				"NO manual JSON creation allowed."
			);
		}

		if ( str_starts_with( $method, 'build_' ) ) {
			throw new \Exception(
				"ATOMIC-ONLY VIOLATION: Method '{$method}' is forbidden. " .
				"Return atomic prop type results directly. " .
				"NO manual JSON building allowed."
			);
		}

		throw new \Exception(
			"ATOMIC-ONLY VIOLATION: Method '{$method}' does not exist. " .
			"Only atomic prop type methods are allowed: " .
			"Size_Prop_Type::make()->generate(), Color_Prop_Type::make()->generate(), etc."
		);
	}
}
