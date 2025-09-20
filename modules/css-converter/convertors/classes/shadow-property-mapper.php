<?php
namespace Elementor\Modules\CssConverter\Convertors\Classes;

require_once __DIR__ . '/unified-property-mapper-base.php';

class Shadow_Property_Mapper extends Unified_Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'text-shadow' ];
	const SIZE_PATTERN = '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw)?$/';
	const HEX3_PATTERN = '/^#([A-Fa-f0-9]{3})$/';
	const HEX6_PATTERN = '/^#([A-Fa-f0-9]{6})$/';
	const RGB_PATTERN = '/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/';
	const RGBA_PATTERN = '/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/';

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_shadow( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized = $this->normalize_shadow_value( $value );
		return [
			$property => [
				'$$type' => 'string',
				'value' => $normalized,
			],
		];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function is_valid_shadow( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( strtolower( $value ) );

		if ( $value === 'none' ) {
			return true;
		}

		// Basic validation for shadow syntax
		// This is a simplified check - real shadow parsing is complex
		return preg_match( '/^[\d\s\w#(),.-]+$/', $value );
	}

	private function normalize_shadow_value( string $value ): string {
		$value = trim( $value );

		if ( strtolower( $value ) === 'none' ) {
			return 'none';
		}

		return $value;
	}
}
