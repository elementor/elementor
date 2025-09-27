<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

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
class Border_Radius_Property_Mapper extends Property_Mapper_Base {

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
		error_log( "🔍 BORDER-RADIUS DEBUG: Starting map_to_v4_atomic for property='$property', value='$value'" );
		
		if ( ! $this->supports( $property ) ) {
			error_log( "❌ BORDER-RADIUS DEBUG: Property '$property' not supported" );
			return null;
		}

		$parsed_value = $this->parse_border_radius_value( $property, $value );
		if ( null === $parsed_value ) {
			error_log( "❌ BORDER-RADIUS DEBUG: Failed to parse value '$value' for property '$property'" );
			return null;
		}

		error_log( "✅ BORDER-RADIUS DEBUG: Parsed value: " . json_encode( $parsed_value ) );
		
		// ✅ ATOMIC-ONLY COMPLIANCE: Pure atomic prop type return
		$atomic_result = Border_Radius_Prop_Type::make()->generate( $parsed_value );
		error_log( "✅ BORDER-RADIUS DEBUG: Atomic result: " . json_encode( $atomic_result ) );
		
		return $atomic_result;
	}

	public function supports_v4_conversion( string $property, $value ): bool {
		return $this->supports( $property ) && $this->is_valid_css_value( $value );
	}

	public function get_v4_property_name( string $property ): string {
		return 'border-radius';
	}


	private function parse_border_radius_value( string $property, $value ): ?array {
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
		
		// ✅ OPTIMIZED: Use null for unset corners instead of 0px
		// The Multi_Props_Transformer filters out null values with isset(), so only the actual corner gets processed
		$shorthand_values = [null, null, null, null]; // Initialize all as null
		
		// Set the specific corner to the provided value
		$shorthand_values[ $corner_index ] = $this->create_size_prop( $size_value );
		
		// Convert to atomic widget format (logical properties)
		return [
			'start-start' => $shorthand_values[0], // top-left
			'start-end' => $shorthand_values[1],   // top-right
			'end-end' => $shorthand_values[2],     // bottom-right
			'end-start' => $shorthand_values[3],   // bottom-left
		];
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
		
		// ✅ OPTIMIZED: Use null for unset corners instead of 0px
		// The Multi_Props_Transformer filters out null values with isset(), so only the actual corner gets processed
		// This is cleaner and more performant than setting unused corners to 0px
		return [
			'start-start' => $logical_corner === 'start-start' ? $this->create_size_prop( $size_value ) : null,
			'start-end' => $logical_corner === 'start-end' ? $this->create_size_prop( $size_value ) : null,
			'end-start' => $logical_corner === 'end-start' ? $this->create_size_prop( $size_value ) : null,
			'end-end' => $logical_corner === 'end-end' ? $this->create_size_prop( $size_value ) : null,
		];
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
}
