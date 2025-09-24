<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Enhanced_Property_Mapper {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		// Get the atomic result
		$atomic_result = $this->get_atomic_result( $property, $value );
		if ( ! $atomic_result ) {
			return null;
		}

		// For v4 atomic format, we need to return ['property' => 'name', 'value' => atomic_result]
		// But we need to map the property name to the schema property name
		$schema_property = $this->get_schema_property_name( $property );
		
		$result = [
			'property' => $schema_property,
			'value' => $atomic_result
		];
		
		// Debug logging
		error_log( "Enhanced_Property_Mapper: map_to_v4_atomic({$property}) -> " . wp_json_encode( $result ) );
		
		return $result;
	}

	private function get_atomic_result( string $property, $value ): ?array {
		// Enhanced conversion based on Elementor's Style_Schema expectations
		switch ( $property ) {
			case 'color':
				return $this->create_color_property( $value );
			
			case 'background-color':
				// Elementor expects 'background' prop type, not 'background-color'
				return $this->create_background_property( $value );
			
			case 'font-size':
			case 'width':
			case 'height':
			case 'border-radius':
			case 'line-height':
				// line-height is Size_Prop_Type in Elementor schema
				return $this->create_size_property( $value );
			
			case 'padding':
			case 'margin':
				return $this->create_shorthand_size_property( $property, $value );
			
			case 'font-weight':
				// font-weight is String_Prop_Type in Elementor schema
				return $this->create_font_weight_property( $value );
			
			case 'opacity':
			case 'z-index':
				return $this->create_number_property( $value );
			
			case 'display':
			case 'position':
			case 'flex-direction':
			case 'align-items':
			case 'justify-content':
			case 'text-align':
				return $this->create_string_property( $value );
			
			default:
				return $this->create_string_property( $value );
		}
	}

	private function create_color_property( $value ): array {
		return [
			'$$type' => 'color',
			'value' => $this->normalize_color_value( $value )
		];
	}

	private function create_size_property( $value ): array {
		$parsed = $this->parse_size_value( $value );
		return [
			'$$type' => 'size',
			'value' => [
				'size' => $parsed['size'],
				'unit' => $parsed['unit']
			]
		];
	}

	private function create_number_property( $value ): array {
		return [
			'$$type' => 'number',
			'value' => $this->parse_numeric_value( $value )
		];
	}

	private function create_string_property( $value ): array {
		return [
			'$$type' => 'string',
			'value' => (string) $value
		];
	}

	private function create_shorthand_size_property( string $property, $value ): array {
		// Handle shorthand properties like margin: 10px 0 or padding: 10px 20px 15px 25px
		$value = trim( $value );
		$parts = preg_split( '/\s+/', $value );
		
		if ( count( $parts ) === 1 ) {
			// Single value: margin: 10px
			return $this->create_size_property( $value );
		}
		
		// For shorthand, we'll use the first value as the primary size
		// This is a simplified approach - in a full implementation, you might want to use dimensions type
		$first_value = $parts[0];
		return $this->create_size_property( $first_value );
	}

	private function create_background_property( $value ): array {
		// Elementor expects 'background' prop type with direct color value
		// The Background_Transformer expects $value['color'] to be a direct color value
		return [
			'$$type' => 'background',
			'value' => [
				'color' => $this->normalize_color_value( $value )  // Direct color value, not nested
			]
		];
	}

	private function create_font_weight_property( $value ): array {
		// Elementor expects font-weight as string, not number
		$weight_mappings = [
			'normal' => '400',
			'bold' => '700',
			'bolder' => '900',
			'lighter' => '300'
		];
		
		$string_value = $weight_mappings[ strtolower( trim( $value ) ) ] ?? (string) $value;
		
		return [
			'$$type' => 'string',
			'value' => $string_value
		];
	}

	private function normalize_color_value( $value ): string {
		$value = trim( $value );
		
		// Handle hex colors
		if ( preg_match( '/^#[0-9a-fA-F]{3,6}$/', $value ) ) {
			return strtolower( $value );
		}
		
		// Handle rgb/rgba colors
		if ( preg_match( '/^rgba?\(/', $value ) ) {
			return $value;
		}
		
		// Handle named colors
		$named_colors = [
			'red' => '#ff0000',
			'blue' => '#0000ff',
			'green' => '#008000',
			'black' => '#000000',
			'white' => '#ffffff',
			'transparent' => 'transparent'
		];
		
		return $named_colors[ strtolower( $value ) ] ?? $value;
	}

	private function parse_size_value( $value ): array {
		$value = trim( $value );
		
		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = $matches[2] ?? '';
			
			// For unitless values (like line-height: 1.6), don't add px
			if ( empty( $unit ) && is_numeric( $value ) && (float) $value > 0 && (float) $value < 10 ) {
				// Likely a unitless line-height or similar
				$unit = '';
			} else if ( empty( $unit ) ) {
				// Default to px for other unitless values
				$unit = 'px';
			}
			
			return [
				'size' => $size,
				'unit' => strtolower( $unit )
			];
		}
		
		// Handle special values
		if ( in_array( strtolower( $value ), [ 'auto', 'inherit', 'initial', 'unset' ], true ) ) {
			return [
				'size' => 0.0,
				'unit' => 'px'
			];
		}
		
		return [
			'size' => 0.0,
			'unit' => 'px'
		];
	}

	private function parse_numeric_value( $value ) {
		$value = trim( $value );
		
		// Handle numeric values with precision fix
		if ( is_numeric( $value ) ) {
			$numeric = (float) $value;
			// Fix floating point precision issues
			return round( $numeric, 10 );
		}
		
		// Extract numeric part from values like "bold" -> 700
		$numeric_mappings = [
			'normal' => 400,
			'bold' => 700,
			'bolder' => 900,
			'lighter' => 300
		];
		
		$mapped_value = $numeric_mappings[ strtolower( $value ) ] ?? (float) $value;
		return round( $mapped_value, 10 );
	}

	public function map_to_schema( string $property, $value ): ?array {
		// Get the atomic result directly (not the v4 format)
		$atomic_result = $this->get_atomic_result( $property, $value );
		
		if ( ! $atomic_result ) {
			return null;
		}
		
		// Map CSS property names to Elementor schema property names
		$schema_property = $this->get_schema_property_name( $property );
		
		// Return in schema format expected by global class conversion
		return [ $schema_property => $atomic_result ];
	}

	private function get_schema_property_name( string $css_property ): string {
		// Map CSS property names to Elementor schema property names
		$property_mappings = [
			'background-color' => 'background',  // CSS background-color -> Elementor background
		];
		
		return $property_mappings[ $css_property ] ?? $css_property;
	}

	public function supports( string $property, $value = null ): bool {
		return $this->property === $property;
	}

	public function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function get_property(): string {
		return $this->property;
	}
}
