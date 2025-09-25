<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Display_Property_Mapper extends Property_Mapper_Base {

	const VALID_DISPLAYS = [
		'block',
		'inline',
		'inline-block',
		'flex',
		'inline-flex',
		'grid',
		'inline-grid',
		'none',
		'table',
		'table-cell',
		'table-row',
	];

	public function supports( string $property, $value ): bool {
		return 'display' === $property && $this->is_valid_display( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized_display = $this->normalize_display( $value );

		return [
			'display' => [
				'$$type' => 'string',
				'value' => $normalized_display,
			],
		];
	}

	public function get_supported_properties(): array {
		return [ 'display' ];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		// Basic implementation - convert property name to v4 format
		// Keep original property name with hyphens for consistency
		return $this->create_v4_property( $property, $value );
	}

	private function is_valid_display( $value ): bool {
		$normalized = $this->normalize_display( $value );
		return null !== $normalized;
	}

	private function normalize_display( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( strtolower( $value ) );

		if ( in_array( $value, self::VALID_DISPLAYS, true ) ) {
			return $value;
		}

		return null;
	}
}
