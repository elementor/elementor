<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Width Property Mapper
 *
 * 🎯 ATOMIC SOURCE VERIFICATION:
 * - Atomic Widget: style-schema.php uses Size_Prop_Type for width, height, min-width, max-width
 * - Prop Type: /atomic-widgets/prop-types/size-prop-type.php
 * - Expected Structure: {"$$type":"size","value":{"size":100,"unit":"px"}}
 * - Validation Rules: Numeric size values, supported units from Size_Constants
 *
 * ✅ ATOMIC-ONLY COMPLIANCE ACHIEVED:
 * ✅ FIXED: Pure atomic prop type return - Size_Prop_Type::make()->generate()
 * ✅ VERIFIED: All JSON creation handled by atomic widgets
 */
class Width_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'width',
		'height',
		'min-width',
		'min-height',
		'max-width',
		'max-height'
	];

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		$parsed_value = $this->parse_width_value( $value );
		if ( null === $parsed_value ) {
			return null;
		}

		// ✅ ATOMIC-ONLY COMPLIANCE: Pure atomic prop type return
		return Size_Prop_Type::make()->generate( $parsed_value );
	}protected function parse_width_value( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		if ( empty( $value ) ) {
			return null;
		}

		// Handle special CSS values
		$special_values = [
			'auto' => ['size' => '', 'unit' => 'auto'],
			'inherit' => null, // Not supported by atomic widgets
			'initial' => null, // Not supported by atomic widgets
			'unset' => null,   // Not supported by atomic widgets
		];

		$normalized = strtolower( $value );
		if ( array_key_exists( $normalized, $special_values ) ) {
			return $special_values[ $normalized ];
		}

		// Handle fit-content(), min-content, max-content
		if ( preg_match( '/^(fit-content|min-content|max-content)/i', $value ) ) {
			return ['size' => $value, 'unit' => 'custom'];
		}

		// Handle calc() expressions
		if ( preg_match( '/^calc\(/i', $value ) ) {
			return ['size' => $value, 'unit' => 'custom'];
		}

		// Use base class size parsing for standard values
		return $this->parse_size_value( $value );
	}
}
