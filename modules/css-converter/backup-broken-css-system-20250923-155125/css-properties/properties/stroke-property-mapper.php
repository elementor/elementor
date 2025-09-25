<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Stroke_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [
		'stroke',
		'stroke-width',
	];
	const SIZE_PATTERN = '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw)?$/';
	const HEX3_PATTERN = '/^#([A-Fa-f0-9]{3})$/';
	const HEX6_PATTERN = '/^#([A-Fa-f0-9]{6})$/';
	const RGB_PATTERN = '/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/';
	const RGBA_PATTERN = '/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/';
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
		'none',
	];
	const LINECAP_VALUES = [ 'butt', 'round', 'square' ];
	const LINEJOIN_VALUES = [ 'miter', 'round', 'bevel' ];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_schema( string $property, $value ): array {
		// If this is a shorthand or color value for 'stroke', parse as object
		if ( 'stroke' === $property ) {
			$parsed = $this->parse_stroke_shorthand( $value );
			return [
				'stroke' => [
					'$$type' => 'stroke',
					'value' => $parsed,
				],
			];
		}

		// For individual properties, return as part of the stroke object
		$key = $this->map_property_to_key( $property );
		$parsed = $this->parse_stroke_value( $key, $value );
		return [
			'stroke' => [
				'$$type' => 'stroke',
				'value' => [ $key => $parsed ],
			],
		];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		// Basic implementation - convert property name to v4 format
		// Keep original property name with hyphens for consistency
		return $this->create_v4_property( $property, $value );
	}

	private function map_property_to_key( string $property ): string {
		$map = [
			'stroke' => 'color',
			'stroke-width' => 'width',
		];
		return $map[ $property ] ?? $property;
	}

	private function parse_stroke_shorthand( string $value ): array {
		// Accepts: color width (any order)
		$parts = preg_split( '/\s+/', trim( $value ) );
		$result = [];
		foreach ( $parts as $part ) {
			if ( $this->is_color( $part ) ) {
				$result['color'] = [
					'$$type' => 'color',
					'value' => $this->normalize_color( $part ),
				];
			} elseif ( $this->is_width( $part ) ) {
				$width = $this->parse_width( $part );
				$result['width'] = [
					'$$type' => 'size',
					'value' => $width,
				];
			}
		}
		return $result;
	}

	private function parse_stroke_value( string $key, string $value ) {
		if ( 'color' === $key ) {
			return [
				'$$type' => 'color',
				'value' => $this->normalize_color( $value ),
			];
		}
		if ( 'width' === $key ) {
			$width = $this->parse_width( $value );
			return [
				'$$type' => 'size',
				'value' => $width,
			];
		}
		return $value;
	}

	private function is_color( string $value ): bool {
		return in_array( $value, self::NAMED_COLORS, true ) ||
				1 === preg_match( self::HEX3_PATTERN, $value ) ||
				1 === preg_match( self::HEX6_PATTERN, $value ) ||
				1 === preg_match( self::RGB_PATTERN, $value ) ||
				1 === preg_match( self::RGBA_PATTERN, $value );
	}

	private function normalize_color( string $value ): string {
		$value = trim( strtolower( $value ) );
		if ( 1 === preg_match( self::HEX3_PATTERN, $value, $matches ) ) {
			$hex = $matches[1];
			return '#' . $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
		}
		if ( 1 === preg_match( self::RGB_PATTERN, $value, $matches ) ) {
			$r = max( 0, min( 255, (int) $matches[1] ) );
			$g = max( 0, min( 255, (int) $matches[2] ) );
			$b = max( 0, min( 255, (int) $matches[3] ) );
			return sprintf( '#%02x%02x%02x', $r, $g, $b );
		}
		return $value;
	}

	private function is_width( string $value ): bool {
		return 1 === preg_match( self::SIZE_PATTERN, $value );
	}

	private function parse_width( string $value ): array {
		if ( 1 === preg_match( self::SIZE_PATTERN, $value, $matches ) ) {
			$number = (float) $matches[1];
			$unit = $matches[2] ?? 'px';
			if ( 0 === $number % 1 ) {
				$number = (int) $number;
			}
			return [
				'size' => $number,
				'unit' => $unit,
			];
		}
		return [
			'size' => 1,
			'unit' => 'px',
		];
	}

	private function is_dasharray( string $value ): bool {
		return preg_match( '/^([\d\s,]+)$/', $value );
	}
}
