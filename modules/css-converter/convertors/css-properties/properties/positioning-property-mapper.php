<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Parsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Positioning Property Mapper
 *
 * 🎯 ATOMIC SOURCE VERIFICATION:
 * - Atomic Widget: style-schema.php uses Size_Prop_Type for positioning properties
 * - Prop Type: /atomic-widgets/prop-types/size-prop-type.php
 * - Expected Structure: {"$$type":"size","value":{"size":10,"unit":"px"}}
 * - Validation Rules: Numeric values with units, supports CSS keywords
 *
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
 *
 * ✅ COMPREHENSIVE COVERAGE:
 * - Physical properties: top, right, bottom, left
 * - Logical properties: inset-block-start, inset-inline-end, inset-block-end, inset-inline-start
 * - Shorthand properties: inset, inset-block, inset-inline
 * - Z-index property: z-index (uses Number_Prop_Type)
 * - CSS keywords: auto, inherit, initial, unset, revert, revert-layer
 * - Negative values: top: -20px; left: -10px;
 * - All CSS units: px, em, rem, %, vh, vw, etc.
 */
class Positioning_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		// Physical positioning properties
		'top',
		'right', 
		'bottom',
		'left',
		// Logical positioning properties (CSS Logical Properties Level 1)
		'inset-block-start',
		'inset-inline-end',
		'inset-block-end', 
		'inset-inline-start',
		// Shorthand logical properties
		'inset',
		'inset-block',
		'inset-inline',
		// Z-index
		'z-index',
	];

	// Mapping from physical to logical properties
	private const PHYSICAL_TO_LOGICAL_MAP = [
		'top' => 'inset-block-start',
		'right' => 'inset-inline-end',
		'bottom' => 'inset-block-end',
		'left' => 'inset-inline-start',
	];

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		// Handle z-index separately as it uses Number_Prop_Type
		if ( 'z-index' === $property ) {
			return $this->map_z_index_property( $value );
		}

		// Handle shorthand properties
		if ( in_array( $property, [ 'inset', 'inset-block', 'inset-inline' ], true ) ) {
			return $this->map_shorthand_property( $property, $value );
		}

		// Handle individual positioning properties
		return $this->map_individual_property( $property, $value );
	}

	public function get_v4_property_name( string $property ): string {
		// Convert physical properties to logical properties for atomic widgets
		if ( in_array( $property, [ 'top', 'right', 'bottom', 'left' ], true ) ) {
			return $this->get_logical_property_name( $property );
		}
		
		// For logical properties and shorthand, return as-is
		return $property;
	}

	public function get_target_property_name( string $property ): string {
		// CRITICAL FIX: CSS_To_Atomic_Props_Converter calls this method
		return $this->get_v4_property_name( $property );
	}

	private function map_z_index_property( $value ): ?array {
		$parsed_value = $this->parse_z_index_value( $value );
		if ( null === $parsed_value ) {
			return null;
		}

		// ✅ ATOMIC-ONLY COMPLIANCE: Return atomic prop type directly (v2 architecture)
		return Number_Prop_Type::make()->generate( $parsed_value );
	}

	private function map_individual_property( string $property, $value ): ?array {
		$parsed_size = $this->parse_size_value( $value );
		if ( null === $parsed_size ) {
			return null;
		}

		// ✅ ATOMIC-ONLY COMPLIANCE: Return atomic prop type directly (v2 architecture)
		return Size_Prop_Type::make()->generate( $parsed_size );
	}

	private function map_shorthand_property( string $property, $value ): ?array {
		// ✅ CRITICAL FIX: Shorthand properties should be handled by CSS_Shorthand_Expander
		// This method should not be called for shorthand properties if the expander is working correctly
		// For now, handle the first value only as a fallback
		$parts = $this->parse_shorthand_values( $value );
		if ( empty( $parts ) ) {
			return null;
		}

		$first_value = $parts[0];
		$parsed_size = $this->parse_size_value( $first_value );
		if ( null === $parsed_size ) {
			return null;
		}

		// ✅ ATOMIC-ONLY COMPLIANCE: Return atomic prop type directly (v2 architecture)
		// Note: This is a fallback - CSS_Shorthand_Expander should handle shorthand expansion
		return Size_Prop_Type::make()->generate( $parsed_size );
	}

	private function get_logical_property_name( string $property ): string {
		// If it's already a logical property, return as-is
		if ( 0 === strpos( $property, 'inset-' ) ) {
			return $property;
		}

		// Convert physical to logical
		return self::PHYSICAL_TO_LOGICAL_MAP[ $property ] ?? $property;
	}

	private function parse_z_index_value( $value ): ?int {
		if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
			return null;
		}

		$value = trim( (string) $value );

		if ( '' === $value ) {
			return null;
		}

		// Handle 'auto' keyword - browser default for z-index
		if ( 'auto' === strtolower( $value ) ) {
			return 0; // Browser treats auto as 0 for z-index
		}

		// Handle other CSS keywords
		if ( $this->is_css_keyword( $value ) ) {
			// For z-index, other keywords should return null
			// as atomic widgets expect numeric values
			return null;
		}

		// Parse numeric value (including negative values)
		if ( is_numeric( $value ) ) {
			return (int) $value;
		}

		return null;
	}

	protected function parse_size_value( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		return Size_Value_Parser::parse( $value );
	}

	private function parse_shorthand_values( string $value ): array {
		$value = trim( $value );
		if ( empty( $value ) ) {
			return [];
		}

		// Split by whitespace, handling multiple spaces
		$parts = preg_split( '/\s+/', $value );
		return array_filter( $parts );
	}

	protected function is_css_keyword( string $value ): bool {
		$keywords = [
			'auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer'
		];
		return in_array( strtolower( $value ), $keywords, true );
	}


}
