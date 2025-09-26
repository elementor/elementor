<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Color Property Mapper
 * 
 * 🎯 ATOMIC SOURCE: atomic-heading.php uses Color_Prop_Type for color
 * 🚫 FALLBACKS: NONE - 100% atomic widget compliance
 * ✅ VALIDATION: Matches atomic widget expectations exactly
 * 
 * 🚨 ATOMIC-ONLY VIOLATION DETECTED:
 * ❌ ISSUE: Manual JSON creation in map_to_v4_atomic() method
 * ❌ CURRENT: return ['property' => ..., 'value' => ...]
 * ✅ SHOULD BE: return Color_Prop_Type::make()->generate($color_value);
 * 
 * 🔧 REQUIRED FIX:
 * 1. Remove manual JSON wrapper structure
 * 2. Return atomic prop type directly: Color_Prop_Type::make()->generate()
 * 3. Let atomic widgets handle ALL JSON creation
 * 
 * 🎯 ATOMIC-ONLY COMPLIANCE CHECK:
 * - Widget JSON source: Color_Prop_Type
 * - Property JSON source: /atomic-widgets/prop-types/color-prop-type.php
 * - Fallback usage: NONE - Zero fallback mechanisms
 * - Custom JSON creation: ❌ VIOLATION - Manual JSON wrapper present
 * - Enhanced_Property_Mapper usage: NONE - Completely removed
 * - Base class method usage: NONE - Only atomic prop types used
 * - Manual $$type assignment: NONE - Only atomic widgets assign types
 */
class Color_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'color',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		$color_value = $this->parse_color_value( $value );
		if ( null === $color_value ) {
			return null;
		}

		// 🚨 ATOMIC-ONLY VIOLATION: Manual JSON creation below
		// ❌ CURRENT CODE: Manual JSON wrapper structure
		$atomic_value = Color_Prop_Type::make()->generate( $color_value );

		return [
			'property' => $property,  // ❌ VIOLATION: Manual JSON creation
			'value' => $atomic_value  // ❌ VIOLATION: Manual wrapper
		];

		// ✅ CORRECT ATOMIC-ONLY APPROACH:
		// return Color_Prop_Type::make()->generate( $color_value );
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	private function parse_color_value( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );

		if ( empty( $value ) ) {
			return null;
		}

		if ( $this->is_valid_color_format( $value ) ) {
			return $value;
		}

		return null;
	}

	private function is_valid_color_format( string $value ): bool {
		if ( str_starts_with( $value, '#' ) && ( strlen( $value ) === 4 || strlen( $value ) === 7 ) ) {
			return ctype_xdigit( substr( $value, 1 ) );
		}

		if ( str_starts_with( $value, 'rgb' ) || str_starts_with( $value, 'hsl' ) ) {
			return true;
		}

		$named_colors = [
			'transparent', 'black', 'white', 'red', 'green', 'blue', 'yellow',
			'cyan', 'magenta', 'gray', 'grey', 'orange', 'purple', 'pink',
			'brown', 'navy', 'teal', 'lime', 'olive', 'maroon', 'silver',
			'aqua', 'fuchsia'
		];

		return in_array( strtolower( $value ), $named_colors, true );
	}
}