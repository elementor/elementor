<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Letter Spacing Property Mapper
 * 
 * 🎯 ATOMIC SOURCE VERIFICATION:
 * - Atomic Widget: /atomic-widgets/styles/style-schema.php line 129
 * - Prop Type: Size_Prop_Type with typography units
 * - Expected Structure: {"$$type":"size","value":{"size":1,"unit":"px"}}
 * - Validation Rules: Typography units (px, em, rem, %, vw, vh, etc.)
 * 
 * 🚫 FALLBACK STATUS: NONE - This mapper has zero fallbacks
 * 
 * ✅ COMPLIANCE: 100% atomic widget based
 */
class Letter_Spacing_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'letter-spacing',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) || 'normal' === trim( $value ) ) {
			return null;
		}

		// 🎯 ATOMIC SOURCE: Size_Prop_Type validation from style-schema.php
		$parsed = $this->parse_size_value( $value );
		if ( null === $parsed ) {
			return null;
		}

		// 🎯 ATOMIC SOURCE: Size_Prop_Type structure from atomic widgets
		// 🚫 FALLBACK: NONE
		// ✅ STRUCTURE: Matches atomic widget exactly
		return $this->create_atomic_size_value( $property, $parsed );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}
}
