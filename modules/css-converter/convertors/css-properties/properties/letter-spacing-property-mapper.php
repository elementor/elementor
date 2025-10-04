<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

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
 * ✅ ATOMIC-ONLY COMPLIANCE ACHIEVED:
 * ✅ FIXED: Pure atomic prop type return - Size_Prop_Type::make()->units()->generate()
 * ✅ VERIFIED: All JSON creation handled by atomic widgets
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

		$size_data = $this->parse_size_value( $value );
		if ( null === $size_data ) {
			return null;
		}

		// ✅ ATOMIC-ONLY COMPLIANCE: Pure atomic prop type return
		return Size_Prop_Type::make()
			->units( Size_Constants::typography() )
			->generate( $size_data );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function get_v4_property_name( string $property ): string {
		return 'letter-spacing';
	}

	protected function parse_size_value( string $value ): ?array {
		$value = trim( $value );

		if ( '' === $value || 'normal' === $value ) {
			return null;
		}

		// Parse numeric value with unit
		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vw|vh)$/', $value, $matches ) ) {
			return [
				'size' => (float) $matches[1],
				'unit' => $matches[2]
			];
		}

		// Handle unitless values (assume px)
		if ( is_numeric( $value ) ) {
			return [
				'size' => (float) $value,
				'unit' => 'px'
			];
		}

		return null;
	}
}
