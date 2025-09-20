<?php

namespace Elementor\Modules\CssConverter\Convertors\Classes;

require_once __DIR__ . '/unified-property-mapper-base.php';

class Opacity_Property_Mapper extends Unified_Property_Mapper_Base {

	public function supports( string $property, $value ): bool {
		return 'opacity' === $property && $this->is_valid_opacity( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized_opacity = $this->normalize_opacity( $value );

		// Convert to percentage for Elementor V4 schema
		$percentage = (float) $normalized_opacity * 100;

		return [
			'opacity' => [
				'$$type' => 'size',
				'value' => [
					'size' => $percentage,
					'unit' => '%',
				],
			],
		];
	}

	public function get_supported_properties(): array {
		return [ 'opacity' ];
	}

	private function is_valid_opacity( $value ): bool {
		if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
			return false;
		}

		$normalized = $this->normalize_opacity( $value );
		return null !== $normalized;
	}

	private function normalize_opacity( $value ): ?string {
		$value = trim( (string) $value );

		if ( '%' === substr( $value, -1 ) ) {
			$percentage = (float) rtrim( $value, '%' );
			if ( $percentage >= 0 && $percentage <= 100 ) {
				$decimal = $percentage / 100;
				return (string) $decimal;
			}
			return null;
		}

		$decimal = (float) $value;
		if ( $decimal >= 0 && $decimal <= 1 ) {
			// Check if it's a whole number (like 0.0 or 1.0)
			if ( floor( $decimal ) == $decimal ) {
				return (string) (int) $decimal;
			}
			return (string) $decimal;
		}

		return null;
	}
}
