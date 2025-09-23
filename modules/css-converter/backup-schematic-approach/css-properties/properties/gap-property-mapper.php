<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

class Gap_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'gap', 'row-gap', 'column-gap' ];
	const SIZE_PATTERN = '/^(\d*\.?\d+)(px|em|rem|%|vh|vw|ch|ex|vmin|vmax)?$/';

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_gap( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		if ( $property === 'gap' ) {
			$parsed = $this->parse_gap_shorthand( $value );
			$result = [];
			
			if ( isset( $parsed['row'] ) ) {
				$result['row-gap'] = [
					'$$type' => 'size',
					'value' => $parsed['row'],
				];
			}
			
			if ( isset( $parsed['column'] ) ) {
				$result['column-gap'] = [
					'$$type' => 'size',
					'value' => $parsed['column'],
				];
			}
			
			return $result;
		}

		$size = $this->parse_size_value( $value );
		return [
			$property => [
				'$$type' => 'size',
				'value' => $size,
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

		if ( $property === 'gap' ) {
			$parsed = $this->parse_gap_shorthand( $value );
			
			// For gap shorthand, return the first value as the gap property
			if ( isset( $parsed['row'] ) ) {
				return [
					'property' => 'gap',
					'value' => [
						'$$type' => 'size',
						'value' => $parsed['row'],
					],
				];
			}
		}

		$size = $this->parse_size_value( $value );
		return [
			'property' => $property,
			'value' => [
				'$$type' => 'size',
				'value' => $size,
			],
		];
	}

	private function is_valid_gap( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( $value );
		
		if ( $value === '0' || $value === 'normal' ) {
			return true;
		}

		// Handle gap shorthand (1 or 2 values)
		$parts = preg_split( '/\s+/', $value );
		if ( count( $parts ) > 2 ) {
			return false;
		}

		foreach ( $parts as $part ) {
			if ( ! preg_match( self::SIZE_PATTERN, $part ) ) {
				return false;
			}
		}

		return true;
	}

	private function parse_gap_shorthand( string $value ): array {
		$value = trim( $value );
		$parts = preg_split( '/\s+/', $value );
		$result = [];

		if ( count( $parts ) === 1 ) {
			// Single value applies to both row and column
			$size = $this->parse_size_value( $parts[0] );
			$result['row'] = $size;
			$result['column'] = $size;
		} elseif ( count( $parts ) === 2 ) {
			// First value is row-gap, second is column-gap
			$result['row'] = $this->parse_size_value( $parts[0] );
			$result['column'] = $this->parse_size_value( $parts[1] );
		}

		return $result;
	}

	private function parse_size_value( string $value ): array {
		$value = trim( $value );

		if ( $value === '0' ) {
			return [
				'size' => 0,
				'unit' => 'px',
			];
		}

		if ( $value === 'normal' ) {
			return [
				'size' => 'normal',
				'unit' => '',
			];
		}

		if ( preg_match( self::SIZE_PATTERN, $value, $matches ) ) {
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
			'size' => 0,
			'unit' => 'px',
		];
	}
}
