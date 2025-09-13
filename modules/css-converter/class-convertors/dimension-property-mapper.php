<?php

namespace Elementor\Modules\CssConverter\ClassConvertors;

class Dimension_Property_Mapper implements Class_Property_Mapper_Interface {

	const SUPPORTED_PROPERTIES = [ 'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height' ];
	const SIZE_PATTERN = '/^(\d*\.?\d+)(px|em|rem|%|vh|vw|vmin|vmax)?$/';
	const KEYWORD_VALUES = [ 'auto', 'inherit', 'initial', 'unset', 'fit-content', 'max-content', 'min-content' ];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_dimension( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized = $this->normalize_dimension_value( $value );

		if ( in_array( $normalized, self::KEYWORD_VALUES, true ) ) {
			return [
				$property => [
					'$$type' => 'string',
					'value' => $normalized,
				],
			];
		}

		$parsed = $this->parse_dimension_value( $normalized );

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

	private function is_valid_dimension( $value ): bool {
		if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
			return false;
		}

		$value = trim( strtolower( (string) $value ) );

		if ( in_array( $value, self::KEYWORD_VALUES, true ) ) {
			return true;
		}

		return 1 === preg_match( self::SIZE_PATTERN, $value );
	}

	private function normalize_dimension_value( $value ): string {
		$value = trim( strtolower( (string) $value ) );

		if ( in_array( $value, self::KEYWORD_VALUES, true ) ) {
			return $value;
		}

		if ( is_numeric( $value ) ) {
			return $value . 'px';
		}

		return $value;
	}

	private function parse_dimension_value( string $value ): array {
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
			'size' => 0,
			'unit' => 'px',
		];
	}
}
