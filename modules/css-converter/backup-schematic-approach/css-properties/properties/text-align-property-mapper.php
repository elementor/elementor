<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
class Text_Align_Property_Mapper extends Property_Mapper_Base {

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

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property, $value ) ) {
			return null;
		}

		$normalized_align = $this->normalize_text_align( $value );
		if ( null === $normalized_align ) {
			return null;
		}

		return $this->create_v4_property_with_type( 'text-align', 'string', $normalized_align );
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
