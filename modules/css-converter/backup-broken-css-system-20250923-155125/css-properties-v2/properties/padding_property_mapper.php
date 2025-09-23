<?php
namespace Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Properties;

use Elementor\Modules\CssConverter\Convertors\CssPropertiesV2\Implementations\Modern_Property_Mapper_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Padding Property Mapper
 * 
 * ATOMIC WIDGET RESEARCH:
 * Based on: Multiple atomic widgets use Dimensions_Prop_Type for padding
 * Prop Type: /atomic-widgets/prop-types/dimensions-prop-type.php
 * Expected: {"$$type": "dimensions", "value": {"block-start": {"$$type": "size", "value": {...}}, ...}}
 * 
 * REQUIREMENTS:
 * - Must handle CSS padding shorthand (1-4 values)
 * - Uses logical properties (block-start, inline-end, block-end, inline-start)
 * - Each dimension is a Size_Prop_Type nested structure
 */
class Padding_Property_Mapper extends Modern_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'padding',
		'padding-top',
		'padding-right', 
		'padding-bottom',
		'padding-left',
	];
	private const ATOMIC_WIDGET = 'e-container';
	private const PROP_TYPE = 'Dimensions_Prop_Type';

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_value = $this->parse_padding_value( $property, $value );
		if ( null === $parsed_value ) {
			return null;
		}

		$atomic_value = $this->create_atomic_property_with_type( 
			'padding', // Always use 'padding' as the property name
			'dimensions', 
			$parsed_value 
		);

		return $this->validate_against_atomic_schema( 'padding', $atomic_value ) 
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

	private function parse_padding_value( string $property, $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );
		
		if ( empty( $value ) ) {
			return null;
		}

		// Handle individual padding properties
		if ( 'padding' !== $property ) {
			return $this->parse_individual_padding( $property, $value );
		}

		// Handle padding shorthand
		return $this->parse_dimensions_shorthand( $value );
	}

	private function parse_individual_padding( string $property, string $value ): ?array {
		$parsed_size = $this->parse_size_value( $value );
		if ( null === $parsed_size ) {
			return null;
		}

		$size_prop = ['$$type' => 'size', 'value' => $parsed_size];
		$zero_size = ['$$type' => 'size', 'value' => ['size' => 0, 'unit' => 'px']];

		switch ( $property ) {
			case 'padding-top':
				return [
					'block-start' => $size_prop,
					'inline-end' => $zero_size,
					'block-end' => $zero_size,
					'inline-start' => $zero_size,
				];
			case 'padding-right':
				return [
					'block-start' => $zero_size,
					'inline-end' => $size_prop,
					'block-end' => $zero_size,
					'inline-start' => $zero_size,
				];
			case 'padding-bottom':
				return [
					'block-start' => $zero_size,
					'inline-end' => $zero_size,
					'block-end' => $size_prop,
					'inline-start' => $zero_size,
				];
			case 'padding-left':
				return [
					'block-start' => $zero_size,
					'inline-end' => $zero_size,
					'block-end' => $zero_size,
					'inline-start' => $size_prop,
				];
		}

		return null;
	}
}
