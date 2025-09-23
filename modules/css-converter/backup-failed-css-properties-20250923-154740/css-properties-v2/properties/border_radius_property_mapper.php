<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Border Radius Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: Multiple atomic widgets use Border_Radius_Prop_Type for border-radius
 * Prop Type: /atomic-widgets/prop-types/border-radius-prop-type.php
 * Expected: {"$$type": "border-radius", "value": {"start-start": {"$$type": "size", "value": {...}}, ...}}
 * 
 * REQUIREMENTS:
 * - Must handle CSS border-radius shorthand (1-4 values)
 * - Uses logical properties (start-start, start-end, end-start, end-end)
 * - Each corner is a Size_Prop_Type nested structure
 * - Supports uniform and individual corner values
 */
class Border_Radius_Property_Mapper extends Modern_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'border-radius',
		'border-top-left-radius',
		'border-top-right-radius',
		'border-bottom-right-radius',
		'border-bottom-left-radius',
	];
	private const ATOMIC_WIDGET = 'e-container';
	private const PROP_TYPE = 'Border_Radius_Prop_Type';

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_value = $this->parse_border_radius_value( $property, $value );
		if ( null === $parsed_value ) {
			return null;
		}

		$atomic_value = $this->create_atomic_property_with_type( 
			'border-radius', // Always use 'border-radius' as the property name
			'border-radius', 
			$parsed_value 
		);

		return $this->validate_against_atomic_schema( 'border-radius', $atomic_value ) 
			? $atomic_value 
			: null;
	}

	public function get_supported_atomic_widgets(): array {
		return [
			'e-container',
			'e-flexbox',
			'e-heading',
			'e-paragraph',
			'e-button',
		];
	}

	public function get_required_prop_types(): array {
		return [self::PROP_TYPE];
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	private function parse_border_radius_value( string $property, $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		if ( empty( $value ) ) {
			return null;
		}

		// Handle individual border-radius properties
		if ( 'border-radius' !== $property ) {
			return $this->parse_individual_border_radius( $property, $value );
		}

		// Handle border-radius shorthand
		return $this->parse_border_radius_shorthand( $value );
	}

	private function parse_individual_border_radius( string $property, string $value ): ?array {
		$parsed_size = $this->parse_size_value( $value );
		if ( null === $parsed_size ) {
			return null;
		}

		$size_prop = ['$$type' => 'size', 'value' => $parsed_size];
		$zero_size = ['$$type' => 'size', 'value' => ['size' => 0, 'unit' => 'px']];

		switch ( $property ) {
			case 'border-top-left-radius':
				return [
					'start-start' => $size_prop,
					'start-end' => $zero_size,
					'end-start' => $zero_size,
					'end-end' => $zero_size,
				];
			case 'border-top-right-radius':
				return [
					'start-start' => $zero_size,
					'start-end' => $size_prop,
					'end-start' => $zero_size,
					'end-end' => $zero_size,
				];
			case 'border-bottom-right-radius':
				return [
					'start-start' => $zero_size,
					'start-end' => $zero_size,
					'end-start' => $zero_size,
					'end-end' => $size_prop,
				];
			case 'border-bottom-left-radius':
				return [
					'start-start' => $zero_size,
					'start-end' => $zero_size,
					'end-start' => $size_prop,
					'end-end' => $zero_size,
				];
		}

		return null;
	}

	private function parse_border_radius_shorthand( string $value ): ?array {
		$values = preg_split( '/\s+/', trim( $value ) );
		$count = count( $values );

		if ( 0 === $count || $count > 4 ) {
			return null;
		}

		$parsed_values = [];
		foreach ( $values as $val ) {
			$parsed = $this->parse_size_value( $val );
			if ( null === $parsed ) {
				return null;
			}
			$parsed_values[] = ['$$type' => 'size', 'value' => $parsed];
		}

		switch ( $count ) {
			case 1:
				return [
					'start-start' => $parsed_values[0],
					'start-end' => $parsed_values[0],
					'end-start' => $parsed_values[0],
					'end-end' => $parsed_values[0],
				];
			case 2:
				return [
					'start-start' => $parsed_values[0],
					'start-end' => $parsed_values[1],
					'end-start' => $parsed_values[0],
					'end-end' => $parsed_values[1],
				];
			case 3:
				return [
					'start-start' => $parsed_values[0],
					'start-end' => $parsed_values[1],
					'end-start' => $parsed_values[2],
					'end-end' => $parsed_values[1],
				];
			case 4:
				return [
					'start-start' => $parsed_values[0],
					'start-end' => $parsed_values[1],
					'end-start' => $parsed_values[3],
					'end-end' => $parsed_values[2],
				];
		}

		return null;
	}
}
