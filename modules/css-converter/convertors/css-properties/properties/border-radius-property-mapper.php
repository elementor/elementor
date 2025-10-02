<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Border Radius Property Mapper
 *
 * 🎯 ATOMIC SOURCE VERIFICATION:
 * - Atomic Widget: style-schema.php uses Border_Radius_Prop_Type for border-radius
 * - Prop Type: /atomic-widgets/prop-types/border-radius-prop-type.php
 * - Expected Structure: {"$$type":"border-radius","value":{"start-start":{"$$type":"size","value":{"size":10,"unit":"px"}},...}}
 * - Validation Rules: Logical corner properties (start-start, start-end, end-start, end-end)
 * - Transformer: Multi_Props_Transformer maps to border-{corner}-radius CSS properties
 *
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
 *
 * ✅ SUPPORTED PROPERTIES:
 * - Physical: border-radius, border-top-left-radius, border-top-right-radius, etc.
 * - Logical: border-start-start-radius, border-start-end-radius, etc. (mapped to physical)
 *
 * ❌ UNSUPPORTED (Atomic Widget Limitations):
 * - Elliptical syntax: border-radius: 50px / 20px (not supported by Border_Radius_Prop_Type)
 * - Complex elliptical: border-radius: 50px 20px / 10px 40px
 */
class Border_Radius_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'border-radius',
		'border-top-left-radius',
		'border-top-right-radius',
		'border-bottom-left-radius',
		'border-bottom-right-radius',
		'border-start-start-radius',
		'border-start-end-radius',
		'border-end-start-radius',
		'border-end-end-radius'
	];

	private const LOGICAL_TO_PHYSICAL_MAPPING = [
		'border-start-start-radius' => 'border-top-left-radius',
		'border-start-end-radius' => 'border-top-right-radius',
		'border-end-start-radius' => 'border-bottom-left-radius',
		'border-end-end-radius' => 'border-bottom-right-radius',
	];

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		// For simple border-radius values (like "10px"), use Size_Prop_Type directly
		if ( 'border-radius' === $property && $this->is_simple_border_radius( $value ) ) {
			$size_value = $this->parse_size_value( $value );
			if ( null === $size_value ) {
				return null;
			}
			// Return atomic prop type result directly (no property wrapper)
			return Size_Prop_Type::make()
				->units( Size_Constants::border() )
				->generate( $size_value );
		}

		// For individual corner properties, create Border_Radius_Prop_Type structure
		// This matches the editor JSON format: "border-radius" with specific corner set
		$size_value = $this->parse_size_value( $value );
		if ( null === $size_value ) {
			return null;
		}

		// Map physical property to logical corner
		$corner_map = [
			'border-top-left-radius' => 'start-start',
			'border-top-right-radius' => 'start-end',
			'border-bottom-right-radius' => 'end-end',
			'border-bottom-left-radius' => 'end-start',
		];

		$physical_property = $this->map_logical_to_physical( $property );
		$logical_corner = $corner_map[ $physical_property ] ?? null;
		
		if ( null === $logical_corner ) {
			return null;
		}

		// Create Border_Radius_Prop_Type structure with only the specific corner
		$border_radius_value = [
			$logical_corner => Size_Prop_Type::make()
				->units( Size_Constants::border() )
				->generate( $size_value )
		];

		// Return as "border-radius" property (not individual corner property)
		return [
			'property' => 'border-radius',
			'value' => Border_Radius_Prop_Type::make()->generate( $border_radius_value )
		];
	}private function parse_border_radius_value( string $property, $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		if ( empty( $value ) ) {
			return null;
		}

		// Skip elliptical border-radius (not supported by atomic widgets)
		if ( str_contains( $value, '/' ) ) {
			return null;
		}

		// Handle individual corner properties (physical and logical)
		if ( 'border-radius' !== $property ) {
			return $this->convert_individual_corner_to_shorthand( $property, $value );
		}

		// Handle shorthand border-radius property
		return $this->parse_shorthand_border_radius( $value );
	}

	private function convert_individual_corner_to_shorthand( string $property, string $value ): ?array {
		// Convert individual corner properties to shorthand format
		// e.g., border-top-left-radius: 90px → border-radius: 90px 0px 0px 0px
		
		// Map logical properties to physical properties first
		$physical_property = $this->map_logical_to_physical( $property );
		
		$corner_map = [
			'border-top-left-radius' => 0,     // top-left is first in shorthand
			'border-top-right-radius' => 1,    // top-right is second
			'border-bottom-right-radius' => 2, // bottom-right is third
			'border-bottom-left-radius' => 3,  // bottom-left is fourth
		];

		$corner_index = $corner_map[ $physical_property ] ?? null;
		if ( null === $corner_index ) {
			return null;
		}

		$size_value = $this->parse_size_value( $value );
		
		// Map corner index to logical property
		$corner_mapping = [
			0 => 'start-start', // top-left
			1 => 'start-end',   // top-right
			2 => 'end-end',     // bottom-right
			3 => 'end-start',   // bottom-left
		];
		
		$logical_corner = $corner_mapping[ $corner_index ];
		
		// ✅ SUGGESTION IMPLEMENTED: Pass specific corner value and set others to null
		// This matches the atomic widget transformer pattern
		$result = [
			'start-start' => null, // top-left
			'start-end' => null,   // top-right
			'end-end' => null,     // bottom-right
			'end-start' => null,   // bottom-left
		];
		
		// Set only the specific corner to the actual value
		$result[ $logical_corner ] = $this->create_size_prop( $size_value );
		
		return $result;
	}

	private function parse_individual_corner( string $property, string $value ): ?array {
		// Map logical properties to physical properties first
		$physical_property = $this->map_logical_to_physical( $property );
		
		$corner_map = [
			'border-top-left-radius' => 'start-start',
			'border-top-right-radius' => 'start-end',
			'border-bottom-left-radius' => 'end-start',
			'border-bottom-right-radius' => 'end-end',
		];

		$logical_corner = $corner_map[ $physical_property ] ?? null;
		if ( null === $logical_corner ) {
			return null;
		}

		$size_value = $this->parse_size_value( $value );
		
		// ✅ OPTIMIZED: Only include the corner with a value (matches Elementor editor behavior)
		// The atomic widget system supports partial corner definitions
		$result = [];
		$result[ $logical_corner ] = $this->create_size_prop( $size_value );
		
		return $result;
	}

	private function parse_shorthand_border_radius( string $value ): ?array {
		// Handle CSS shorthand: 1, 2, 3, or 4 values
		$values = preg_split( '/\s+/', trim( $value ) );
		$values = array_filter( $values );

		if ( empty( $values ) ) {
			return null;
		}

		// Parse each value to size objects
		$parsed_values = array_map( [ $this, 'parse_size_value' ], $values );

		// Apply CSS shorthand logic
		switch ( count( $values ) ) {
			case 1:
				// All corners same
				$size_prop = $this->create_size_prop( $parsed_values[0] );
				return [
					'start-start' => $size_prop,
					'start-end' => $size_prop,
					'end-start' => $size_prop,
					'end-end' => $size_prop,
				];

			case 2:
				// Top-left/bottom-right, top-right/bottom-left
				$tl_br = $this->create_size_prop( $parsed_values[0] );
				$tr_bl = $this->create_size_prop( $parsed_values[1] );
				return [
					'start-start' => $tl_br,  // top-left
					'start-end' => $tr_bl,    // top-right
					'end-start' => $tr_bl,    // bottom-left
					'end-end' => $tl_br,      // bottom-right
				];

			case 3:
				// Top-left, top-right/bottom-left, bottom-right
				return [
					'start-start' => $this->create_size_prop( $parsed_values[0] ), // top-left
					'start-end' => $this->create_size_prop( $parsed_values[1] ),   // top-right
					'end-start' => $this->create_size_prop( $parsed_values[1] ),   // bottom-left (same as top-right)
					'end-end' => $this->create_size_prop( $parsed_values[2] ),     // bottom-right
				];

			case 4:
				// Top-left, top-right, bottom-right, bottom-left
				return [
					'start-start' => $this->create_size_prop( $parsed_values[0] ), // top-left
					'start-end' => $this->create_size_prop( $parsed_values[1] ),   // top-right
					'end-end' => $this->create_size_prop( $parsed_values[2] ),     // bottom-right
					'end-start' => $this->create_size_prop( $parsed_values[3] ),   // bottom-left
				];

			default:
				return null;
		}
	}

	private function create_size_prop( array $size_value ): array {
		return Size_Prop_Type::make()->generate( $size_value );
	}

	private function create_zero_size(): array {
		return Size_Prop_Type::make()->generate( [
			'size' => 0.0,
			'unit' => 'px'
		] );
	}

	private function map_logical_to_physical( string $property ): string {
		return self::LOGICAL_TO_PHYSICAL_MAPPING[ $property ] ?? $property;
	}

	private function is_simple_border_radius( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( $value );
		
		// Simple border-radius is a single value (like "10px", "50%", "1rem")
		// Complex border-radius has multiple values (like "10px 20px") or elliptical syntax (like "10px / 5px")
		
		// Skip elliptical border-radius (not supported by Size_Prop_Type)
		if ( str_contains( $value, '/' ) ) {
			return false;
		}

		// Check if it's a single value (no spaces, or only one value)
		$values = preg_split( '/\s+/', trim( $value ) );
		$values = array_filter( $values );
		
		// Simple border-radius has exactly one value
		return count( $values ) === 1;
	}
}
