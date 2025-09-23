<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Color Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: e-heading, e-paragraph use Color_Prop_Type for color
 * Prop Type: /atomic-widgets/prop-types/color-prop-type.php
 * Expected: {"$$type": "color", "value": "#ffffff"}
 * 
 * REQUIREMENTS:
 * - Must be valid CSS color value
 * - Supports hex, rgb, rgba, hsl, hsla, named colors
 * - Used in text-based widgets
 * - Color type extends String_Prop_Type
 */
class Color_Property_Mapper extends Modern_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['color'];
	private const ATOMIC_WIDGET = 'e-heading';
	private const PROP_TYPE = 'Color_Prop_Type';

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$normalized_color = $this->parse_color_value( $value );
		if ( null === $normalized_color ) {
			return null;
		}

		$atomic_value = $this->create_atomic_property_with_type( 
			$property, 
			'color', 
			$normalized_color 
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
}
