<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Box_Shadow_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'box-shadow' ];
	const COLOR_PATTERN = '/#([A-Fa-f0-9]{3,8})|rgba?\([^)]*\)|hsla?\([^)]*\)|\b[a-z]+\b/';
	const SIZE_PATTERN = '/(-?\d*\.?\d+)(px|em|rem|%)?/';

	public function supports( string $property, $value ): bool {
		return 'box-shadow' === $property && is_string( $value ) && strlen( trim( $value ) ) > 0;
	}

	public function map_to_schema( string $property, $value ): array {
		$parsed = $this->parse_box_shadow( $value );
		return [
			'box-shadow' => [
				'$$type' => 'box-shadow',
				'value' => [
					[
						'$$type' => 'shadow',
						'value' => $parsed,
					],
				],
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

	private function parse_box_shadow( string $value ): array {
		// Example: 0 4px 8px 2px rgba(0,0,0,0.3) inset
		$shadow = [
			'hOffset' => [
				'$$type' => 'size',
				'value' => [
					'size' => 0,
					'unit' => 'px',
				],
			],
			'vOffset' => [
				'$$type' => 'size',
				'value' => [
					'size' => 0,
					'unit' => 'px',
				],
			],
			'blur' => [
				'$$type' => 'size',
				'value' => [
					'size' => 0,
					'unit' => 'px',
				],
			],
			'spread' => [
				'$$type' => 'size',
				'value' => [
					'size' => 0,
					'unit' => 'px',
				],
			],
			'color' => [
				'$$type' => 'color',
				'value' => 'rgba(0, 0, 0, 1)',
			],
		];

		$val = trim( $value );
		$position = null;
		if ( stripos( $val, 'inset' ) !== false ) {
			$position = 'inset';
			$val = str_ireplace( 'inset', '', $val );
		}

		// Extract color
		if ( preg_match( self::COLOR_PATTERN, $val, $matches ) ) {
			$color = $matches[0];
			$val = str_replace( $color, '', $val );
			$shadow['color'] = [
				'$$type' => 'color',
				'value' => trim( $color ),
			];
		}

		// Extract numbers with units (hOffset, vOffset, blur, spread)
		$parts = preg_split( '/\s+/', trim( $val ) );
		$sizes = [];
		foreach ( $parts as $index => $part ) {
			if ( preg_match( self::SIZE_PATTERN, $part, $m ) ) {
				$size_value = (float) $m[1];
				// WORKAROUND: Replace zero offset values with minimal non-zero values
				// Only apply to hOffset and vOffset (first two values), not blur/spread
				if ( 0 === $size_value && 2 > $index ) {
					$size_value = 0.01; // Minimal visible offset (0.01px)
				}
				$sizes[] = [
					'$$type' => 'size',
					'value' => [
						'size' => $size_value,
						'unit' => $m[2] ?? 'px',
					],
				];
			}
		}
		if ( count( $sizes ) > 0 ) {
			$shadow['hOffset'] = $sizes[0];
		}
		if ( count( $sizes ) > 1 ) {
			$shadow['vOffset'] = $sizes[1];
		}
		if ( count( $sizes ) > 2 ) {
			$shadow['blur'] = $sizes[2];
		}
		if ( count( $sizes ) > 3 ) {
			$shadow['spread'] = $sizes[3];
		}

		if ( 'inset' === $position ) {
			$shadow['position'] = [
				'$$type' => 'string',
				'value' => $position,
			];
		}

		return $shadow;
	}
}
