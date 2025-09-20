<?php

namespace Elementor\Modules\CssConverter\Convertors\Classes;

require_once __DIR__ . '/unified-property-mapper-base.php';

class Text_Align_Property_Mapper extends Unified_Property_Mapper_Base {

	const VALID_ALIGNMENTS = [
		'left',
		'center',
		'right',
		'justify',
		'start',
		'end',
	];

	public function supports( string $property, $value ): bool {
		return 'text-align' === $property && $this->is_valid_text_align( $value );
	}

	public function map_to_schema( string $property, $value ): array {
		$normalized_align = $this->normalize_text_align( $value );

		return [
			'text-align' => [
				'$$type' => 'string',
				'value' => $normalized_align,
			],
		];
	}

	public function get_supported_properties(): array {
		return [ 'text-align' ];
	}

	private function is_valid_text_align( $value ): bool {
		$normalized = $this->normalize_text_align( $value );
		return null !== $normalized;
	}

	private function normalize_text_align( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( strtolower( $value ) );

		// Map CSS values to Elementor V4 schema values
		$mapping = [
			'left' => 'start',
			'right' => 'end',
			'center' => 'center',
			'justify' => 'justify',
			'start' => 'start',
			'end' => 'end',
		];

		return $mapping[ $value ] ?? null;
	}
}
