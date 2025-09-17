<?php
namespace Elementor\Modules\CssConverter\ClassConvertors;

require_once __DIR__ . '/unified-property-mapper-base.php';

class Border_Color_Property_Mapper extends Unified_Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [
		'border-color',
		'border-top-color',
		'border-right-color',
		'border-bottom-color',
		'border-left-color',
	];
	const HEX3_PATTERN = '/^#([A-Fa-f0-9]{3})$/';
	const HEX6_PATTERN = '/^#([A-Fa-f0-9]{6})$/';
	const HEXA_PATTERN = '/^#([A-Fa-f0-9]{8})$/';
	const RGB_PATTERN = '/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/';
	const RGBA_PATTERN = '/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/';
	const HSL_PATTERN = '/^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/';

	const NAMED_COLORS = [
		'black',
		'white',
		'red',
		'green',
		'blue',
		'yellow',
		'cyan',
		'magenta',
		'silver',
		'gray',
		'maroon',
		'olive',
		'lime',
		'aqua',
		'teal',
		'navy',
		'fuchsia',
		'purple',
		'orange',
		'pink',
		'brown',
		'gold',
		'violet',
		'transparent',
	];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_border_color( $property, $value );
	}

	public function map_to_schema( string $property, $value ): array {
		if ( $property === 'border-color' ) {
			$parsed = $this->parse_border_color_shorthand( $value );
			return [
				'border-top-color' => [
					'$$type' => 'color',
					'value' => $parsed['top'],
				],
				'border-right-color' => [
					'$$type' => 'color',
					'value' => $parsed['right'],
				],
				'border-bottom-color' => [
					'$$type' => 'color',
					'value' => $parsed['bottom'],
				],
				'border-left-color' => [
					'$$type' => 'color',
					'value' => $parsed['left'],
				],
			];
		}
		$normalized = $this->normalize_color_value( $value );
		return [
			$property => [
				'$$type' => 'color',
				'value' => $normalized,
			],
		];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function is_valid_border_color( string $property, $value ): bool {
		if ( $property === 'border-color' ) {
			$parts = preg_split( '/\s+/', trim( $value ) );
			if ( count( $parts ) > 4 ) {
				return false;
			}
			foreach ( $parts as $part ) {
				if ( ! $this->is_valid_color( $part ) ) {
					return false;
				}
			}
			return true;
		}
		return $this->is_valid_color( $value );
	}

	private function is_valid_color( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( strtolower( $value ) );

		return in_array( $value, self::NAMED_COLORS, true ) ||
				1 === preg_match( self::HEX3_PATTERN, $value ) ||
				1 === preg_match( self::HEX6_PATTERN, $value ) ||
				1 === preg_match( self::HEXA_PATTERN, $value ) ||
				1 === preg_match( self::RGB_PATTERN, $value ) ||
				1 === preg_match( self::RGBA_PATTERN, $value ) ||
				1 === preg_match( self::HSL_PATTERN, $value );
	}

	private function parse_border_color_shorthand( string $value ): array {
		$parts = preg_split( '/\s+/', trim( $value ) );
		$count = count( $parts );
		$top = $right = $bottom = $left = 'black';

		if ( $count === 1 ) {
			$top = $right = $bottom = $left = $parts[0];
		} elseif ( $count === 2 ) {
			$top = $bottom = $parts[0];
			$right = $left = $parts[1];
		} elseif ( $count === 3 ) {
			$top = $parts[0];
			$right = $left = $parts[1];
			$bottom = $parts[2];
		} elseif ( $count === 4 ) {
			$top = $parts[0];
			$right = $parts[1];
			$bottom = $parts[2];
			$left = $parts[3];
		}

		return [
			'top' => $this->normalize_color_value( $top ),
			'right' => $this->normalize_color_value( $right ),
			'bottom' => $this->normalize_color_value( $bottom ),
			'left' => $this->normalize_color_value( $left ),
		];
	}

	private function normalize_color_value( string $value ): string {
		$value = trim( strtolower( $value ) );

		// Handle 3-digit hex
		if ( 1 === preg_match( self::HEX3_PATTERN, $value, $matches ) ) {
			$hex = $matches[1];
			return '#' . $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
		}

		// Handle RGB/RGBA validation
		if ( 1 === preg_match( self::RGB_PATTERN, $value, $matches ) ) {
			$r = max( 0, min( 255, (int) $matches[1] ) );
			$g = max( 0, min( 255, (int) $matches[2] ) );
			$b = max( 0, min( 255, (int) $matches[3] ) );
			return sprintf( '#%02x%02x%02x', $r, $g, $b );
		}

		if ( 1 === preg_match( self::RGBA_PATTERN, $value, $matches ) ) {
			$r = max( 0, min( 255, (int) $matches[1] ) );
			$g = max( 0, min( 255, (int) $matches[2] ) );
			$b = max( 0, min( 255, (int) $matches[3] ) );
			return sprintf( '#%02x%02x%02x', $r, $g, $b );
		}

		// Return as-is for hex6, hexa, hsl, and named colors
		return $value;
	}
}
