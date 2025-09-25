<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
class Border_Shorthand_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'border' ];

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		// Parse the border shorthand and create a proper border structure
		$parsed = $this->parse_border_shorthand( $value );
		
		// Create a comprehensive border object
		$border_value = [];
		
		if ( isset( $parsed['width'] ) ) {
			$border_value['width'] = [
				'$$type' => 'size',
				'value' => $parsed['width'],
			];
		}
		
		if ( isset( $parsed['style'] ) ) {
			$border_value['style'] = [
				'$$type' => 'string',
				'value' => $parsed['style'],
			];
		}
		
		if ( isset( $parsed['color'] ) ) {
			$border_value['color'] = [
				'$$type' => 'color',
				'value' => $parsed['color'],
			];
		}

		// If we have a complete border, return as border type, otherwise fallback to string
		if ( ! empty( $border_value ) ) {
			return $this->create_v4_property_with_type( 'border', 'border', $border_value );
		}
		
		// Fallback to string representation
		return $this->create_v4_property_with_type( 'border', 'string', trim( $value ) );
	}

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_border_value( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$parsed = $this->parse_border_shorthand( $value );
		$result = [];

		if ( isset( $parsed['width'] ) ) {
			$result['border-top-width'] = [
				'$$type' => 'size',
				'value' => $parsed['width'],
			];
			$result['border-right-width'] = [
				'$$type' => 'size',
				'value' => $parsed['width'],
			];
			$result['border-bottom-width'] = [
				'$$type' => 'size',
				'value' => $parsed['width'],
			];
			$result['border-left-width'] = [
				'$$type' => 'size',
				'value' => $parsed['width'],
			];
		}

		if ( isset( $parsed['style'] ) ) {
			$result['border-top-style'] = [
				'$$type' => 'string',
				'value' => $parsed['style'],
			];
			$result['border-right-style'] = [
				'$$type' => 'string',
				'value' => $parsed['style'],
			];
			$result['border-bottom-style'] = [
				'$$type' => 'string',
				'value' => $parsed['style'],
			];
			$result['border-left-style'] = [
				'$$type' => 'string',
				'value' => $parsed['style'],
			];
		}

		if ( isset( $parsed['color'] ) ) {
			$result['border-top-color'] = [
				'$$type' => 'color',
				'value' => $parsed['color'],
			];
			$result['border-right-color'] = [
				'$$type' => 'color',
				'value' => $parsed['color'],
			];
			$result['border-bottom-color'] = [
				'$$type' => 'color',
				'value' => $parsed['color'],
			];
			$result['border-left-color'] = [
				'$$type' => 'color',
				'value' => $parsed['color'],
			];
		}

		return $result;
	}

	private function is_valid_border_value( string $value ): bool {
		$value = trim( $value );
		if ( empty( $value ) || 'none' === $value || '0' === $value ) {
			return false;
		}

		return true;
	}

	private function parse_border_shorthand( string $value ): array {
		$value = trim( $value );
		$parts = preg_split( '/\s+/', $value );
		$result = [];

		foreach ( $parts as $part ) {
			if ( $this->is_width( $part ) ) {
				$result['width'] = $this->parse_width( $part );
			} elseif ( $this->is_style( $part ) ) {
				$result['style'] = $part;
			} elseif ( $this->is_color( $part ) ) {
				$result['color'] = $this->normalize_color( $part );
			}
		}

		return $result;
	}

	private function is_width( string $value ): bool {
		return preg_match( '/^(\d*\.?\d+)(px|em|rem|%|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax)?$/', $value ) ||
				in_array( $value, [ 'thin', 'medium', 'thick' ], true );
	}

	private function is_style( string $value ): bool {
		return in_array( $value, [
			'none',
			'hidden',
			'dotted',
			'dashed',
			'solid',
			'double',
			'groove',
			'ridge',
			'inset',
			'outset',
		], true );
	}

	private function is_color( string $value ): bool {
		return preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{6})$/i', $value ) ||
				preg_match( '/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i', $value ) ||
				preg_match( '/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i', $value ) ||
				in_array( strtolower( $value ), [
					'black',
					'silver',
					'gray',
					'white',
					'maroon',
					'red',
					'purple',
					'fuchsia',
					'green',
					'lime',
					'olive',
					'yellow',
					'navy',
					'blue',
					'teal',
					'aqua',
				], true );
	}

	private function parse_width( string $value ): array {
		if ( in_array( $value, [ 'thin', 'medium', 'thick' ], true ) ) {
			$size_map = [
				'thin' => 1,
				'medium' => 3,
				'thick' => 5,
			];
			return [
				'size' => $size_map[ $value ],
				'unit' => 'px',
			];
		}

		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|pt|pc|in|cm|mm|ex|ch|vw|vh|vmin|vmax)?$/', $value, $matches ) ) {
			return [
				'size' => (float) $matches[1],
				'unit' => $matches[2] ?? 'px',
			];
		}

		return [
			'size' => 1,
			'unit' => 'px',
		];
	}

	private function normalize_color( string $color ): string {
		$color = strtolower( trim( $color ) );

		$color_map = [
			'black' => '#000000',
			'silver' => '#c0c0c0',
			'gray' => '#808080',
			'white' => '#ffffff',
			'maroon' => '#800000',
			'red' => '#ff0000',
			'purple' => '#800080',
			'fuchsia' => '#ff00ff',
			'green' => '#008000',
			'lime' => '#00ff00',
			'olive' => '#808000',
			'yellow' => '#ffff00',
			'navy' => '#000080',
			'blue' => '#0000ff',
			'teal' => '#008080',
			'aqua' => '#00ffff',
		];

		return $color_map[ $color ] ?? $color;
	}
}
