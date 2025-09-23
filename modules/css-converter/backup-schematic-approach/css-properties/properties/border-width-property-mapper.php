<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Border_Width_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [
		'border-width',
		'border-top-width',
		'border-right-width',
		'border-bottom-width',
		'border-left-width',
	];
	const SIZE_PATTERN = '/^(\d*\.?\d+)(px|em|rem|%|vh|vw)?$/';
	const KEYWORD_VALUES = [ 'thin', 'medium', 'thick' ];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_border_width( $property, $value );
	}

	public function map_to_schema( string $property, $value ): array {
		if ( $property === 'border-width' ) {
			$parsed = $this->parse_border_width_shorthand( $value );
			return [
				'border-top-width' => [
					'$$type' => 'size',
					'value' => $parsed['top'],
				],
				'border-right-width' => [
					'$$type' => 'size',
					'value' => $parsed['right'],
				],
				'border-bottom-width' => [
					'$$type' => 'size',
					'value' => $parsed['bottom'],
				],
				'border-left-width' => [
					'$$type' => 'size',
					'value' => $parsed['left'],
				],
			];
		}
		$parsed = $this->parse_border_width_value( $value );
		return [
			$property => [
				'$$type' => 'size',
				'value' => $parsed,
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

	private function is_valid_border_width( string $property, $value ): bool {
		if ( $property === 'border-width' ) {
			$parts = preg_split( '/\s+/', trim( $value ) );
			if ( count( $parts ) > 4 ) {
				return false;
			}
			foreach ( $parts as $part ) {
				if ( ! $this->is_valid_width_value( $part ) ) {
					return false;
				}
			}
			return true;
		}
		return $this->is_valid_width_value( $value );
	}

	private function is_valid_width_value( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}
		$value = trim( strtolower( $value ) );
		return in_array( $value, self::KEYWORD_VALUES, true ) || 1 === preg_match( self::SIZE_PATTERN, $value );
	}

	private function parse_border_width_shorthand( string $value ): array {
		$parts = preg_split( '/\s+/', trim( $value ) );
		$count = count( $parts );
		$top = $right = $bottom = $left = 'medium';

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
			'top' => $this->parse_border_width_value( $top ),
			'right' => $this->parse_border_width_value( $right ),
			'bottom' => $this->parse_border_width_value( $bottom ),
			'left' => $this->parse_border_width_value( $left ),
		];
	}

	private function parse_border_width_value( string $value ): array {
		$value = trim( strtolower( $value ) );

		// Handle keyword values
		if ( in_array( $value, self::KEYWORD_VALUES, true ) ) {
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

		// Handle size values
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
			'size' => 3,
			'unit' => 'px',
		]; // Default to medium
	}
}
