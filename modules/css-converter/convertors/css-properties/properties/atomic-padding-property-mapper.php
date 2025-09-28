<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Padding Property Mapper
 *
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
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

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		$dimensions_data = $this->parse_padding_property( $property, (string) $value );
		if ( null === $dimensions_data ) {
			return null;
		}
		
		// ✅ ATOMIC-ONLY COMPLIANCE: Pure atomic prop type return
		return Dimensions_Prop_Type::make()->generate( $dimensions_data );
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
