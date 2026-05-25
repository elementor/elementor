<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dimensions_Converter extends Prop_Converter_Base {

	private const SIDE_TO_LOGICAL = [
		'top' => 'block-start',
		'right' => 'inline-end',
		'bottom' => 'block-end',
		'left' => 'inline-start',
	];

	private const LOGICAL_SIDES = [
		'block-start',
		'block-end',
		'inline-start',
		'inline-end',
	];

	private const FAMILIES = [
		'margin' => 'margin',
		'padding' => 'padding',
		'border-width' => 'border-width',
	];

	public function get_supported_properties(): array {
		$properties = array_keys( self::FAMILIES );

		foreach ( self::FAMILIES as $shorthand => $_ ) {
			foreach ( array_keys( self::SIDE_TO_LOGICAL ) as $side ) {
				$properties[] = $this->build_longhand( $shorthand, $side );
			}

			foreach ( self::LOGICAL_SIDES as $logical ) {
				$properties[] = $this->build_longhand( $shorthand, $logical );
			}
		}

		return $properties;
	}

	public function convert( array $declarations ): array {
		$buckets = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$family = $this->resolve_family( $declaration['property'] );

			if ( null === $family ) {
				$unconverted[] = $this->unconverted(
					$declaration['property'],
					$declaration['value'],
					'Property is not a recognized dimensions property; rendered via custom_css.'
				);
				continue;
			}

			$side = $this->resolve_side( $declaration['property'], $family );

			if ( null === $side ) {
				$expanded = $this->expand_shorthand( $declaration['value'] );

				if ( null === $expanded ) {
					$unconverted[] = $this->unconverted(
						$declaration['property'],
						$declaration['value'],
						'Shorthand value could not be parsed; rendered via custom_css.'
					);
					continue;
				}

				foreach ( $expanded as $logical_key => $size_value ) {
					$buckets[ $family ][ $logical_key ] = $size_value;
				}

				continue;
			}

			$parsed = Size_Value_Parser::parse( $declaration['value'] );

			if ( null === $parsed ) {
				$unconverted[] = $this->unconverted(
					$declaration['property'],
					$declaration['value'],
					'Value could not be parsed as a size; rendered via custom_css.'
				);
				continue;
			}

			$buckets[ $family ][ $side ] = $parsed;
		}

		$props = [];

		foreach ( $buckets as $family => $sides ) {
			$props[ $family ] = $this->wrap_for_family( $family, $sides );
		}

		return [
			'props' => $props,
			'unconverted' => $unconverted,
		];
	}

	private function wrap_for_family( string $family, array $sides ): array {
		$value = $this->build_sides_value( $sides );

		if ( 'border-width' === $family ) {
			return Border_Width_Prop_Type::generate( $value );
		}

		return Dimensions_Prop_Type::generate( $value );
	}

	private function resolve_family( string $property ): ?string {
		if ( isset( self::FAMILIES[ $property ] ) ) {
			return self::FAMILIES[ $property ];
		}

		foreach ( self::FAMILIES as $shorthand => $family ) {
			foreach ( array_keys( self::SIDE_TO_LOGICAL ) as $side ) {
				if ( $property === $this->build_longhand( $shorthand, $side ) ) {
					return $family;
				}
			}

			foreach ( self::LOGICAL_SIDES as $logical ) {
				if ( $property === $this->build_longhand( $shorthand, $logical ) ) {
					return $family;
				}
			}
		}

		return null;
	}

	private function resolve_side( string $property, string $family ): ?string {
		if ( $property === $family ) {
			return null;
		}

		foreach ( self::SIDE_TO_LOGICAL as $side => $logical ) {
			if ( $property === $this->build_longhand( $family, $side ) ) {
				return $logical;
			}
		}

		foreach ( self::LOGICAL_SIDES as $logical ) {
			if ( $property === $this->build_longhand( $family, $logical ) ) {
				return $logical;
			}
		}

		return null;
	}

	private function build_longhand( string $shorthand, string $side ): string {
		if ( 'border-width' === $shorthand ) {
			return 'border-' . $side . '-width';
		}

		return $shorthand . '-' . $side;
	}

	private function expand_shorthand( string $value ): ?array {
		$parts = preg_split( '/\s+/', trim( $value ) );

		if ( empty( $parts ) || count( $parts ) > 4 ) {
			return null;
		}

		$parsed = [];

		foreach ( $parts as $part ) {
			$size = Size_Value_Parser::parse( $part );

			if ( null === $size ) {
				return null;
			}

			$parsed[] = $size;
		}

		switch ( count( $parsed ) ) {
			case 1:
				return [
					'block-start' => $parsed[0],
					'inline-end' => $parsed[0],
					'block-end' => $parsed[0],
					'inline-start' => $parsed[0],
				];
			case 2:
				return [
					'block-start' => $parsed[0],
					'inline-end' => $parsed[1],
					'block-end' => $parsed[0],
					'inline-start' => $parsed[1],
				];
			case 3:
				return [
					'block-start' => $parsed[0],
					'inline-end' => $parsed[1],
					'block-end' => $parsed[2],
					'inline-start' => $parsed[1],
				];
			case 4:
				return [
					'block-start' => $parsed[0],
					'inline-end' => $parsed[1],
					'block-end' => $parsed[2],
					'inline-start' => $parsed[3],
				];
		}

		return null;
	}

	private function build_sides_value( array $sides ): array {
		$value = [];

		foreach ( [ 'block-start', 'inline-end', 'block-end', 'inline-start' ] as $key ) {
			if ( isset( $sides[ $key ] ) ) {
				$value[ $key ] = Size_Prop_Type::generate( $sides[ $key ] );
			}
		}

		return $value;
	}
}
