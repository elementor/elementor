<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

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

		return Dimensions_Prop_Type::make()->generate( $dimensions_data );
	}

	public function get_v4_property_name( string $property ): string {
		return 'padding';
	}

	public function get_target_property_name( string $property ): string {
		return $this->get_v4_property_name( $property );
	}

	private function is_individual_directional_property( string $property ): bool {
		$individual_properties = [
			'padding-top',
			'padding-right',
			'padding-bottom',
			'padding-left',
			'padding-block-start',
			'padding-block-end',
			'padding-inline-start',
			'padding-inline-end',
		];

		return in_array( $property, $individual_properties, true );
	}

	private function parse_individual_size_property( string $property, string $value ): ?array {
		return $this->parse_size_value( $value );
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
			'block-start' => 'block-start' === $logical_side ? $this->create_size_prop( $parsed_size ) : null,
			'block-end' => 'block-end' === $logical_side ? $this->create_size_prop( $parsed_size ) : null,
			'inline-start' => 'inline-start' === $logical_side ? $this->create_size_prop( $parsed_size ) : null,
			'inline-end' => 'inline-end' === $logical_side ? $this->create_size_prop( $parsed_size ) : null,
		];
	}

	private function create_size_prop( array $size_value ): array {
		return Size_Prop_Type::make()->generate( $size_value );
	}

	protected function parse_shorthand_to_logical_properties( string $value ): ?array {
		$values = preg_split( '/\s+/', trim( $value ) );
		$count = count( $values );

		switch ( $count ) {
			case 1:
				$parsed = $this->parse_size_value( $values[0] );
				if ( null === $parsed ) {
					return $this->handle_unparseable_shorthand();
				}
				$size_prop = $this->create_size_prop( $parsed );
				return [
					'block-start' => $size_prop,
					'inline-end' => $size_prop,
					'block-end' => $size_prop,
					'inline-start' => $size_prop,
				];

			case 2:
				$vertical = $this->parse_size_value( $values[0] );
				$horizontal = $this->parse_size_value( $values[1] );
				if ( null === $vertical || null === $horizontal ) {
					return $this->handle_unparseable_shorthand();
				}
				return [
					'block-start' => $this->create_size_prop( $vertical ),
					'inline-end' => $this->create_size_prop( $horizontal ),
					'block-end' => $this->create_size_prop( $vertical ),
					'inline-start' => $this->create_size_prop( $horizontal ),
				];

			case 3:
				$top = $this->parse_size_value( $values[0] );
				$horizontal = $this->parse_size_value( $values[1] );
				$bottom = $this->parse_size_value( $values[2] );
				if ( null === $top || null === $horizontal || null === $bottom ) {
					return $this->handle_unparseable_shorthand();
				}
				return [
					'block-start' => $this->create_size_prop( $top ),
					'inline-end' => $this->create_size_prop( $horizontal ),
					'block-end' => $this->create_size_prop( $bottom ),
					'inline-start' => $this->create_size_prop( $horizontal ),
				];

			case 4:
				$block_start = $this->parse_size_value( $values[0] );
				$inline_end = $this->parse_size_value( $values[1] );
				$block_end = $this->parse_size_value( $values[2] );
				$inline_start = $this->parse_size_value( $values[3] );
				if ( null === $block_start || null === $inline_end || null === $block_end || null === $inline_start ) {
					return $this->handle_unparseable_shorthand();
				}
				return [
					'block-start' => $this->create_size_prop( $block_start ),
					'inline-end' => $this->create_size_prop( $inline_end ),
					'block-end' => $this->create_size_prop( $block_end ),
					'inline-start' => $this->create_size_prop( $inline_start ),
				];

			default:
				return $this->handle_invalid_shorthand();
		}
	}

	private function parse_logical_shorthand( string $value, string $axis ): ?array {
		$values = preg_split( '/\s+/', trim( $value ) );
		$count = count( $values );

		if ( 1 === $count ) {
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

		if ( 2 === $count ) {
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
}
