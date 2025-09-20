<?php
namespace Elementor\Modules\CssConverter\Convertors\Classes;

require_once __DIR__ . '/unified-property-mapper-base.php';

class Position_Property_Mapper extends Unified_Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'position', 'top', 'right', 'bottom', 'left', 'z-index' ];
	const SIZE_PATTERN = '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw)?$/';
	const POSITION_VALUES = [ 'static', 'relative', 'absolute', 'fixed', 'sticky' ];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_position_property( $property, $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$logical_map = [
			'top' => 'inset-block-start',
			'right' => 'inset-inline-end',
			'bottom' => 'inset-block-end',
			'left' => 'inset-inline-start',
		];
		$target_property = $logical_map[ $property ] ?? $property;
		if ( in_array( $property, [ 'top', 'right', 'bottom', 'left' ], true ) ) {
			$size = $this->parse_position_size_value( $value );
			return [
				$target_property => [
					'$$type' => 'size',
					'value' => $size,
				],
			];
		}
		if ( $property === 'position' ) {
			$normalized = $this->normalize_position_value( $value );
			return [
				$property => [
					'$$type' => 'string',
					'value' => $normalized,
				],
			];
		}
		if ( $property === 'z-index' ) {
			$number = $this->parse_z_index_value( $value );
			return [
				$property => [
					'$$type' => 'number',
					'value' => $number,
				],
			];
		}
		$size = $this->parse_position_size_value( $value );
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

	private function is_valid_position_property( string $property, $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( strtolower( $value ) );

		if ( $property === 'position' ) {
			return in_array( $value, self::POSITION_VALUES, true );
		}

		if ( $property === 'z-index' ) {
			return $value === 'auto' || ( is_numeric( $value ) && (int) $value == $value );
		}

		// top, right, bottom, left
		return $value === 'auto' || 1 === preg_match( self::SIZE_PATTERN, $value );
	}

	private function normalize_position_value( string $value ): string {
		$value = trim( strtolower( $value ) );
		return in_array( $value, self::POSITION_VALUES, true ) ? $value : 'static';
	}

	private function parse_z_index_value( string $value ): int {
		$value = trim( strtolower( $value ) );

		if ( $value === 'auto' ) {
			return 0;
		}

		return (int) $value;
	}

	private function parse_position_size_value( string $value ): array {
		$value = trim( strtolower( $value ) );

		if ( $value === 'auto' ) {
			return [
				'size' => 'auto',
				'unit' => '',
			];
		}

		// Allow negative values
		if ( 1 === preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw)?$/', $value, $matches ) ) {
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
