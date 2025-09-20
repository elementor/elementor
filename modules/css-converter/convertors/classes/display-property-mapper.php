<?php

namespace Elementor\Modules\CssConverter\Convertors\Classes;

require_once __DIR__ . '/unified-property-mapper-base.php';

class Display_Property_Mapper extends Unified_Property_Mapper_Base {

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
