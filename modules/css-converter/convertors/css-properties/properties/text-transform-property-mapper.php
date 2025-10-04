<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Text Transform Property Mapper
 * 
 * 🎯 ATOMIC SOURCE VERIFICATION:
 * - Atomic Widget: /atomic-widgets/styles/style-schema.php line 156
 * - Prop Type: String_Prop_Type with enum values
 * - Expected Structure: {"$$type":"string","value":"uppercase"}
 * - Validation Rules: Enum values (none, capitalize, uppercase, lowercase)
 * 
 * 🚫 FALLBACK STATUS: NONE - This mapper has zero fallbacks
 * 
 * ✅ COMPLIANCE: 100% atomic widget based
 */
class Text_Transform_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'text-transform',
	];

	private const VALID_VALUES = [
		'none',
		'capitalize',
		'uppercase',
		'lowercase',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		// 🎯 ATOMIC SOURCE: String_Prop_Type enum validation from style-schema.php
		if ( ! in_array( $value, self::VALID_VALUES, true ) ) {
			return null;
		}

		// 🎯 ATOMIC SOURCE: String_Prop_Type structure from atomic widgets
		// 🚫 FALLBACK: NONE
		// ✅ STRUCTURE: Matches atomic widget exactly
		return $this->create_atomic_string_value( $property, $value );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}
}
