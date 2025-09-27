<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Background Color Property Mapper
 *
 * 🎯 ATOMIC SOURCE: atomic widgets use Color_Prop_Type for background-color
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
 */
class Background_Color_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'background-color',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) || empty( trim( $value ) ) ) {
			return null;
		}

		$color_value = $this->parse_color_value( $value );
		if ( ! $this->is_valid_color_format( $color_value ) ) {
			return null;
		}

		// ✅ ATOMIC-ONLY COMPLIANCE: Pure atomic prop type return
		return Color_Prop_Type::make()->generate( $color_value );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	protected function parse_color_value( string $value ): string {
		$value = trim( $value );

		if ( empty( $value ) ) {
			return $value;
		}

		if ( $this->is_valid_color_format( $value ) ) {
			return $value;
		}

		return $value;
	}

	private function is_valid_color_format( string $value ): bool {
		if ( str_starts_with( $value, '#' ) && ( strlen( $value ) === 4 || strlen( $value ) === 7 ) ) {
			return ctype_xdigit( substr( $value, 1 ) );
		}

		if ( str_starts_with( $value, 'rgb' ) || str_starts_with( $value, 'hsl' ) ) {
			return true;
		}

		$named_colors = [
			'transparent', 'black', 'white', 'red', 'green', 'blue', 'yellow',
			'cyan', 'magenta', 'gray', 'grey', 'orange', 'purple', 'pink',
			'brown', 'navy', 'teal', 'lime', 'olive', 'maroon', 'silver',
			'aqua', 'fuchsia'
		];

		return in_array( strtolower( $value ), $named_colors, true );
	}
}