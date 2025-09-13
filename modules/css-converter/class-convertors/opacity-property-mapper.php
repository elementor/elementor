<?php

namespace Elementor\Modules\CssConverter\ClassConvertors;

class Opacity_Property_Mapper implements Class_Property_Mapper_Interface {

	public function supports( string $property, $value ): bool {
		return 'opacity' === $property && $this->is_valid_opacity( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized_opacity = $this->normalize_opacity( $value );

		return [
			'opacity' => [
				'$$type' => 'string',
				'value' => $normalized_opacity,
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
			if ( 0 === $decimal % 1 ) {
				return (string) (int) $decimal;
			}
			return (string) $decimal;
		}

		return null;
	}
}
