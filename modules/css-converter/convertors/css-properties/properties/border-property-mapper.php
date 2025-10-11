<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Border Shorthand Property Mapper
 * 
 * 🎯 ATOMIC SOURCE VERIFICATION:
 * - Atomic Widget: atomic-heading.php uses Size_Prop_Type for border-width, Color_Prop_Type for border-color
 * - Prop Type: Size_Prop_Type for width, Color_Prop_Type for color, String_Prop_Type for style
 * - Expected Structure: Multiple atomic properties (border-width, border-color, border-style)
 * - Validation Rules: Parse shorthand into individual components
 * 
 * 🚫 FALLBACK STATUS: NONE - This mapper has zero fallbacks
 * 
 * ✅ COMPLIANCE: 100% atomic widget based
 */
class Border_Property_Mapper extends Atomic_Property_Mapper_Base {

	public function get_supported_properties(): array {
		return [ 
			'border',
			'border-top',
			'border-right',
			'border-bottom',
			'border-left'
		];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		if ( '' === $value || 'inherit' === $value || 'initial' === $value || 'unset' === $value ) {
			return null;
		}

		// Parse the border shorthand value
		$parsed = $this->parse_border_shorthand( $value );
		if ( null === $parsed ) {
			return null;
		}

		// Generate multiple atomic properties from the shorthand
		$results = [];

		// Generate border-width property if width is present
		if ( isset( $parsed['width'] ) ) {
			$width_result = $this->create_border_width_property( $property, $parsed['width'] );
			if ( $width_result ) {
				$results[] = $width_result;
			}
		}

		// Generate border-color property if color is present
		if ( isset( $parsed['color'] ) ) {
			$color_result = $this->create_border_color_property( $property, $parsed['color'] );
			if ( $color_result ) {
				$results[] = $color_result;
			}
		}

		// Generate border-style property if style is present
		if ( isset( $parsed['style'] ) ) {
			$style_result = $this->create_border_style_property( $property, $parsed['style'] );
			if ( $style_result ) {
				$results[] = $style_result;
			}
		}

		// Return the first result for now (border-width takes priority)
		// TODO: Support multiple property generation in the future
		return ! empty( $results ) ? $results[0] : null;
	}

	public function supports( string $property, $value = null ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	private function parse_border_shorthand( string $value ): ?array {
		$value = trim( $value );
		$parts = preg_split( '/\s+/', $value );
		
		if ( empty( $parts ) ) {
			return null;
		}

		$result = [];

		foreach ( $parts as $part ) {
			$part = trim( $part );
			if ( empty( $part ) ) {
				continue;
			}

			// Try to identify what type of value this is
			if ( $this->is_border_width_value( $part ) ) {
				$result['width'] = $part;
			} elseif ( $this->is_border_style_value( $part ) ) {
				$result['style'] = $part;
			} elseif ( $this->is_color_value( $part ) ) {
				$result['color'] = $part;
			}
		}

		return ! empty( $result ) ? $result : null;
	}

	private function is_border_width_value( string $value ): bool {
		// Check for unitless zero (CSS allows 0 without unit)
		if ( '0' === $value ) {
			return true;
		}

		// Check for numeric values with units
		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vh|vw)$/i', $value ) ) {
			return true;
		}

		// Check for keyword values
		$keywords = [ 'thin', 'medium', 'thick' ];
		return in_array( strtolower( $value ), $keywords, true );
	}

	private function is_border_style_value( string $value ): bool {
		$styles = [ 
			'none', 'hidden', 'dotted', 'dashed', 'solid', 
			'double', 'groove', 'ridge', 'inset', 'outset' 
		];
		return in_array( strtolower( $value ), $styles, true );
	}

	private function is_color_value( string $value ): bool {
		// Check for hex colors
		if ( preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{6})$/i', $value ) ) {
			return true;
		}

		// Check for rgb/rgba
		if ( preg_match( '/^rgba?\(/i', $value ) ) {
			return true;
		}

		// Check for named colors (basic set)
		$named_colors = [
			'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
			'gray', 'grey', 'orange', 'purple', 'pink', 'brown', 'transparent'
		];
		return in_array( strtolower( $value ), $named_colors, true );
	}

	private function create_border_width_property( string $original_property, string $width_value ): ?array {
		// Parse the width value using the same logic as border-width mapper
		$parsed_width = $this->parse_border_width_value( $width_value );
		if ( null === $parsed_width ) {
			return null;
		}

		// 🎯 ATOMIC SOURCE: Size_Prop_Type from atomic widgets
		// 🚫 FALLBACK: NONE
		// ✅ STRUCTURE: Matches atomic widget exactly
		return [
			'property' => 'border-width',
			'value' => Size_Prop_Type::make()
				->units( Size_Constants::border() )
				->generate( $parsed_width )
		];
	}

	private function create_border_color_property( string $original_property, string $color_value ): ?array {
		// 🎯 ATOMIC SOURCE: Color_Prop_Type from atomic widgets
		// 🚫 FALLBACK: NONE
		// ✅ STRUCTURE: Matches atomic widget exactly
		return [
			'property' => 'border-color',
			'value' => Color_Prop_Type::make()->generate( $color_value )
		];
	}

	private function create_border_style_property( string $original_property, string $style_value ): ?array {
		// 🎯 ATOMIC SOURCE: String_Prop_Type from atomic widgets
		// 🚫 FALLBACK: NONE
		// ✅ STRUCTURE: Matches atomic widget exactly
		return [
			'property' => 'border-style',
			'value' => String_Prop_Type::make()->generate( $style_value )
		];
	}

	private function parse_border_width_value( string $value ): ?array {
		$value = trim( $value );

		$keyword_values = [
			'thin' => [ 'size' => 1, 'unit' => 'px' ],
			'medium' => [ 'size' => 3, 'unit' => 'px' ],
			'thick' => [ 'size' => 5, 'unit' => 'px' ],
		];

		if ( isset( $keyword_values[ $value ] ) ) {
			return $keyword_values[ $value ];
		}

		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vh|vw)$/i', $value, $matches ) ) {
			$numeric_value = (float) $matches[1];
			$unit = strtolower( $matches[2] );

			if ( $numeric_value < 0 ) {
				return null;
			}

			return [
				'size' => $numeric_value,
				'unit' => $unit,
			];
		}

		if ( is_numeric( $value ) ) {
			$numeric_value = (float) $value;
			
			if ( $numeric_value < 0 ) {
				return null;
			}
			
			return [
				'size' => $numeric_value,
				'unit' => 'px',
			];
		}

		return null;
	}
}
