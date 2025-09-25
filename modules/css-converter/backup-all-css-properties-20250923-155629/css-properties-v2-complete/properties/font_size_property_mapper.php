<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Font Size Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: e-heading, e-paragraph use Size_Prop_Type for font-size
 * Prop Type: /atomic-widgets/prop-types/size-prop-type.php
 * Expected: {"$$type": "size", "value": {"size": 16, "unit": "px"}}
 * 
 * REQUIREMENTS:
 * - Must be valid CSS size value with unit
 * - Used in text-based widgets
 * - Size type with numeric size and string unit
 */
class Font_Size_Property_Mapper extends Modern_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['font-size'];
	private const ATOMIC_WIDGET = 'e-heading';
	private const PROP_TYPE = 'Size_Prop_Type';

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_value = $this->parse_font_size_value( $value );
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

	private function parse_font_size_value( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		if ( empty( $value ) ) {
			return null;
		}

		// Handle named font sizes
		$named_sizes = [
			'xx-small' => ['size' => 9, 'unit' => 'px'],
			'x-small' => ['size' => 10, 'unit' => 'px'],
			'small' => ['size' => 13, 'unit' => 'px'],
			'medium' => ['size' => 16, 'unit' => 'px'],
			'large' => ['size' => 18, 'unit' => 'px'],
			'x-large' => ['size' => 24, 'unit' => 'px'],
			'xx-large' => ['size' => 32, 'unit' => 'px'],
		];

		$normalized = strtolower( $value );
		if ( isset( $named_sizes[ $normalized ] ) ) {
			return $named_sizes[ $normalized ];
		}

		// Handle relative sizes
		if ( 'smaller' === $normalized ) {
			return ['size' => 0.8, 'unit' => 'em'];
		}
		
		if ( 'larger' === $normalized ) {
			return ['size' => 1.2, 'unit' => 'em'];
		}

		// Handle numeric sizes
		return $this->parse_size_value( $value );
	}
}
