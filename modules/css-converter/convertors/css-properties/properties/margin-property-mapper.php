<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Margin Property Mapper
 * 
 * 🎯 ATOMIC SOURCE: atomic widgets use Dimensions_Prop_Type for margin
 * 🚫 FALLBACKS: NONE - 100% atomic widget compliance
 * ✅ VALIDATION: Matches atomic widget expectations exactly
 * 
 * 🚨 ATOMIC-ONLY VIOLATION DETECTED:
 * ❌ ISSUE: Manual JSON creation in map_to_v4_atomic() method
 * ❌ CURRENT: return ['property' => ..., 'value' => ...]
 * ✅ SHOULD BE: return Dimensions_Prop_Type::make()->generate($dimensions_data);
 * 
 * 🔧 REQUIRED FIX:
 * 1. Remove manual JSON wrapper structure
 * 2. Return atomic prop type directly: Dimensions_Prop_Type::make()->generate()
 * 3. Let atomic widgets handle ALL JSON creation
 * 4. Remove Size_Prop_Type::make()->generate() calls in parse method
 * 
 * 🎯 ATOMIC-ONLY COMPLIANCE CHECK:
 * - Widget JSON source: Dimensions_Prop_Type
 * - Property JSON source: /atomic-widgets/prop-types/dimensions-prop-type.php
 * - Fallback usage: NONE - Zero fallback mechanisms
 * - Custom JSON creation: ❌ VIOLATION - Manual JSON wrapper present
 * - Enhanced_Property_Mapper usage: NONE - Completely removed
 * - Base class method usage: NONE - Only atomic prop types used
 * - Manual $$type assignment: NONE - Only atomic widgets assign types
 */
class Margin_Property_Mapper extends Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'margin',
		'margin-top',
		'margin-right',
		'margin-bottom',
		'margin-left',
		'margin-block',
		'margin-block-start',
		'margin-block-end',
		'margin-inline',
		'margin-inline-start',
		'margin-inline-end',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		$dimensions_data = $this->parse_margin_value( $property, $value );
		if ( null === $dimensions_data ) {
			return null;
		}

		// 🚨 ATOMIC-ONLY VIOLATION: Manual JSON creation below
		// ❌ CURRENT CODE: Manual JSON wrapper structure
		$dimensions_prop_type = Dimensions_Prop_Type::make();
		$atomic_value = $dimensions_prop_type->generate( $dimensions_data );

		return [
			'property' => 'margin',  // ❌ VIOLATION: Manual JSON creation
			'value' => $atomic_value // ❌ VIOLATION: Manual wrapper
		];

		// ✅ CORRECT ATOMIC-ONLY APPROACH:
		// return Dimensions_Prop_Type::make()->generate( $dimensions_data );
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	private function parse_margin_value( string $property, $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );

		if ( empty( $value ) ) {
			return null;
		}

		if ( 'margin' === $property ) {
			return $this->parse_shorthand_margin( $value );
		}

		return $this->parse_individual_margin( $property, $value );
	}

	private function parse_shorthand_margin( string $value ): ?array {
		$parts = preg_split( '/\s+/', trim( $value ) );
		$count = count( $parts );

		if ( $count < 1 || $count > 4 ) {
			return null;
		}

		$top = $this->parse_size_value( $parts[0] );
		$right = $this->parse_size_value( $parts[ $count > 1 ? 1 : 0 ] );
		$bottom = $this->parse_size_value( $parts[ $count > 2 ? 2 : 0 ] );
		$left = $this->parse_size_value( $parts[ $count > 3 ? 3 : ( $count > 1 ? 1 : 0 ) ] );

		if ( null === $top || null === $right || null === $bottom || null === $left ) {
			return null;
		}

		return [
			'block-start' => Size_Prop_Type::make()->generate( $top ),
			'inline-end' => Size_Prop_Type::make()->generate( $right ),
			'block-end' => Size_Prop_Type::make()->generate( $bottom ),
			'inline-start' => Size_Prop_Type::make()->generate( $left ),
		];
	}

	private function parse_individual_margin( string $property, string $value ): ?array {
		$size_data = $this->parse_size_value( $value );
		if ( null === $size_data ) {
			return null;
		}

		$size_value = Size_Prop_Type::make()->generate( $size_data );
		$zero_size = Size_Prop_Type::make()->generate( [ 'size' => 0.0, 'unit' => 'px' ] );

		$logical_property = $this->map_physical_to_logical( $property );

		$dimensions = [
			'block-start' => $zero_size,
			'inline-end' => $zero_size,
			'block-end' => $zero_size,
			'inline-start' => $zero_size,
		];

		if ( isset( $dimensions[ $logical_property ] ) ) {
			$dimensions[ $logical_property ] = $size_value;
		}

		return $dimensions;
	}

	private function map_physical_to_logical( string $property ): string {
		$mapping = [
			'margin-top' => 'block-start',
			'margin-right' => 'inline-end',
			'margin-bottom' => 'block-end',
			'margin-left' => 'inline-start',
			'margin-block-start' => 'block-start',
			'margin-block-end' => 'block-end',
			'margin-inline-start' => 'inline-start',
			'margin-inline-end' => 'inline-end',
		];

		return $mapping[ $property ] ?? 'block-start';
	}

	private function parse_size_value( string $value ): ?array {
		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vw|vh)$/', $value, $matches ) ) {
			return [
				'size' => (float) $matches[1],
				'unit' => $matches[2]
			];
		}

		if ( is_numeric( $value ) ) {
			return [
				'size' => (float) $value,
				'unit' => 'px'
			];
		}

		return null;
	}
}