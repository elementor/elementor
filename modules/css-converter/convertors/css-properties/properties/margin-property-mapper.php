<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Parsers\Size_Value_Parser;
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

		return $this->parse_margin_value( $property, $value );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function get_v4_property_name( string $property ): string {
		// ✅ CRITICAL FIX: All individual margin properties should map to "margin" in atomic widgets
		// This ensures the Dimensions_Prop_Type is recognized by the atomic widgets system
		return 'margin';
	}

	public function get_target_property_name( string $property ): string {
		// ✅ CRITICAL FIX: Use the same logic as get_v4_property_name
		// This ensures individual properties like 'margin-left' are stored as 'margin'
		return $this->get_v4_property_name( $property );
	}

	private function parse_margin_value( string $property, $value ): ?array {
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
				return $this->parse_shorthand_margin( $value );
			case 'margin-block':
				return $this->parse_logical_shorthand( $value, 'block' );
			case 'margin-inline':
				return $this->parse_logical_shorthand( $value, 'inline' );
			default:
				return $this->parse_individual_margin( $property, $value );
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

		return $this->create_dimensions_structure([
			'block-start' => $keyword_size,
			'inline-end' => $keyword_size,
			'block-end' => $keyword_size,
			'inline-start' => $keyword_size,
		]);
	}

	private function parse_shorthand_margin( string $value ): ?array {
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

		return $this->create_dimensions_structure( $dimensions );
	}

	private function parse_logical_shorthand( string $value, string $axis ): ?array {
		$parts = preg_split( '/\s+/', trim( $value ) );
		$parts = array_filter( $parts, function( $part ) {
			return '' !== trim( $part );
		} );
		$parts = array_values( $parts );
		$count = count( $parts );

		if ( $count < 1 || $count > 2 ) {
			return null;
		}

		// ✅ SOLUTION: Create proper Dimensions_Prop_Type structure like margin shorthand does
		// This works because Dimensions_Prop_Type DOES have a transformer (proven by margin: 10px working)
		
		$start_value = $this->parse_size_value( $parts[0] );
		$end_value = $count > 1 ? $this->parse_size_value( $parts[1] ) : $start_value;
		
		if ( null === $start_value || null === $end_value ) {
			return null;
		}

		$zero_size = [ 'size' => 0.0, 'unit' => 'px' ];

		if ( 'inline' === $axis ) {
			// margin-inline: 10px 30px -> inline-start: 10px, inline-end: 30px
			return $this->create_dimensions_structure([
				'block-start' => $zero_size,
				'inline-end' => $end_value,    // right
				'block-end' => $zero_size,
				'inline-start' => $start_value, // left
			]);
		}

		if ( 'block' === $axis ) {
			// margin-block: 10px 30px -> block-start: 10px, block-end: 30px
			return $this->create_dimensions_structure([
				'block-start' => $start_value,  // top
				'inline-end' => $zero_size,
				'block-end' => $end_value,      // bottom
				'inline-start' => $zero_size,
			]);
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

	private function parse_individual_margin( string $property, string $value ): ?array {
		$size_data = $this->parse_size_value( $value );
		if ( null === $size_data ) {
			return null;
		}

		$logical_direction = $this->map_physical_to_logical( $property );
		
		// ✅ EDITOR PATTERN MATCH: Use sparse dimensions with nulls like the working editor example
		// The editor creates: {"block-start": null, "block-end": {...}, "inline-start": null, "inline-end": {...}}
		$dimensions = [
			'block-start' => $logical_direction === 'block-start' ? $size_data : null,
			'block-end' => $logical_direction === 'block-end' ? $size_data : null,
			'inline-start' => $logical_direction === 'inline-start' ? $size_data : null,
			'inline-end' => $logical_direction === 'inline-end' ? $size_data : null,
		];
		
		return $this->create_dimensions_structure( $dimensions );
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

	private function create_dimensions_structure( array $dimensions ): array {
		$result = [];
		
		foreach ( $dimensions as $logical_property => $size_data ) {
			// ✅ EDITOR PATTERN MATCH: Include null values like the working editor example
			// The editor structure includes: "block-start": null, "inline-start": null
			if ( null !== $size_data ) {
				$result[ $logical_property ] = $this->create_size_prop( $size_data );
			} else {
				$result[ $logical_property ] = null;
			}
		}

		return Dimensions_Prop_Type::make()->generate( $result );
	}

	private function create_size_prop( array $size_value ): array {
		return Size_Prop_Type::make()->generate( $size_value );
	}

	protected function parse_size_value( string $value ): ?array {
		$parsed = Size_Value_Parser::parse( $value );
		
		if ( null !== $parsed ) {
			return $parsed;
		}
		
		return Size_Value_Parser::create_zero();
	}
}