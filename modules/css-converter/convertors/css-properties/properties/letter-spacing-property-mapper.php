<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Letter_Spacing_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'letter-spacing',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) || 'normal' === trim( $value ) ) {
			return null;
		}

		$size_data = $this->parse_size_value( $value );
		if ( null === $size_data ) {
			return null;
		}

		return $this->create_atomic_size_value( $size_data );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	protected function parse_size_value( string $value ): ?array {
		$value = trim( $value );

		if ( '' === $value || 'normal' === $value ) {
			return null;
		}

		// Parse numeric value with unit
		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vw|vh)$/', $value, $matches ) ) {
			return [
				'size' => (float) $matches[1],
				'unit' => $matches[2]
			];
		}

		// Handle unitless values (assume px)
		if ( is_numeric( $value ) ) {
			return [
				'size' => (float) $value,
				'unit' => 'px'
			];
		}

		return null;
	}
}
