<?php

namespace Elementor\Modules\CssConverter\ClassConvertors;

class Line_Height_Property_Mapper implements Class_Property_Mapper_Interface {

	const UNIT_PATTERN = '/^(\d*\.?\d+)(px|em|rem|%)?$/';

	public function supports( string $property, $value ): bool {
		return 'line-height' === $property && $this->is_valid_line_height( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized = $this->normalize_line_height( $value );
		$parsed = $this->parse_line_height_value( $normalized );

		return [
			'line-height' => [
				'$$type' => 'size',
				'value' => $parsed,
			],
		];
	}

	public function get_supported_properties(): array {
		return [ 'line-height' ];
	}

	private function is_valid_line_height( $value ): bool {
		if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
			return false;
		}

		$value = trim( (string) $value );

		if ( 'normal' === strtolower( $value ) ) {
			return true;
		}

		return 1 === preg_match( self::UNIT_PATTERN, $value );
	}

	private function normalize_line_height( $value ): string {
		$value = trim( (string) $value );

		if ( 'normal' === strtolower( $value ) ) {
			return '1.2';
		}

		return $value;
	}

	private function parse_line_height_value( string $value ): array {
		if ( 1 === preg_match( self::UNIT_PATTERN, $value, $matches ) ) {
			$number = (float) $matches[1];
			$unit = $matches[2] ?? '';

			if ( 0 === $number % 1 ) {
				$number = (int) $number;
			}

			if ( empty( $unit ) ) {
				return [
					'size' => $number,
					'unit' => '',
				];
			}

			return [
				'size' => $number,
				'unit' => $unit,
			];
		}

		return [
			'size' => 1.2,
			'unit' => '',
		];
	}
}
