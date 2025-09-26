<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * 🚨 ATOMIC-ONLY VIOLATION DETECTED:
 * ❌ ISSUE: Contains fallback logic and manual JSON creation
 * ❌ CURRENT: Uses Atomic_Property_Mapper_Base with create_atomic_dimensions_value()
 * ✅ SHOULD BE: return Dimensions_Prop_Type::make()->generate($dimensions_data);
 * 
 * 🔧 REQUIRED FIX:
 * 1. Remove Atomic_Property_Mapper_Base inheritance
 * 2. Extend Property_Mapper_Base instead
 * 3. Remove create_atomic_dimensions_value() calls
 * 4. Return Dimensions_Prop_Type::make()->generate() directly
 * 5. Remove all fallback mechanisms
 * 
 * 🎯 ATOMIC-ONLY COMPLIANCE CHECK:
 * - Widget JSON source: ❌ VIOLATION - Uses base class methods
 * - Property JSON source: /atomic-widgets/prop-types/dimensions-prop-type.php
 * - Fallback usage: ❌ VIOLATION - Contains fallback logic
 * - Custom JSON creation: ❌ VIOLATION - Uses create_atomic_dimensions_value()
 * - Enhanced_Property_Mapper usage: NONE - Completely removed
 * - Base class method usage: ❌ VIOLATION - Uses Atomic_Property_Mapper_Base
 * - Manual $$type assignment: ❌ VIOLATION - Base class creates JSON
 */

class Atomic_Padding_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'padding',
		'padding-top',
		'padding-right',
		'padding-bottom',
		'padding-left',
		'padding-block-start',
		'padding-block-end',
		'padding-inline-start',
		'padding-inline-end',
		'padding-block',
		'padding-inline',
	];

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		$dimensions = $this->parse_padding_property( $property, (string) $value );
		if ( null === $dimensions ) {
			return null; // FORBIDDEN: No fallbacks for unparseable CSS
		}
		
		return $this->create_atomic_dimensions_value( 'padding', $dimensions );
	}

	private function parse_padding_property( string $property, string $value ): ?array {
		switch ( $property ) {
			case 'padding':
				return $this->parse_shorthand_to_logical_properties( $value );
			
			case 'padding-top':
				return $this->parse_individual_padding( 'block-start', $value );
			
			case 'padding-right':
				return $this->parse_individual_padding( 'inline-end', $value );
			
			case 'padding-bottom':
				return $this->parse_individual_padding( 'block-end', $value );
			
			case 'padding-left':
				return $this->parse_individual_padding( 'inline-start', $value );
			
			case 'padding-block-start':
				return $this->parse_individual_padding( 'block-start', $value );
			
			case 'padding-block-end':
				return $this->parse_individual_padding( 'block-end', $value );
			
			case 'padding-inline-start':
				return $this->parse_individual_padding( 'inline-start', $value );
			
			case 'padding-inline-end':
				return $this->parse_individual_padding( 'inline-end', $value );
			
			case 'padding-block':
				return $this->parse_logical_shorthand( $value, 'block' );
			
			case 'padding-inline':
				return $this->parse_logical_shorthand( $value, 'inline' );
			
			default:
				return null;
		}
	}

	private function parse_individual_padding( string $logical_side, string $value ): ?array {
		$parsed_size = $this->parse_size_value( $value );
		if ( null === $parsed_size ) {
			return null;
		}

		return [
			$logical_side => $parsed_size,
		];
	}

	private function parse_logical_shorthand( string $value, string $axis ): ?array {
		$values = preg_split( '/\s+/', trim( $value ) );
		$count = count( $values );

		if ( $count === 1 ) {
			$parsed = $this->parse_size_value( $values[0] );
			if ( null === $parsed ) {
				return null;
			}
			
			return [
				$axis . '-start' => $parsed,
				$axis . '-end' => $parsed,
			];
		}

		if ( $count === 2 ) {
			$start = $this->parse_size_value( $values[0] );
			$end = $this->parse_size_value( $values[1] );
			if ( null === $start || null === $end ) {
				return null;
			}
			
			return [
				$axis . '-start' => $start,
				$axis . '-end' => $end,
			];
		}

		return null; // Invalid logical shorthand
	}
}
