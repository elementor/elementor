<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

class Background_Property_Mapper implements Class_Property_Mapper_Interface {
	const SUPPORTED_PROPERTIES = [ 'background' ];
	const URL_PATTERN = '/url\(\s*["\']?([^"\']+)["\']?\s*\)/';
	const HEX3_PATTERN = '/^#([A-Fa-f0-9]{3})$/';
	const HEX6_PATTERN = '/^#([A-Fa-f0-9]{6})$/';
	const RGB_PATTERN = '/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/';
	const RGBA_PATTERN = '/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/';
	
	const NAMED_COLORS = [
		'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
		'silver', 'gray', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy',
		'fuchsia', 'purple', 'orange', 'pink', 'brown', 'gold', 'violet', 'transparent'
	];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_background( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$parsed = $this->parse_background_shorthand( $value );
		$result = [];
		
		if ( isset( $parsed['color'] ) ) {
			$result['background-color'] = [ '$$type' => 'color', 'value' => $parsed['color'] ];
		}
		
		if ( isset( $parsed['image'] ) ) {
			$result['background-image'] = [ '$$type' => 'string', 'value' => $parsed['image'] ];
		}
		
		// For now, we'll store the full background value as a string if it's complex
		if ( empty( $result ) ) {
			$result['background'] = [ '$$type' => 'string', 'value' => trim( $value ) ];
		}
		
		return $result;
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function is_valid_background( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}
		
		$value = trim( strtolower( $value ) );
		
		if ( $value === 'none' || $value === 'transparent' ) {
			return true;
		}
		
		// Basic validation - background shorthand is complex
		return strlen( $value ) > 0;
	}

	private function parse_background_shorthand( string $value ): array {
		$value = trim( $value );
		$result = [];
		
		// Extract URL/gradient (background-image)
		if ( 1 === preg_match( self::URL_PATTERN, $value, $matches ) ) {
			$result['image'] = "url('{$matches[1]}')";
			$value = preg_replace( self::URL_PATTERN, '', $value );
		} elseif ( false !== strpos( $value, 'gradient(' ) ) {
			// Simple gradient detection
			if ( preg_match( '/[a-z-]*gradient\([^)]+\)/', $value, $matches ) ) {
				$result['image'] = $matches[0];
				$value = str_replace( $matches[0], '', $value );
			}
		}
		
		// Extract color
		$value = trim( $value );
		$parts = preg_split( '/\s+/', $value );
		
		foreach ( $parts as $part ) {
			$part = trim( $part );
			if ( $this->is_color( $part ) ) {
				$result['color'] = $this->normalize_color( $part );
				break;
			}
		}
		
		return $result;
	}

	private function is_color( string $value ): bool {
		$value = trim( strtolower( $value ) );
		
		return in_array( $value, self::NAMED_COLORS, true ) ||
			   1 === preg_match( self::HEX3_PATTERN, $value ) ||
			   1 === preg_match( self::HEX6_PATTERN, $value ) ||
			   1 === preg_match( self::RGB_PATTERN, $value ) ||
			   1 === preg_match( self::RGBA_PATTERN, $value );
	}

	private function normalize_color( string $value ): string {
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
}
