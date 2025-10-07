<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Margin Property Mapper
 *
 * 🎯 ATOMIC SOURCE: atomic widgets use Dimensions_Prop_Type for margin
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
 *
 * ✅ COMPREHENSIVE COVERAGE:
 * - Physical properties: margin, margin-top, margin-right, margin-bottom, margin-left
 * - Logical properties: margin-block, margin-block-start, margin-block-end
 * - Logical properties: margin-inline, margin-inline-start, margin-inline-end
 * - Shorthand support: 1, 2, 3, 4 values for margin, margin-block, margin-inline
 * - Negative values: margin: -20px; margin-top: -10px;
 * - CSS keywords: auto, inherit, initial, unset, revert, revert-layer
 */
class Margin_Property_Mapper extends Atomic_Property_Mapper_Base {

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

		// ALL margin properties use Dimensions_Prop_Type (original working approach)
		$dimensions_data = $this->parse_margin_property( $property, (string) $value );
		if ( null === $dimensions_data ) {
			return null;
		}
		
		// ✅ ATOMIC-ONLY COMPLIANCE: All properties use Dimensions_Prop_Type
		return Dimensions_Prop_Type::make()->generate( $dimensions_data );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function get_v4_property_name( string $property ): string {
		// All margin properties use 'margin' for atomic widget props
		return 'margin';
	}

	public function get_target_property_name( string $property ): string {
		// Use the same logic as get_v4_property_name
		return $this->get_v4_property_name( $property );
	}

	private function parse_margin_property( string $property, string $value ): ?array {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );

		if ( '' === $value ) {
			return null;
		}

		if ( $this->is_css_keyword( $value ) ) {
			return $this->handle_css_keyword( $value );
		}

		switch ( $property ) {
			case 'margin':
				return $this->parse_shorthand_to_logical_properties( $value );
			
			case 'margin-top':
				return $this->parse_individual_margin( 'block-start', $value );
			
			case 'margin-right':
				return $this->parse_individual_margin( 'inline-end', $value );
			
			case 'margin-bottom':
				return $this->parse_individual_margin( 'block-end', $value );
			
			case 'margin-left':
				return $this->parse_individual_margin( 'inline-start', $value );
			
			case 'margin-block-start':
				return $this->parse_individual_margin( 'block-start', $value );
			
			case 'margin-block-end':
				return $this->parse_individual_margin( 'block-end', $value );
			
			case 'margin-inline-start':
				return $this->parse_individual_margin( 'inline-start', $value );
			
			case 'margin-inline-end':
				return $this->parse_individual_margin( 'inline-end', $value );
			
			case 'margin-block':
				return $this->parse_logical_shorthand( $value, 'block' );
			
			case 'margin-inline':
				return $this->parse_logical_shorthand( $value, 'inline' );
			
			default:
				return null;
		}
	}

	protected function is_css_keyword( string $value ): bool {
		$keywords = ['auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer'];
		return in_array( strtolower( $value ), $keywords, true );
	}

	private function handle_css_keyword( string $value ): array {
		$keyword = strtolower( $value );
		
		$keyword_size = [
			'size' => $keyword,
			'unit' => 'custom'
		];

		$size_prop = $this->create_size_prop( $keyword_size );
		return [
			'block-start' => $size_prop,
			'inline-end' => $size_prop,
			'block-end' => $size_prop,
			'inline-start' => $size_prop,
		];
	}

	protected function parse_shorthand_to_logical_properties( string $value ): ?array {
		$parts = preg_split( '/\s+/', trim( $value ) );
		$parts = array_filter( $parts, function( $part ) {
			return '' !== trim( $part );
		} );
		$parts = array_values( $parts );
		$count = count( $parts );

		if ( $count < 1 || $count > 4 ) {
			return null;
		}

		$dimensions = $this->map_shorthand_to_logical_properties( $parts );
		
		if ( null === $dimensions ) {
			return null;
		}

		$result = [];
		foreach ( $dimensions as $logical_property => $size_data ) {
			if ( null !== $size_data ) {
				$result[ $logical_property ] = $this->create_size_prop( $size_data );
			}
		}
		return $result;
	}

	private function parse_logical_shorthand( string $value, string $axis ): ?array {
		$values = preg_split( '/\s+/', trim( $value ) );
		$count = count( $values );

		if ( $count === 1 ) {
			$parsed = $this->parse_size_value( $values[0] );
			if ( null === $parsed ) {
				return null;
			}
			
			$size_prop = $this->create_size_prop( $parsed );
			return [
				$axis . '-start' => $size_prop,
				$axis . '-end' => $size_prop,
			];
		}

		if ( $count === 2 ) {
			$start = $this->parse_size_value( $values[0] );
			$end = $this->parse_size_value( $values[1] );
			if ( null === $start || null === $end ) {
				return null;
			}
			
			return [
				$axis . '-start' => $this->create_size_prop( $start ),
				$axis . '-end' => $this->create_size_prop( $end ),
			];
		}

		return null;
	}

	private function map_shorthand_to_logical_properties( array $parts ): ?array {
		$count = count( $parts );
		
		switch ( $count ) {
			case 1:
				if ( ! isset( $parts[0] ) ) {
					return null;
				}
				$all = $this->parse_size_value( $parts[0] );
				if ( null === $all ) {
					return null;
				}
				return [
					'block-start' => $all,
					'inline-end' => $all,
					'block-end' => $all,
					'inline-start' => $all,
				];

			case 2:
				if ( ! isset( $parts[0] ) || ! isset( $parts[1] ) ) {
					return null;
				}
				$vertical = $this->parse_size_value( $parts[0] );
				$horizontal = $this->parse_size_value( $parts[1] );
				if ( null === $vertical || null === $horizontal ) {
					return null;
				}
				return [
					'block-start' => $vertical,
					'inline-end' => $horizontal,
					'block-end' => $vertical,
					'inline-start' => $horizontal,
				];

			case 3:
				if ( ! isset( $parts[0] ) || ! isset( $parts[1] ) || ! isset( $parts[2] ) ) {
					return null;
				}
				$top = $this->parse_size_value( $parts[0] );
				$horizontal = $this->parse_size_value( $parts[1] );
				$bottom = $this->parse_size_value( $parts[2] );
				if ( null === $top || null === $horizontal || null === $bottom ) {
					return null;
				}
				return [
					'block-start' => $top,
					'inline-end' => $horizontal,
					'block-end' => $bottom,
					'inline-start' => $horizontal,
				];

			case 4:
				if ( ! isset( $parts[0] ) || ! isset( $parts[1] ) || ! isset( $parts[2] ) || ! isset( $parts[3] ) ) {
					return null;
				}
				$top = $this->parse_size_value( $parts[0] );
				$right = $this->parse_size_value( $parts[1] );
				$bottom = $this->parse_size_value( $parts[2] );
				$left = $this->parse_size_value( $parts[3] );
				if ( null === $top || null === $right || null === $bottom || null === $left ) {
					return null;
				}
				return [
					'block-start' => $top,
					'inline-end' => $right,
					'block-end' => $bottom,
					'inline-start' => $left,
				];

			default:
				return null;
		}
	}

	private function parse_individual_margin( string $logical_side, string $value ): ?array {
		$parsed_size = $this->parse_size_value( $value );
		if ( null === $parsed_size ) {
			return null;
		}

		return [
			$logical_side => $this->create_size_prop( $parsed_size ),
		];
	}



	private function create_size_prop( array $size_value ): array {
		// ✅ MARGIN SCHEMA COMPATIBILITY: Ensure size prop is compatible with margin's unrestricted units
		return Size_Prop_Type::make()->generate( $size_value );
	}

}
