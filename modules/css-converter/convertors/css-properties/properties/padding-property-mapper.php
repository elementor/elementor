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
 * Padding Property Mapper
 *
 * 🎯 ATOMIC SOURCE VERIFICATION:
 * - Atomic Widget: style-schema.php uses Dimensions_Prop_Type for padding
 * - Prop Type: /atomic-widgets/prop-types/dimensions-prop-type.php
 * - Expected Structure: {
 *   "$$type": "dimensions",
 *   "value": {
 *     "block-start": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
 *     "inline-end": {"$$type": "size", "value": {"size": 20, "unit": "px"}},
 *     "block-end": {"$$type": "size", "value": {"size": 10, "unit": "px"}},
 *     "inline-start": {"$$type": "size", "value": {"size": 20, "unit": "px"}}
 *   }
 * }
 *
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
 *
 * Requirements:
 * - Uses logical properties (block-start, inline-end, block-end, inline-start)
 * - Each dimension value must be Size_Prop_Type structure
 * - Supports CSS shorthand: 1, 2, 3, 4 value syntax
 * - Handles edge cases: auto, inherit, initial, unset
 */
class Padding_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [ 'padding' ];

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function supports_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->supports_property( $property ) ) {
			return null;
		}

		$parsed_dimensions = $this->parse_padding_dimensions( $value );
		if ( null === $parsed_dimensions ) {
			return null;
		}

		return Dimensions_Prop_Type::make()->generate( $parsed_dimensions );
	}private function parse_padding_dimensions( $value ): ?array {
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

		$parts = preg_split( '/\s+/', $value );
		$parts = array_filter( $parts );

		if ( empty( $parts ) ) {
			return null;
		}

		$dimensions = $this->map_shorthand_to_logical_properties( $parts );

		if ( null === $dimensions ) {
			return null;
		}

		return $this->create_dimensions_structure( $dimensions );
	}

	protected function is_css_keyword( string $value ): bool {
		$keywords = [ 'auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer' ];
		return in_array( strtolower( $value ), $keywords, true );
	}

	private function is_valid_parsed_size( array $parsed_size ): bool {
		return isset( $parsed_size['size'] ) && isset( $parsed_size['unit'] );
	}

	private function handle_css_keyword( string $value ): ?array {
		$keyword = strtolower( $value );

		$keyword_size = [
			'size' => $keyword,
			'unit' => 'custom',
		];

		return [
			'block-start' => $keyword_size,
			'inline-end' => $keyword_size,
			'block-end' => $keyword_size,
			'inline-start' => $keyword_size,
		];
	}

	private function map_shorthand_to_logical_properties( array $parts ): ?array {
		$count = count( $parts );

		switch ( $count ) {
			case 1:
				$all = $this->parse_size_value( $parts[0] );
				return [
					'block-start' => $all,
					'inline-end' => $all,
					'block-end' => $all,
					'inline-start' => $all,
				];

			case 2:
				$vertical = $this->parse_size_value( $parts[0] );
				$horizontal = $this->parse_size_value( $parts[1] );
				return [
					'block-start' => $vertical,
					'inline-end' => $horizontal,
					'block-end' => $vertical,
					'inline-start' => $horizontal,
				];

			case 3:
				$top = $this->parse_size_value( $parts[0] );
				$horizontal = $this->parse_size_value( $parts[1] );
				$bottom = $this->parse_size_value( $parts[2] );
				return [
					'block-start' => $top,
					'inline-end' => $horizontal,
					'block-end' => $bottom,
					'inline-start' => $horizontal,
				];

			case 4:
				$top = $this->parse_size_value( $parts[0] );
				$right = $this->parse_size_value( $parts[1] );
				$bottom = $this->parse_size_value( $parts[2] );
				$left = $this->parse_size_value( $parts[3] );
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

	private function create_dimensions_structure( array $dimensions ): array {
		$result = [];

		foreach ( $dimensions as $logical_property => $size_data ) {
			$result[ $logical_property ] = Size_Prop_Type::make()->generate( $size_data );
		}

		return $result;
	}

	protected function parse_size_value( string $value ): array {
		$parsed = Size_Value_Parser::parse( $value );

		if ( null !== $parsed ) {
			return $parsed;
		}

		return Size_Value_Parser::create_zero();
	}
}
