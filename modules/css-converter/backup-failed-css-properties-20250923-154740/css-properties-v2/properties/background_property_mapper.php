<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Background Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: Multiple atomic widgets use Background_Prop_Type for background
 * Prop Type: /atomic-widgets/prop-types/background-prop-type.php
 * Expected: {"$$type": "background", "value": {"background-overlay": [], "color": {...}, "clip": "..."}}
 * 
 * REQUIREMENTS:
 * - Complex nested structure with background-overlay array
 * - Color is Color_Prop_Type
 * - Clip is String_Prop_Type with enum values
 * - Background-overlay is array of overlay types
 * 
 * NOTE: This is a simplified implementation focusing on background-color
 * Full background shorthand parsing would require extensive overlay handling
 */
class Background_Property_Mapper extends Modern_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['background'];
	private const ATOMIC_WIDGET = 'e-container';
	private const PROP_TYPE = 'Background_Prop_Type';

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_background = $this->parse_background_value( $value );
		if ( null === $parsed_background ) {
			return null;
		}

		$atomic_value = $this->create_atomic_property_with_type( 
			$property, 
			'background', 
			$parsed_background 
		);

		return $this->validate_against_atomic_schema( $property, $atomic_value ) 
			? $atomic_value 
			: null;
	}

	public function get_supported_atomic_widgets(): array {
		return [
			'e-container',
			'e-flexbox',
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

	private function parse_background_value( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		if ( empty( $value ) || 'none' === $value || 'transparent' === $value ) {
			return $this->create_empty_background();
		}

		// For now, handle simple color backgrounds
		// TODO: Expand to handle images, gradients, and complex backgrounds
		$color = $this->extract_background_color( $value );
		
		return $this->create_background_structure( $color );
	}

	private function extract_background_color( string $value ): ?string {
		// Try to extract color from background shorthand
		// This is a simplified approach - full parsing would be much more complex
		
		// Check if it's just a color
		$parsed_color = $this->parse_color_value( $value );
		if ( $parsed_color ) {
			return $parsed_color;
		}

		// Try to find color in background shorthand
		$color_patterns = [
			'/rgba?\([^)]+\)/',
			'/hsla?\([^)]+\)/',
			'/#[a-f0-9]{3,6}/i',
			'/\b(?:red|green|blue|black|white|gray|grey|transparent|currentColor)\b/i',
		];

		foreach ( $color_patterns as $pattern ) {
			if ( preg_match( $pattern, $value, $matches ) ) {
				$parsed_color = $this->parse_color_value( $matches[0] );
				if ( $parsed_color ) {
					return $parsed_color;
				}
			}
		}

		return null;
	}

	private function create_background_structure( ?string $color ): array {
		$background = [
			'background-overlay' => [], // Empty array for now
			'clip' => 'border-box', // Default clip value
		];

		if ( $color ) {
			$background['color'] = ['$$type' => 'color', 'value' => $color];
		}

		return $background;
	}

	private function create_empty_background(): array {
		return [
			'background-overlay' => [],
			'clip' => 'border-box',
		];
	}
}
