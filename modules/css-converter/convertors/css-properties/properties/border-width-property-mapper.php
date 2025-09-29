<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Border_Width_Property_Mapper extends Atomic_Property_Mapper_Base {

	public function get_supported_properties(): array {
		return [ 
			'border-width',
			'border-top-width',
			'border-right-width', 
			'border-bottom-width',
			'border-left-width'
		];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		if ( empty( $value ) || 'inherit' === $value || 'initial' === $value || 'unset' === $value ) {
			return null;
		}

		// ✅ BORDER-RADIUS PATTERN: For simple border-width values, use Size_Prop_Type
		if ( 'border-width' === $property && $this->is_simple_border_width( $value ) ) {
			$size_value = $this->parse_border_width_value( $value );
			if ( null === $size_value ) {
				return null;
			}
			// Return atomic result directly like the working size mapper
			return [
				'property' => 'border-width',
				'value' => Size_Prop_Type::make()
					->units( Size_Constants::border() )
					->generate( $size_value )
			];
		}

		// ✅ BORDER-RADIUS PATTERN: For individual border properties or multi-value shorthand
		return $this->handle_border_width_with_directions( $property, $value );
	}

	public function supports( string $property, $value = null ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	private function is_simple_border_width( string $value ): bool {
		// Simple if it's a single value (not shorthand with multiple values)
		$values = $this->parse_shorthand_values( $value );
		return count( $values ) === 1;
	}

	private function handle_border_width_with_directions( string $property, $value ): ?array {
		if ( 'border-width' === $property ) {
			return $this->handle_shorthand_border_width( $value );
		}

		return $this->handle_individual_border_width( $property, $value );
	}

	private function handle_shorthand_border_width( $value ): ?array {
		$values = $this->parse_shorthand_values( $value );
		
		if ( empty( $values ) ) {
			return null;
		}

		// ✅ BORDER-RADIUS PATTERN: Multi-value shorthand uses Border_Width_Prop_Type
		$directional_values = $this->expand_shorthand_to_directional( $values );
		$parsed_values = [];

		foreach ( $directional_values as $direction => $val ) {
			$parsed = $this->parse_border_width_value( $val );
			if ( null === $parsed ) {
				return null;
			}
			$parsed_values[ $direction ] = Size_Prop_Type::make()
				->units( Size_Constants::border() )
				->generate( $parsed );
		}

		// ✅ BORDER-RADIUS PATTERN: Return as "border-width" property
		return [
			'property' => 'border-width',
			'value' => Border_Width_Prop_Type::make()->generate( $parsed_values )
		];
	}

	private function handle_individual_border_width( string $property, $value ): ?array {
		$parsed = $this->parse_border_width_value( $value );
		
		if ( null === $parsed ) {
			return null;
		}

		$direction_map = [
			'border-top-width' => 'block-start',
			'border-right-width' => 'inline-end', 
			'border-bottom-width' => 'block-end',
			'border-left-width' => 'inline-start',
		];

		$direction = $direction_map[ $property ] ?? null;
		if ( null === $direction ) {
			return null;
		}

		// ✅ BORDER-RADIUS PATTERN: Individual properties create Border_Width_Prop_Type with specific direction
		$border_width_value = [
			$direction => Size_Prop_Type::make()
				->units( Size_Constants::border() )
				->generate( $parsed )
		];

		// ✅ BORDER-RADIUS PATTERN: Return as "border-width" property (not individual property name)
		return [
			'property' => 'border-width',
			'value' => Border_Width_Prop_Type::make()->generate( $border_width_value )
		];
	}

	private function parse_shorthand_values( $value ): array {
		$value = trim( $value );
		$values = preg_split( '/\s+/', $value );
		
		$parsed_values = [];
		foreach ( $values as $val ) {
			$val = trim( $val );
			if ( ! empty( $val ) ) {
				$parsed_values[] = $val;
			}
		}
		
		return $parsed_values;
	}

	private function expand_shorthand_to_directional( array $values ): array {
		$count = count( $values );
		
		switch ( $count ) {
			case 1:
				return [
					'block-start' => $values[0],
					'inline-end' => $values[0],
					'block-end' => $values[0],
					'inline-start' => $values[0],
				];
			case 2:
				return [
					'block-start' => $values[0],
					'inline-end' => $values[1],
					'block-end' => $values[0],
					'inline-start' => $values[1],
				];
			case 3:
				return [
					'block-start' => $values[0],
					'inline-end' => $values[1],
					'block-end' => $values[2],
					'inline-start' => $values[1],
				];
			case 4:
				return [
					'block-start' => $values[0],
					'inline-end' => $values[1],
					'block-end' => $values[2],
					'inline-start' => $values[3],
				];
			default:
				return [];
		}
	}

	private function parse_border_width_value( $value ): ?array {
		$value = trim( $value );

		$keyword_values = [
			'thin' => [ 'size' => 1, 'unit' => 'px' ],
			'medium' => [ 'size' => 3, 'unit' => 'px' ],
			'thick' => [ 'size' => 5, 'unit' => 'px' ],
		];

		if ( isset( $keyword_values[ $value ] ) ) {
			return $keyword_values[ $value ];
		}

		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vh|vw)$/i', $value, $matches ) ) {
			$numeric_value = (float) $matches[1];
			$unit = strtolower( $matches[2] );

			if ( $numeric_value < 0 ) {
				return null;
			}

			return [
				'size' => $numeric_value,
				'unit' => $unit,
			];
		}

		if ( is_numeric( $value ) ) {
			$numeric_value = (float) $value;
			
			if ( $numeric_value < 0 ) {
				return null;
			}
			
			return [
				'size' => $numeric_value,
				'unit' => 'px',
			];
		}

		return null;
	}
}
