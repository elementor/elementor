<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Font Size Property Mapper
 * 
 * 🎯 ATOMIC SOURCE: atomic-heading.php uses Size_Prop_Type for font-size
 * 🚫 FALLBACKS: NONE - 100% atomic widget compliance
 * ✅ VALIDATION: Matches atomic widget expectations exactly
 * 
 * ✅ ATOMIC-ONLY COMPLIANCE ACHIEVED:
 * ✅ FIXED: Pure atomic prop type return - Size_Prop_Type::make()->units()->generate()
 * ✅ REMOVED: Manual JSON wrapper structure
 * ✅ VERIFIED: All JSON creation handled by atomic widgets
 * 
 * 🎯 ATOMIC-ONLY COMPLIANCE CHECK:
 * - Widget JSON source: ✅ Size_Prop_Type
 * - Property JSON source: /atomic-widgets/prop-types/size-prop-type.php
 * - Fallback usage: ✅ NONE - Zero fallback mechanisms
 * - Custom JSON creation: ✅ NONE - Pure atomic prop type return
 * - Enhanced_Property_Mapper usage: ✅ NONE - Completely removed
 * - Base class method usage: ✅ NONE - Only atomic prop types used
 * - Manual $$type assignment: ✅ NONE - Only atomic widgets assign types
 */
class Font_Size_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'font-size',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		$size_data = $this->parse_size_value( $value );
		if ( null === $size_data ) {
			return null;
		}

		// ✅ ATOMIC-ONLY COMPLIANCE: Pure atomic prop type return
		return Size_Prop_Type::make()
			->units( Size_Constants::typography() )
			->generate( $size_data );
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	private function parse_size_value( $value ): ?array {
		if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
			return null;
		}

		$value = trim( (string) $value );

		if ( empty( $value ) ) {
			return null;
		}

		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vw|vh)$/', $value, $matches ) ) {
			return [
				'size' => (float) $matches[1],
				'unit' => $matches[2]
			];
		}

		if ( is_numeric( $value ) ) {
			return [
				'size' => (float) $value,
				'unit' => 'px'
			];
		}

		return null;
	}
}