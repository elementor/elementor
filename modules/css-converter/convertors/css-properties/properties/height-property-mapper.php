<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Height Property Mapper
 *
 * 🎯 ATOMIC SOURCE: style-schema.php uses Size_Prop_Type for height
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
 */
class Height_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'height',
		'min-height',
		'max-height',
	];

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) || empty( trim( $value ) ) ) {
			return null;
		}

		$size_data = $this->parse_size_value( $value );

		// ✅ ATOMIC-ONLY COMPLIANCE: Pure atomic prop type return
		return Size_Prop_Type::make()->generate( $size_data );
	}

	protected function parse_size_value( string $value ): array {
		$value = trim( $value );

		if ( empty( $value ) ) {
			return [
				'size' => 0,
				'unit' => 'px',
			];
		}

		// Handle special values
		if ( in_array( $value, [ 'auto', 'inherit', 'initial', 'unset' ], true ) ) {
			return [
				'size' => '',
				'unit' => 'auto'
			];
		}

		// Parse numeric value with unit
		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vw|vh|vmin|vmax)$/', $value, $matches ) ) {
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

		// Fallback for invalid values
		return [
			'size' => 0,
			'unit' => 'px',
		];
	}
}
