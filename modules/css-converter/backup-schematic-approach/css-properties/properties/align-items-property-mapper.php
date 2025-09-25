<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;

class Align_Items_Property_Mapper extends Property_Mapper_Base {
	const SUPPORTED_PROPERTIES = [ 'align-items' ];
	const VALID_VALUES = [ 'stretch', 'flex-start', 'flex-end', 'center', 'baseline', 'start', 'end', 'self-start', 'self-end' ];

	public function supports( string $property, $value ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true ) && $this->is_valid_align_items( $value );
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

	private function is_valid_align_items( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( strtolower( $value ) );
		return in_array( $value, self::VALID_VALUES, true );
	}
}
