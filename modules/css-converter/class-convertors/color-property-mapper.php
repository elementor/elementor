<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Property_Mapper implements Class_Property_Mapper_Interface {
	private const HEX3_PATTERN = '/^#([A-Fa-f0-9]{3})$/';
	private const HEX6_PATTERN = '/^#([A-Fa-f0-9]{6})$/';
	private const HEXA_PATTERN = '/^#([A-Fa-f0-9]{8})$/';
	private const RGB_PATTERN = '/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/';
	private const RGBA_PATTERN = '/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/';
	private const HSL_PATTERN = '/^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/';
	
	private const NAMED_COLORS = [
		'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
		'silver', 'gray', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy',
		'fuchsia', 'purple', 'orange', 'pink', 'brown', 'gold', 'violet'
	];

	public function supports( string $property, $value ): bool {
		return 'color' === $property && $this->is_valid_color( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		return [ 'color' => $this->normalize_color_value( $value ) ];
	}

	public function get_supported_properties(): array {
		return [ 'color' ];
	}

	private function is_valid_color( string $value ): bool {
		$value = trim( $value );
		
		return $this->is_hex_color( $value ) ||
			   $this->is_rgb_color( $value ) ||
			   $this->is_rgba_color( $value ) ||
			   $this->is_hsl_color( $value ) ||
			   $this->is_named_color( $value );
	}

	private function is_hex_color( string $value ): bool {
		return 1 === preg_match( self::HEX3_PATTERN, $value ) ||
			   1 === preg_match( self::HEX6_PATTERN, $value ) ||
			   1 === preg_match( self::HEXA_PATTERN, $value );
	}

	private function is_rgb_color( string $value ): bool {
		if ( 1 !== preg_match( self::RGB_PATTERN, $value, $matches ) ) {
			return false;
		}
		
		// Validate RGB values are within 0-255 range
		$r = (int) $matches[1];
		$g = (int) $matches[2];
		$b = (int) $matches[3];
		
		return $r >= 0 && $r <= 255 && $g >= 0 && $g <= 255 && $b >= 0 && $b <= 255;
	}

	private function is_rgba_color( string $value ): bool {
		if ( 1 !== preg_match( self::RGBA_PATTERN, $value, $matches ) ) {
			return false;
		}
		
		// Validate RGBA values are within valid ranges
		$r = (int) $matches[1];
		$g = (int) $matches[2];
		$b = (int) $matches[3];
		$a = (float) $matches[4];
		
		return $r >= 0 && $r <= 255 && 
			   $g >= 0 && $g <= 255 && 
			   $b >= 0 && $b <= 255 && 
			   $a >= 0 && $a <= 1;
	}

	private function is_hsl_color( string $value ): bool {
		return 1 === preg_match( self::HSL_PATTERN, $value );
	}

	private function is_named_color( string $value ): bool {
		return in_array( strtolower( $value ), self::NAMED_COLORS, true );
	}

	private function normalize_color_value( string $value ): string {
		$value = trim( $value );

		if ( $this->is_hex_color( $value ) ) {
			return $this->normalize_hex( $value );
		}

		if ( $this->is_rgb_color( $value ) ) {
			return $this->rgb_to_hex( $value );
		}

		if ( $this->is_rgba_color( $value ) ) {
			return $this->rgba_to_hex( $value );
		}

		return strtolower( $value );
	}

	private function normalize_hex( string $hex ): string {
		$lower = strtolower( $hex );

		if ( 1 === preg_match( self::HEXA_PATTERN, $lower ) ) {
			return $lower;
		}

		if ( 1 === preg_match( self::HEX6_PATTERN, $lower ) ) {
			return $lower;
		}

		$digits = substr( $lower, 1 );
		return '#' . $digits[0] . $digits[0] . $digits[1] . $digits[1] . $digits[2] . $digits[2];
	}

	private function rgb_to_hex( string $rgb ): string {
		if ( 1 === preg_match( self::RGB_PATTERN, $rgb, $matches ) ) {
			$r = (int) $matches[1];
			$g = (int) $matches[2];
			$b = (int) $matches[3];
			
			return sprintf( '#%02x%02x%02x', $r, $g, $b );
		}
		
		return $rgb;
	}

	private function rgba_to_hex( string $rgba ): string {
		if ( 1 === preg_match( self::RGBA_PATTERN, $rgba, $matches ) ) {
			$r = (int) $matches[1];
			$g = (int) $matches[2];
			$b = (int) $matches[3];
			$a = (float) $matches[4];
			
			if ( 1.0 === $a ) {
				return sprintf( '#%02x%02x%02x', $r, $g, $b );
			}
			
			$alpha = (int) round( $a * 255 );
			return sprintf( '#%02x%02x%02x%02x', $r, $g, $b, $alpha );
		}
		
		return $rgba;
	}
}
