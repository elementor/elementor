<?php
namespace Elementor\Modules\CssConverter\Convertors\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/unified-property-mapper-base.php';

class Font_Size_Property_Mapper extends Unified_Property_Mapper_Base {
	private const SUPPORTED_UNITS = [ 'px', 'em', 'rem', '%', 'pt', 'vh', 'vw' ];
	private const SIZE_PATTERN = '/^(\d+(?:\.\d+)?)(px|em|rem|%|pt|vh|vw)$/';

	public function supports( string $property, $value ): bool {
		return 'font-size' === $property && $this->is_valid_size( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized = $this->normalize_size_value( $value );
		$parsed = $this->parse_size_value( $normalized );

		return [
			'font-size' => [
				'$$type' => 'size',
				'value' => $parsed,
			],
		];
	}

	public function get_supported_properties(): array {
		return [ 'font-size' ];
	}

	private function is_valid_size( string $value ): bool {
		$value = trim( $value );

		if ( 1 === preg_match( self::SIZE_PATTERN, $value, $matches ) ) {
			$unit = $matches[2];
			return in_array( $unit, self::SUPPORTED_UNITS, true );
		}

		return false;
	}

	private function normalize_size_value( string $value ): string {
		$value = trim( $value );

		if ( 1 === preg_match( self::SIZE_PATTERN, $value, $matches ) ) {
			$number = (float) $matches[1];
			$unit = $matches[2];

			if ( 0 === $number % 1 ) {
				$number = (int) $number;
			}

			return $number . $unit;
		}

		return $value;
	}

	private function parse_size_value( string $value ): array {
		if ( 1 === preg_match( self::SIZE_PATTERN, $value, $matches ) ) {
			$number = (float) $matches[1];
			$unit = $matches[2];

			if ( 0 === $number % 1 ) {
				$number = (int) $number;
			}

			return [
				'size' => $number,
				'unit' => $unit,
			];
		}

		return [
			'size' => 16,
			'unit' => 'px',
		];
	}
}
