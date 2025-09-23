<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Flex Direction Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: e-flexbox uses String_Prop_Type for flex-direction
 * Prop Type: /atomic-widgets/prop-types/string-prop-type.php
 * Expected: {"$$type": "string", "value": "row"}
 * 
 * REQUIREMENTS:
 * - Must be valid CSS flex-direction value
 * - Used in flexbox layout contexts
 * - String type with specific allowed values
 */
class Flex_Direction_Property_Mapper extends Modern_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['flex-direction'];
	private const ATOMIC_WIDGET = 'e-flexbox';
	private const PROP_TYPE = 'String_Prop_Type';
	
	private const VALID_VALUES = [
		'row',
		'row-reverse',
		'column',
		'column-reverse',
	];

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$normalized_value = $this->normalize_flex_direction_value( $value );
		if ( null === $normalized_value ) {
			return null;
		}

		$atomic_value = $this->create_atomic_property_with_type( 
			$property, 
			'string', 
			$normalized_value 
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

	private function normalize_flex_direction_value( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$normalized = trim( strtolower( $value ) );
		
		if ( empty( $normalized ) ) {
			return null;
		}

		return in_array( $normalized, self::VALID_VALUES, true ) ? $normalized : null;
	}
}
