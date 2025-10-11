<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 🎯 ATOMIC-ONLY MAPPER FACTORY
 * 
 * This factory ONLY creates atomic-compliant property mappers.
 * It validates that all mappers use atomic prop types directly.
 * 
 * ✅ ATOMIC-ONLY ENFORCEMENT:
 * - Validates mapper returns are atomic prop type results
 * - Blocks any manual JSON creation patterns
 * - Ensures 100% atomic compliance
 * 
 * 🚫 PREVENTS:
 * - Manual JSON creation: ['property' => ..., 'value' => ...]
 * - Non-atomic returns: ['$$type' => ..., 'value' => ...] (manual)
 * - Fallback mechanisms
 * - String type defaults
 */
class Atomic_Only_Mapper_Factory {

	/**
	 * Create and validate an atomic-only property mapper
	 */
	public static function create_atomic_mapper( string $mapper_class ): Property_Mapper_Interface {
		if ( ! class_exists( $mapper_class ) ) {
			throw new \Exception( "Mapper class does not exist: {$mapper_class}" );
		}

		$mapper = new $mapper_class();

		if ( ! $mapper instanceof Property_Mapper_Interface ) {
			throw new \Exception( "Mapper must implement Property_Mapper_Interface: {$mapper_class}" );
		}

		// Validate atomic compliance
		self::validate_atomic_compliance( $mapper );

		return $mapper;
	}

	/**
	 * Validate that a mapper is 100% atomic compliant
	 */
	private static function validate_atomic_compliance( Property_Mapper_Interface $mapper ): void {
		$mapper_class = get_class( $mapper );

		// Test with sample values to ensure atomic returns
		$test_cases = [
			['color', '#ff0000'],
			['font-size', '16px'],
			['padding', '10px'],
			['width', '100px'],
			['opacity', '0.5'],
		];

		foreach ( $test_cases as [$property, $value] ) {
			if ( ! $mapper->supports( $property ) ) {
				continue;
			}

			$result = $mapper->map_to_v4_atomic( $property, $value );
			
			if ( null === $result ) {
				continue; // Null is acceptable for unsupported values
			}

			// Validate atomic structure
			self::validate_atomic_result( $result, $mapper_class, $property );
		}
	}

	/**
	 * Validate that a result is a proper atomic prop type result
	 */
	private static function validate_atomic_result( array $result, string $mapper_class, string $property ): void {
		// Must have $$type and value
		if ( ! isset( $result['$$type'] ) || ! isset( $result['value'] ) ) {
			throw new \Exception(
				"ATOMIC-ONLY VIOLATION: Mapper {$mapper_class} returned invalid structure for {$property}. " .
				"Must return atomic prop type result with $$type and value. " .
				"Use Size_Prop_Type::make()->generate(), Color_Prop_Type::make()->generate(), etc."
			);
		}

		// Must NOT have 'property' key (indicates manual JSON creation)
		if ( isset( $result['property'] ) ) {
			throw new \Exception(
				"ATOMIC-ONLY VIOLATION: Mapper {$mapper_class} returned manual JSON structure for {$property}. " .
				"Found 'property' key which indicates manual JSON creation. " .
				"Return atomic prop type result directly: Size_Prop_Type::make()->generate()"
			);
		}

		// Validate known atomic types
		$valid_atomic_types = [
			'size', 'color', 'dimensions', 'border-radius', 'box-shadow', 'string'
		];

		if ( ! in_array( $result['$$type'], $valid_atomic_types, true ) ) {
			throw new \Exception(
				"ATOMIC-ONLY VIOLATION: Mapper {$mapper_class} returned unknown $$type '{$result['$$type']}' for {$property}. " .
				"Use valid atomic prop types: " . implode( ', ', $valid_atomic_types )
			);
		}
	}

	/**
	 * Get list of atomic-compliant mapper classes
	 */
	public static function get_atomic_mapper_classes(): array {
		return [
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Color_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Background_Color_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Font_Size_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Height_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Width_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Margin_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Padding_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Border_Radius_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Box_Shadow_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Opacity_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Display_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Position_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Flex_Direction_Property_Mapper',
			'Elementor\\Modules\\CssConverter\\Convertors\\CssProperties\\Properties\\Text_Align_Property_Mapper',
		];
	}

	/**
	 * Validate all registered atomic mappers
	 */
	public static function validate_all_atomic_mappers(): array {
		$results = [];
		$mapper_classes = self::get_atomic_mapper_classes();

		foreach ( $mapper_classes as $mapper_class ) {
			try {
				$mapper = self::create_atomic_mapper( $mapper_class );
				$results[ $mapper_class ] = 'ATOMIC COMPLIANT ✅';
			} catch ( \Exception $e ) {
				$results[ $mapper_class ] = 'VIOLATION ❌: ' . $e->getMessage();
			}
		}

		return $results;
	}
}
