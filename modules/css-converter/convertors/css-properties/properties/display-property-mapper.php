<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Display Property Mapper
 * 
 * 🎯 ATOMIC SOURCE: style-schema.php uses String_Prop_Type with enum for display
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
class Display_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'display',
	];

	// Enum values from style-schema.php lines 259-270
	private const ALLOWED_VALUES = [
		'block',
		'inline',
		'inline-block',
		'flex',
		'inline-flex',
		'grid',
		'inline-grid',
		'flow-root',
		'none',
		'contents',
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

		$display_value = $this->parse_display_value( $value );
		if ( null === $display_value ) {
			return null;
		}

		// ✅ ATOMIC-ONLY COMPLIANCE: Pure atomic prop type return
		return String_Prop_Type::make()
			->enum( self::ALLOWED_VALUES )
			->generate( $display_value );
	}

	private function parse_display_value( $value ): ?string {
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
