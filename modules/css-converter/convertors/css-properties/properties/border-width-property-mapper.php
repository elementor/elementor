<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Border_Width_Property_Mapper extends Property_Mapper_Base {

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
		if ( empty( $value ) || 'inherit' === $value || 'initial' === $value || 'unset' === $value ) {
			return null;
		}

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

		if ( count( $values ) === 1 ) {
			$parsed = $this->parse_border_width_value( $values[0] );
			if ( null === $parsed ) {
				return null;
			}
			return Size_Prop_Type::make()->generate( $parsed );
		}

		$directional_values = $this->expand_shorthand_to_directional( $values );
		$parsed_values = [];

		foreach ( $directional_values as $direction => $val ) {
			$parsed = $this->parse_border_width_value( $val );
			if ( null === $parsed ) {
				return null;
			}
			$parsed_values[ $direction ] = Size_Prop_Type::make()->generate( $parsed );
		}

		return Border_Width_Prop_Type::make()->generate( $parsed_values );
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

		$direction = $direction_map[ $property ];
		
		return Border_Width_Prop_Type::make()->generate( [
			$direction => Size_Prop_Type::make()->generate( $parsed )
		]);
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
