<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Box Shadow Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: Multiple atomic widgets use Box_Shadow_Prop_Type for box-shadow
 * Prop Type: /atomic-widgets/prop-types/box-shadow-prop-type.php
 * Expected: {"$$type": "box-shadow", "value": [{"$$type": "shadow", "value": {...}}]}
 * 
 * REQUIREMENTS:
 * - Array of Shadow_Prop_Type objects
 * - Each shadow has hOffset, vOffset, blur, spread, color, position
 * - All offset/blur/spread are Size_Prop_Type
 * - Color is Color_Prop_Type
 * - Position is null or "inset"
 */
class Box_Shadow_Property_Mapper extends Modern_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = ['box-shadow'];
	private const ATOMIC_WIDGET = 'e-container';
	private const PROP_TYPE = 'Box_Shadow_Prop_Type';

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_shadows = $this->parse_box_shadow_value( $value );
		if ( null === $parsed_shadows ) {
			return null;
		}

		$atomic_value = $this->create_atomic_property_with_type( 
			$property, 
			'box-shadow', 
			$parsed_shadows 
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

	private function parse_box_shadow_value( $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		if ( empty( $value ) || 'none' === $value ) {
			return [];
		}

		// Split multiple shadows by comma (but not commas inside rgba/hsla)
		$shadows = $this->split_shadow_values( $value );
		$parsed_shadows = [];

		foreach ( $shadows as $shadow ) {
			$parsed_shadow = $this->parse_single_shadow( trim( $shadow ) );
			if ( null !== $parsed_shadow ) {
				$parsed_shadows[] = $parsed_shadow;
			}
		}

		return empty( $parsed_shadows ) ? null : $parsed_shadows;
	}

	private function split_shadow_values( string $value ): array {
		$shadows = [];
		$current_shadow = '';
		$paren_depth = 0;
		$length = strlen( $value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $value[ $i ];

			if ( '(' === $char ) {
				$paren_depth++;
			} elseif ( ')' === $char ) {
				$paren_depth--;
			} elseif ( ',' === $char && 0 === $paren_depth ) {
				$shadows[] = $current_shadow;
				$current_shadow = '';
				continue;
			}

			$current_shadow .= $char;
		}

		if ( ! empty( $current_shadow ) ) {
			$shadows[] = $current_shadow;
		}

		return $shadows;
	}

	private function parse_single_shadow( string $shadow ): ?array {
		if ( empty( $shadow ) ) {
			return null;
		}

		// Check for inset
		$position = null;
		if ( str_starts_with( $shadow, 'inset ' ) ) {
			$position = 'inset';
			$shadow = substr( $shadow, 6 ); // Remove 'inset '
		}

		// Parse shadow components
		$components = $this->extract_shadow_components( $shadow );
		if ( null === $components ) {
			return null;
		}

		return [
			'$$type' => 'shadow',
			'value' => [
				'hOffset' => ['$$type' => 'size', 'value' => $components['h_offset']],
				'vOffset' => ['$$type' => 'size', 'value' => $components['v_offset']],
				'blur' => ['$$type' => 'size', 'value' => $components['blur']],
				'spread' => ['$$type' => 'size', 'value' => $components['spread']],
				'color' => ['$$type' => 'color', 'value' => $components['color']],
				'position' => $position,
			],
		];
	}

	private function extract_shadow_components( string $shadow ): ?array {
		// Default values
		$components = [
			'h_offset' => ['size' => 0, 'unit' => 'px'],
			'v_offset' => ['size' => 0, 'unit' => 'px'],
			'blur' => ['size' => 0, 'unit' => 'px'],
			'spread' => ['size' => 0, 'unit' => 'px'],
			'color' => '#000000',
		];

		// Extract color first (can be at beginning or end)
		$color_match = null;
		$remaining_shadow = $shadow;

		// Try to match color patterns
		$color_patterns = [
			'/rgba?\([^)]+\)/',
			'/hsla?\([^)]+\)/',
			'/#[a-f0-9]{3,6}/i',
			'/\b(?:red|green|blue|black|white|gray|grey|transparent|currentColor)\b/i',
		];

		foreach ( $color_patterns as $pattern ) {
			if ( preg_match( $pattern, $shadow, $matches ) ) {
				$color_match = $matches[0];
				$remaining_shadow = str_replace( $color_match, '', $shadow );
				break;
			}
		}

		if ( $color_match ) {
			$parsed_color = $this->parse_color_value( $color_match );
			if ( $parsed_color ) {
				$components['color'] = $parsed_color;
			}
		}

		// Extract size values from remaining shadow
		$remaining_shadow = trim( $remaining_shadow );
		if ( empty( $remaining_shadow ) ) {
			return $components;
		}

		// Split by whitespace to get size values
		$size_values = preg_split( '/\s+/', $remaining_shadow );
		$size_values = array_filter( $size_values, function( $val ) {
			return ! empty( trim( $val ) );
		} );

		$size_count = count( $size_values );
		
		if ( $size_count >= 2 ) {
			// h-offset and v-offset are required
			$h_offset = $this->parse_size_value( $size_values[0] );
			$v_offset = $this->parse_size_value( $size_values[1] );
			
			if ( $h_offset && $v_offset ) {
				$components['h_offset'] = $h_offset;
				$components['v_offset'] = $v_offset;
			} else {
				return null; // Invalid required values
			}
		} else {
			return null; // Need at least h-offset and v-offset
		}

		if ( $size_count >= 3 ) {
			// blur-radius
			$blur = $this->parse_size_value( $size_values[2] );
			if ( $blur ) {
				$components['blur'] = $blur;
			}
		}

		if ( $size_count >= 4 ) {
			// spread-radius
			$spread = $this->parse_size_value( $size_values[3] );
			if ( $spread ) {
				$components['spread'] = $spread;
			}
		}

		return $components;
	}
}
