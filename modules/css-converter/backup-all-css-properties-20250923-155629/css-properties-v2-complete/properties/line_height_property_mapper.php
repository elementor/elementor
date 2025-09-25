<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Line Height Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: Text widgets use Size_Prop_Type for line-height
 * Prop Type: /atomic-widgets/prop-types/size-prop-type.php
 * Expected: {"$$type": "size", "value": {"size": 1.5, "unit": ""}} or {"size": 24, "unit": "px"}
 * 
 * REQUIREMENTS:
 * - Must handle unitless values (line-height: 1.5)
 * - Must handle unit values (line-height: 24px)
 * - Used in text-based widgets
 * - Size type with numeric size and string unit (empty for unitless)
 */
class Line_Height_Property_Mapper extends Modern_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['line-height'];
	private const ATOMIC_WIDGET = 'e-paragraph';
	private const PROP_TYPE = 'Size_Prop_Type';

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_value = $this->parse_line_height_value( $value );
		if ( null === $parsed_value ) {
			return null;
		}

		$atomic_value = $this->create_atomic_property_with_type( 
			$property, 
			'size', 
			$parsed_value 
		);

		return $this->validate_against_atomic_schema( $property, $atomic_value ) 
			? $atomic_value 
			: null;
	}

	public function get_supported_atomic_widgets(): array {
		return [
			'e-heading',
			'e-paragraph',
			'e-button',
		];
	}

	public function get_required_prop_types(): array {
		return [self::PROP_TYPE];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function parse_line_height_value( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		if ( empty( $value ) || 'normal' === $value ) {
			return null;
		}

		// Handle unitless values (e.g., "1.5", "2")
		if ( is_numeric( $value ) ) {
			return [
				'size' => (float) $value,
				'unit' => '', // Unitless
			];
		}

		// Handle percentage values
		if ( preg_match( '/^(\d*\.?\d+)%$/', $value, $matches ) ) {
			return [
				'size' => (float) $matches[1] / 100, // Convert percentage to decimal
				'unit' => '', // Treat as unitless multiplier
			];
		}

		// Handle unit values (px, em, rem, etc.)
		return $this->parse_size_value( $value );
	}
}
