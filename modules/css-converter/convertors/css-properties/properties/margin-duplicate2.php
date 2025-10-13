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

		// ✅ PADDING PATTERN: All margin properties use Dimensions_Prop_Type like padding
		// This follows Pattern 2: unified atomic property with directional values
		$dimensions_data = $this->parse_margin_value( $property, $value );
		if ( null === $dimensions_data ) {
			return null;
		}

		return Dimensions_Prop_Type::make()->generate( $dimensions_data );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function get_v4_property_name( string $property ): string {
		// ✅ PADDING PATTERN: All margin properties map to unified 'margin' atomic property
		// This follows Pattern 2: unified atomic property with directional values
		return 'margin';
	}

	private function is_individual_property( string $property ): bool {
		$individual_properties = [
			'margin-top',
			'margin-right',
			'margin-bottom',
			'margin-left',
			'margin-block-start',
			'margin-block-end',
			'margin-inline-start',
			'margin-inline-end',
		];

		return in_array( $property, $individual_properties, true );
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
		$keywords = [ 'auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer' ];
		return in_array( strtolower( $value ), $keywords, true );
	}

	private function handle_css_keyword( string $value ): array {
		$keyword = strtolower( $value );

		$keyword_size = [
			'size' => $keyword,
			'unit' => 'custom',
		];

		$size_prop = $this->create_size_prop( $keyword_size );
		return [
			'block-start' => $size_prop,
			'inline-end' => $size_prop,
			'block-end' => $size_prop,
			'inline-start' => $size_prop,
		];
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

		$result = [];
		foreach ( $dimensions as $logical_property => $size_data ) {
			if ( null !== $size_data ) {
				$result[ $logical_property ] = $this->create_size_prop( $size_data );
			}
		}
		return $result;
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

		$zero_size = [
			'size' => 0.0,
			'unit' => 'px',
		];

		if ( 'inline' === $axis ) {
			// margin-inline: 10px 30px -> inline-start: 10px, inline-end: 30px
			return [
				'inline-end' => $this->create_size_prop( $end_value ),    // right
				'inline-start' => $this->create_size_prop( $start_value ), // left
			];
		}

		if ( 'block' === $axis ) {
			// margin-block: 10px 30px -> block-start: 10px, block-end: 30px
			return [
				'block-start' => $this->create_size_prop( $start_value ),  // top
				'block-end' => $this->create_size_prop( $end_value ),      // bottom
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

	private function parse_individual_margin( string $property, string $value ): ?array {
		$parsed_size = $this->parse_size_value( $value );
		if ( null === $parsed_size ) {
			return null;
		}

		$logical_direction = $this->map_physical_to_logical( $property );

		// ✅ PADDING MAPPER PATTERN: Return sparse array like padding does
		// This matches the exact pattern used by the working padding mapper
		return [
			$logical_direction => $this->create_size_prop( $parsed_size ),
		];
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


	private function create_size_prop( array $size_value ): array {
		return Size_Prop_Type::make()->generate( $size_value );
	}

	protected function parse_size_value( string $value ): ?array {
		$value = trim( $value );

		if ( '' === $value ) {
			return [
				'size' => 0.0,
				'unit' => 'px',
			];
		}

		if ( $this->is_css_keyword( $value ) ) {
			return [
				'size' => $value,
				'unit' => 'custom',
			];
		}

		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = $matches[2] ?? 'px';

			return [
				'size' => $size,
				'unit' => strtolower( $unit ),
			];
		}

		if ( '0' === $value ) {
			return [
				'size' => 0.0,
				'unit' => 'px',
			];
		}

		// Fallback for invalid values
		return [
			'size' => 0.0,
			'unit' => 'px',
		];
	}
}
