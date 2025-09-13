<?php

namespace Elementor\Modules\CssConverter\ClassConvertors;

class Font_Weight_Property_Mapper implements Class_Property_Mapper_Interface {

	const VALID_WEIGHTS = [
		'normal' => '400',
		'bold' => '700',
		'lighter' => '300',
		'bolder' => '700',
		'100' => '100',
		'200' => '200',
		'300' => '300',
		'400' => '400',
		'500' => '500',
		'600' => '600',
		'700' => '700',
		'800' => '800',
		'900' => '900',
	];

	public function supports( string $property, $value ): bool {
		return 'font-weight' === $property && $this->is_valid_font_weight( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized_weight = $this->normalize_font_weight( $value );

		return [
			'font-weight' => [
				'$$type' => 'string',
				'value' => $normalized_weight,
			],
		];
	}

	public function get_supported_properties(): array {
		return [ 'font-weight' ];
	}

	private function is_valid_font_weight( $value ): bool {
		$normalized = $this->normalize_font_weight( $value );
		return null !== $normalized;
	}

	private function normalize_font_weight( $value ): ?string {
		if ( ! is_string( $value ) && ! is_numeric( $value ) ) {
			return null;
		}

		$value = trim( strtolower( (string) $value ) );

		if ( isset( self::VALID_WEIGHTS[ $value ] ) ) {
			return self::VALID_WEIGHTS[ $value ];
		}

		if ( is_numeric( $value ) ) {
			$numeric_value = (int) $value;
			if ( $numeric_value >= 100 && $numeric_value <= 900 && 0 === $numeric_value % 100 ) {
				return (string) $numeric_value;
			}
		}

		return null;
	}
}
