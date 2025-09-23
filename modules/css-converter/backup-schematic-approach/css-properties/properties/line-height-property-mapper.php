<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Line_Height_Property_Mapper extends Property_Mapper_Base {

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

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		return $this->create_v4_property_with_type( 'line-height', 'string', $value );
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
				// For unitless line-height, convert to em equivalent
				return [
					'size' => $number,
					'unit' => 'em',
				];
			}

			return [
				'size' => $number,
				'unit' => $unit,
			];
		}

		return [
			'size' => 1.2,
			'unit' => 'em',
		];
	}
}
