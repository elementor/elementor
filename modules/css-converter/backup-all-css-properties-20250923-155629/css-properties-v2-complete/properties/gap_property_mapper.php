<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Gap Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: e-flexbox uses Size_Prop_Type for gap
 * Prop Type: /atomic-widgets/prop-types/size-prop-type.php
 * Expected: {"$$type": "size", "value": {"size": 16, "unit": "px"}}
 * 
 * REQUIREMENTS:
 * - Must be valid CSS size value with unit
 * - Used in flexbox and grid layout contexts
 * - Size type with numeric size and string unit
 */
class Gap_Property_Mapper extends Modern_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['gap', 'row-gap', 'column-gap'];
	private const ATOMIC_WIDGET = 'e-flexbox';
	private const PROP_TYPE = 'Size_Prop_Type';

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_value = $this->parse_gap_value( $value );
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
		return [self::ATOMIC_WIDGET];
	}

	public function get_required_prop_types(): array {
		return [self::PROP_TYPE];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function parse_gap_value( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		if ( empty( $value ) || 'normal' === $value ) {
			return null;
		}

		// Handle gap shorthand (gap: 10px 20px)
		if ( 'gap' === $value && str_contains( $value, ' ' ) ) {
			$parts = preg_split( '/\s+/', $value );
			if ( count( $parts ) === 2 ) {
				// For gap shorthand, use the first value (row-gap)
				$value = $parts[0];
			}
		}

		return $this->parse_size_value( $value );
	}
}
