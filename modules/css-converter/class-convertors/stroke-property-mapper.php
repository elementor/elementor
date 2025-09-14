<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

class Stroke_Property_Mapper implements Class_Property_Mapper_Interface {
	const SUPPORTED_PROPERTIES = [ 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin' ];
	const SIZE_PATTERN = '/^(\d*\.?\d+)(px|em|rem|%|vh|vw)?$/';
	const HEX3_PATTERN = '/^#([A-Fa-f0-9]{3})$/';
	const HEX6_PATTERN = '/^#([A-Fa-f0-9]{6})$/';
	const RGB_PATTERN = '/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/';
	const RGBA_PATTERN = '/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/';
	
	const NAMED_COLORS = [
		'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
		'silver', 'gray', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy',
		'fuchsia', 'purple', 'orange', 'pink', 'brown', 'gold', 'violet', 'transparent', 'none'
	];
	
	const LINECAP_VALUES = [ 'butt', 'round', 'square' ];
	const LINEJOIN_VALUES = [ 'miter', 'round', 'bevel' ];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_stroke_property( $property, $value );
	}

	public function map_to_schema( string $property, $value ): array {
		if ( $property === 'stroke' ) {
			$normalized = $this->normalize_stroke_color( $value );
			return [ $property => [ '$$type' => 'color', 'value' => $normalized ] ];
		}
		
		if ( $property === 'stroke-width' ) {
			$size = $this->parse_stroke_width( $value );
			return [ $property => [ '$$type' => 'size', 'value' => $size ] ];
		}
		
		// stroke-dasharray, stroke-linecap, stroke-linejoin
		$normalized = $this->normalize_stroke_value( $property, $value );
		return [ $property => [ '$$type' => 'string', 'value' => $normalized ] ];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function is_valid_stroke_property( string $property, $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}
		
		$value = trim( strtolower( $value ) );
		
		if ( $property === 'stroke' ) {
			return $this->is_color( $value );
		}
		
		if ( $property === 'stroke-width' ) {
			return 1 === preg_match( self::SIZE_PATTERN, $value );
		}
		
		if ( $property === 'stroke-linecap' ) {
			return in_array( $value, self::LINECAP_VALUES, true );
		}
		
		if ( $property === 'stroke-linejoin' ) {
			return in_array( $value, self::LINEJOIN_VALUES, true );
		}
		
		if ( $property === 'stroke-dasharray' ) {
			return $value === 'none' || preg_match( '/^[\d\s,]+$/', $value );
		}
		
		return false;
	}

	private function is_color( string $value ): bool {
		return in_array( $value, self::NAMED_COLORS, true ) ||
			   1 === preg_match( self::HEX3_PATTERN, $value ) ||
			   1 === preg_match( self::HEX6_PATTERN, $value ) ||
			   1 === preg_match( self::RGB_PATTERN, $value ) ||
			   1 === preg_match( self::RGBA_PATTERN, $value );
	}

	private function normalize_stroke_color( string $value ): string {
		$value = trim( strtolower( $value ) );
		
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

	private function parse_stroke_width( string $value ): array {
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

	private function normalize_stroke_value( string $property, string $value ): string {
		$value = trim( strtolower( $value ) );
		
		if ( $property === 'stroke-linecap' ) {
			return in_array( $value, self::LINECAP_VALUES, true ) ? $value : 'butt';
		}
		
		if ( $property === 'stroke-linejoin' ) {
			return in_array( $value, self::LINEJOIN_VALUES, true ) ? $value : 'miter';
		}
		
		return $value;
	}
}
