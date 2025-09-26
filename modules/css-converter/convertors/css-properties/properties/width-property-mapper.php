<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

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
 * 🚫 FALLBACK STATUS: NONE - This mapper has zero fallbacks
 * ✅ COMPLIANCE: 100% atomic widget based
 */
class Width_Property_Mapper extends Property_Mapper_Base {

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

		return $this->create_v4_property_with_type( 
			$property, 
			'size', 
			$parsed_value 
		);
	}

	public function supports_v4_conversion( string $property, $value ): bool {
		return $this->supports( $property ) && $this->is_valid_css_value( $value );
	}

	public function get_v4_property_name( string $property ): string {
		return $property;
	}

	public function map_to_schema( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		$parsed_value = $this->parse_width_value( $value );
		if ( null === $parsed_value ) {
			return null;
		}

		return [
			$property => [
				'$$type' => 'size',
				'value' => $parsed_value
			]
		];
	}

	private function parse_width_value( $value ): ?array {
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
