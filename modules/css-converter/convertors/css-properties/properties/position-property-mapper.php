<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Position Property Mapper
 * 
 * 🎯 ATOMIC SOURCE: style-schema.php uses String_Prop_Type with enum for position
 * 🚫 FALLBACKS: NONE - 100% atomic widget compliance
 * ✅ VALIDATION: Matches atomic widget expectations exactly
 * 
 * ✅ ATOMIC-ONLY COMPLIANCE ACHIEVED:
 * ✅ IMPLEMENTATION: Pure atomic prop type return - String_Prop_Type::make()->enum()->generate()
 * ✅ VERIFIED: All JSON creation handled by atomic widgets
 * 
 * 🎯 ATOMIC-ONLY COMPLIANCE CHECK:
 * - Widget JSON source: ✅ String_Prop_Type
 * - Property JSON source: /atomic-widgets/prop-types/primitives/string-prop-type.php
 * - Fallback usage: ✅ NONE - Zero fallback mechanisms
 * - Custom JSON creation: ✅ NONE - Pure atomic prop type return
 * - Enhanced_Property_Mapper usage: ✅ NONE - Completely removed
 * - Base class method usage: ✅ NONE - Only atomic prop types used
 * - Manual $$type assignment: ✅ NONE - Only atomic widgets assign types
 */
class Position_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'position',
	];

	// Enum values from style-schema.php lines 93-99
	private const ALLOWED_VALUES = [
		'static',
		'relative',
		'absolute',
		'fixed',
		'sticky',
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

		$position_value = $this->parse_position_value( $value );
		if ( null === $position_value ) {
			return null;
		}

		// ✅ ATOMIC-ONLY COMPLIANCE: Pure atomic prop type return
		return String_Prop_Type::make()
			->enum( self::ALLOWED_VALUES )
			->generate( $position_value );
	}

	private function parse_position_value( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );

		if ( empty( $value ) ) {
			return null;
		}

		// Validate against atomic widget enum values
		if ( ! in_array( $value, self::ALLOWED_VALUES, true ) ) {
			return null;
		}

		return $value;
	}
}
