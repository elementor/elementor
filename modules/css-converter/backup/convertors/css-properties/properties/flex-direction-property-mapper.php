<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

class Flex_Direction_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'flex-direction' ];
	const VALID_VALUES = [ 'row', 'row-reverse', 'column', 'column-reverse' ];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_flex_direction( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		return [
			$property => [
				'$$type' => 'string',
				'value' => trim( $value ),
			],
		];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		return [
			'property' => $property,
			'value' => [
				'$$type' => 'string',
				'value' => trim( $value ),
			],
		];
	}

	private function is_valid_flex_direction( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( strtolower( $value ) );
		return in_array( $value, self::VALID_VALUES, true );
	}
}
