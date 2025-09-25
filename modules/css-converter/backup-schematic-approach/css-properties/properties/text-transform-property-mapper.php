<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Text_Transform_Property_Mapper extends Property_Mapper_Base {

	const VALID_TRANSFORMS = [
		'none',
		'uppercase',
		'lowercase',
		'capitalize',
	];

	public function supports( string $property, $value ): bool {
		return 'text-transform' === $property && $this->is_valid_text_transform( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized_transform = $this->normalize_text_transform( $value );

		return [
			'text-transform' => [
				'$$type' => 'string',
				'value' => $normalized_transform,
			],
		];
	}

	public function get_supported_properties(): array {
		return [ 'text-transform' ];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		// Basic implementation - convert property name to v4 format
		// Keep original property name with hyphens for consistency
		return $this->create_v4_property( $property, $value );
	}

	private function is_valid_text_transform( $value ): bool {
		$normalized = $this->normalize_text_transform( $value );
		return null !== $normalized;
	}

	private function normalize_text_transform( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( strtolower( $value ) );

		if ( in_array( $value, self::VALID_TRANSFORMS, true ) ) {
			return $value;
		}

		return null;
	}
}
