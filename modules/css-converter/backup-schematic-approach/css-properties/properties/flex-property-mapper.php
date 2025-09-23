<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Flex_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'flex', 'flex-grow', 'flex-shrink', 'flex-basis' ];
	const SIZE_PATTERN = '/^(\d*\.?\d+)(px|em|rem|%|vh|vw)?$/';

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_flex( $property, $value );
	}

	public function map_to_schema( string $property, $value ): array {
		if ( $property === 'flex' ) {
			$parsed = $this->parse_flex_shorthand( $value );
			$result = [];
			if ( isset( $parsed['grow'] ) ) {
				$result['flex-grow'] = [
					'$$type' => 'number',
					'value' => $parsed['grow'],
				];
			}
			if ( isset( $parsed['shrink'] ) ) {
				$result['flex-shrink'] = [
					'$$type' => 'number',
					'value' => $parsed['shrink'],
				];
			}
			if ( isset( $parsed['basis'] ) ) {
				$result['flex-basis'] = [
					'$$type' => 'size',
					'value' => $parsed['basis'],
				];
			}
			return $result;
		}

		if ( in_array( $property, [ 'flex-grow', 'flex-shrink' ], true ) ) {
			$number = $this->parse_number_value( $value );
			return [
				$property => [
					'$$type' => 'number',
					'value' => $number,
				],
			];
		}

		if ( $property === 'flex-basis' ) {
			$size = $this->parse_flex_basis_value( $value );
			return [
				$property => [
					'$$type' => 'size',
					'value' => $size,
				],
			];
		}

		return [];
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

	private function is_valid_flex( string $property, $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( strtolower( $value ) );

		if ( $property === 'flex' ) {
			return $this->is_valid_flex_shorthand( $value );
		}

		if ( in_array( $property, [ 'flex-grow', 'flex-shrink' ], true ) ) {
			return is_numeric( $value ) && (float) $value >= 0;
		}

		if ( $property === 'flex-basis' ) {
			return $value === 'auto' || 1 === preg_match( self::SIZE_PATTERN, $value );
		}

		return false;
	}

	private function is_valid_flex_shorthand( string $value ): bool {
		$value = trim( $value );

		// Handle keywords
		if ( in_array( $value, [ 'auto', 'initial', 'none' ], true ) ) {
			return true;
		}

		// Handle numeric values and sizes
		$parts = preg_split( '/\s+/', $value );
		if ( count( $parts ) > 3 ) {
			return false;
		}

		foreach ( $parts as $part ) {
			if ( ! ( is_numeric( $part ) || 1 === preg_match( self::SIZE_PATTERN, $part ) || $part === 'auto' ) ) {
				return false;
			}
		}

		return true;
	}

	private function parse_flex_shorthand( string $value ): array {
		$value = trim( strtolower( $value ) );

		// Handle keywords
		if ( $value === 'auto' ) {
			return [
				'grow' => 1,
				'shrink' => 1,
				'basis' => [
					'size' => 'auto',
					'unit' => '',
				],
			];
		}
		if ( $value === 'initial' ) {
			return [
				'grow' => 0,
				'shrink' => 1,
				'basis' => [
					'size' => 'auto',
					'unit' => '',
				],
			];
		}
		if ( $value === 'none' ) {
			return [
				'grow' => 0,
				'shrink' => 0,
				'basis' => [
					'size' => 'auto',
					'unit' => '',
				],
			];
		}

		$parts = preg_split( '/\s+/', $value );
		$result = [];

		foreach ( $parts as $part ) {
			if ( is_numeric( $part ) ) {
				if ( ! isset( $result['grow'] ) ) {
					$result['grow'] = (float) $part;
				} elseif ( ! isset( $result['shrink'] ) ) {
					$result['shrink'] = (float) $part;
				}
			} elseif ( 1 === preg_match( self::SIZE_PATTERN, $part ) || $part === 'auto' ) {
				$result['basis'] = $this->parse_flex_basis_value( $part );
			}
		}

		return $result;
	}

	private function parse_number_value( string $value ): float {
		return max( 0, (float) trim( $value ) );
	}

	private function parse_flex_basis_value( string $value ): array {
		$value = trim( strtolower( $value ) );

		if ( $value === 'auto' ) {
			return [
				'size' => 'auto',
				'unit' => '',
			];
		}

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
			'size' => 'auto',
			'unit' => '',
		];
	}
}
