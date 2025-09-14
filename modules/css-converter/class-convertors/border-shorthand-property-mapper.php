<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

class Border_Shorthand_Property_Mapper implements Class_Property_Mapper_Interface {
	const SUPPORTED_PROPERTIES = [ 'border' ];
	const SIZE_PATTERN = '/^(\d*\.?\d+)(px|em|rem|%|vh|vw)?$/';
	const HEX3_PATTERN = '/^#([A-Fa-f0-9]{3})$/';
	const HEX6_PATTERN = '/^#([A-Fa-f0-9]{6})$/';
	const RGB_PATTERN = '/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/';
	const RGBA_PATTERN = '/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/';
	
	const KEYWORD_WIDTH_VALUES = [ 'thin', 'medium', 'thick' ];
	const VALID_STYLES = [ 'none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset' ];
	const NAMED_COLORS = [
		'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
		'silver', 'gray', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy',
		'fuchsia', 'purple', 'orange', 'pink', 'brown', 'gold', 'violet', 'transparent'
	];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_border_shorthand( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$parsed = $this->parse_border_shorthand( $value );
		$result = [];
		
		// Use shorthand properties to match Elementor's native border controls
		if ( isset( $parsed['width'] ) ) {
			$result['border-width'] = [ '$$type' => 'size', 'value' => $parsed['width'] ];
		}
		
		if ( isset( $parsed['style'] ) ) {
			$result['border-style'] = [ '$$type' => 'string', 'value' => $parsed['style'] ];
		}
		
		if ( isset( $parsed['color'] ) ) {
			$result['border-color'] = [ '$$type' => 'color', 'value' => $parsed['color'] ];
		}
		
		return $result;
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function is_valid_border_shorthand( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}
		
		$value = trim( strtolower( $value ) );
		
		if ( $value === 'none' ) {
			return true;
		}
		
		// Basic validation - border shorthand should have at least one valid component
		$parts = preg_split( '/\s+/', $value );
		$has_valid_component = false;
		
		foreach ( $parts as $part ) {
			if ( $this->is_width_value( $part ) || $this->is_style_value( $part ) || $this->is_color_value( $part ) ) {
				$has_valid_component = true;
				break;
			}
		}
		
		return $has_valid_component;
	}

	private function parse_border_shorthand( string $value ): array {
		$value = trim( strtolower( $value ) );
		
		if ( $value === 'none' ) {
			return [ 'style' => 'none' ];
		}
		
		$parts = preg_split( '/\s+/', $value );
		$result = [];
		
		foreach ( $parts as $part ) {
			$part = trim( $part );
			
			// Check for width
			if ( ! isset( $result['width'] ) && $this->is_width_value( $part ) ) {
				$result['width'] = $this->parse_width_value( $part );
			}
			// Check for style
			elseif ( ! isset( $result['style'] ) && $this->is_style_value( $part ) ) {
				$result['style'] = $part;
			}
			// Check for color
			elseif ( ! isset( $result['color'] ) && $this->is_color_value( $part ) ) {
				$result['color'] = $this->normalize_color_value( $part );
			}
		}
		
		return $result;
	}

	private function is_width_value( string $value ): bool {
		return in_array( $value, self::KEYWORD_WIDTH_VALUES, true ) || 1 === preg_match( self::SIZE_PATTERN, $value );
	}

	private function is_style_value( string $value ): bool {
		return in_array( $value, self::VALID_STYLES, true );
	}

	private function is_color_value( string $value ): bool {
		return in_array( $value, self::NAMED_COLORS, true ) ||
			   1 === preg_match( self::HEX3_PATTERN, $value ) ||
			   1 === preg_match( self::HEX6_PATTERN, $value ) ||
			   1 === preg_match( self::RGB_PATTERN, $value ) ||
			   1 === preg_match( self::RGBA_PATTERN, $value );
	}

	private function parse_width_value( string $value ): array {
		// Handle keyword values
		if ( in_array( $value, self::KEYWORD_WIDTH_VALUES, true ) ) {
			$size_map = [ 'thin' => 1, 'medium' => 3, 'thick' => 5 ];
			return [ 'size' => $size_map[ $value ], 'unit' => 'px' ];
		}
		
		// Handle size values
		if ( 1 === preg_match( self::SIZE_PATTERN, $value, $matches ) ) {
			$number = (float) $matches[1];
			$unit = $matches[2] ?? 'px';
			if ( 0 === $number % 1 ) {
				$number = (int) $number;
			}
			return [ 'size' => $number, 'unit' => $unit ];
		}
		
		return [ 'size' => 1, 'unit' => 'px' ];
	}

	private function normalize_color_value( string $value ): string {
		// Handle 3-digit hex
		if ( 1 === preg_match( self::HEX3_PATTERN, $value, $matches ) ) {
			$hex = $matches[1];
			return '#' . $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
		}
		
		// Handle RGB validation
		if ( 1 === preg_match( self::RGB_PATTERN, $value, $matches ) ) {
			$r = max( 0, min( 255, (int) $matches[1] ) );
			$g = max( 0, min( 255, (int) $matches[2] ) );
			$b = max( 0, min( 255, (int) $matches[3] ) );
			return sprintf( '#%02x%02x%02x', $r, $g, $b );
		}
		
		return $value;
	}
}
