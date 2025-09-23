<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Text_Decoration_Property_Mapper extends Property_Mapper_Base {

	const VALID_DECORATIONS = [
		'none',
		'underline',
		'overline',
		'line-through',
	];

	public function supports( string $property, $value ): bool {
		return 'text-decoration' === $property && $this->is_valid_text_decoration( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized_decoration = $this->normalize_text_decoration( $value );

		return [
			'text-decoration' => [
				'$$type' => 'string',
				'value' => $normalized_decoration,
			],
		];
	}

	public function get_supported_properties(): array {
		return [ 'text-decoration' ];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		// Basic implementation - convert property name to v4 format
		// Keep original property name with hyphens for consistency
		return $this->create_v4_property( $property, $value );
	}

	private function is_valid_text_decoration( $value ): bool {
		$normalized = $this->normalize_text_decoration( $value );
		return null !== $normalized;
	}

	private function normalize_text_decoration( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( strtolower( $value ) );

		if ( in_array( $value, self::VALID_DECORATIONS, true ) ) {
			return $value;
		}

		if ( false !== strpos( $value, 'underline' ) ) {
			return 'underline';
		}

		if ( false !== strpos( $value, 'line-through' ) ) {
			return 'line-through';
		}

		if ( false !== strpos( $value, 'overline' ) ) {
			return 'overline';
		}

		return null;
	}
}
