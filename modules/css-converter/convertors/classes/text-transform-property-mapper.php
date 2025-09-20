<?php

namespace Elementor\Modules\CssConverter\Convertors\Classes;

require_once __DIR__ . '/unified-property-mapper-base.php';

class Text_Transform_Property_Mapper extends Unified_Property_Mapper_Base {

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
