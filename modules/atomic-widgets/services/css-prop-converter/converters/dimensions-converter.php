<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Border_Width_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Box_Shorthand_Parser;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Uniform_Size_Detector;

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

	private const PAIR_PROPERTIES = [
		'padding-inline' => [ 'padding', 'inline' ],
		'padding-block' => [ 'padding', 'block' ],
		'margin-inline' => [ 'margin', 'inline' ],
		'margin-block' => [ 'margin', 'block' ],
		'border-inline-width' => [ 'border-width', 'inline' ],
		'border-block-width' => [ 'border-width', 'block' ],
	];

	private const PAIR_AXIS_SIDES = [
		'inline' => [ 'inline-start', 'inline-end' ],
		'block' => [ 'block-start', 'block-end' ],
	];

	private const LOGICAL_BOX_KEYS = [ 'block-start', 'inline-end', 'block-end', 'inline-start' ];

	private const KIND_SHORTHAND = 'shorthand';
	private const KIND_LONGHAND = 'longhand';
	private const KIND_PAIR = 'pair';

	private array $property_meta;

	public function __construct() {
		$this->property_meta = $this->build_property_meta();
	}

	public function get_supported_properties(): array {
		return array_keys( $this->property_meta );
	}

	public function convert( array $declarations ): array {
		$buckets = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$parsed = $this->parse_declaration( $declaration );

			if ( null === $parsed ) {
				$unconverted[] = $this->unconverted(
					$declaration['property'],
					$declaration['value'],
					$this->failure_hint( $declaration['property'] )
				);
				continue;
			}

			[ $family, $sides ] = $parsed;
			$buckets[ $family ] = array_merge( $buckets[ $family ] ?? [], $sides );
		}

		return [
			'props' => $this->wrap_buckets( $buckets ),
			'unconverted' => $unconverted,
		];
	}

	private function parse_declaration( array $declaration ): ?array {
		$meta = $this->property_meta[ $declaration['property'] ] ?? null;

		if ( null === $meta ) {
			return null;
		}

		switch ( $meta['kind'] ) {
			case self::KIND_LONGHAND:
				return $this->parse_longhand( $declaration['value'], $meta );
			case self::KIND_SHORTHAND:
				return $this->parse_shorthand( $declaration['value'], $meta );
			case self::KIND_PAIR:
				return $this->parse_pair( $declaration['value'], $meta );
		}

		return null;
	}

	private function parse_longhand( string $value, array $meta ): ?array {
		$size = Size_Value_Parser::parse( $value );

		if ( null === $size ) {
			return null;
		}

		return [ $meta['family'], [ $meta['side'] => $size ] ];
	}

	private function parse_shorthand( string $value, array $meta ): ?array {
		$expanded = Box_Shorthand_Parser::expand_box( $value, self::LOGICAL_BOX_KEYS );

		if ( null === $expanded ) {
			return null;
		}

		return [ $meta['family'], $expanded ];
	}

	private function parse_pair( string $value, array $meta ): ?array {
		$axis_keys = self::PAIR_AXIS_SIDES[ $meta['axis'] ];
		$expanded = Box_Shorthand_Parser::expand_axis( $value, $axis_keys );

		if ( null === $expanded ) {
			return null;
		}

		return [ $meta['family'], $expanded ];
	}

	private function failure_hint( string $property ): string {
		$meta = $this->property_meta[ $property ] ?? null;

		if ( null === $meta ) {
			return 'Property is not a recognized dimensions property; rendered via custom_css.';
		}

		switch ( $meta['kind'] ) {
			case self::KIND_LONGHAND:
				return 'Value could not be parsed as a size; rendered via custom_css.';
			case self::KIND_SHORTHAND:
				return 'Shorthand value could not be parsed; rendered via custom_css.';
			case self::KIND_PAIR:
				return 'Pair-shorthand value could not be parsed; rendered via custom_css.';
		}

		return '';
	}

	private function wrap_buckets( array $buckets ): array {
		$props = [];

		foreach ( $buckets as $family => $sides ) {
			$props[ $family ] = $this->wrap_for_family( $family, $sides );
		}

		return $props;
	}

	private function wrap_for_family( string $family, array $sides ): array {
		$uniform = Uniform_Size_Detector::find( $sides, self::LOGICAL_BOX_KEYS );

		if ( null !== $uniform ) {
			return Size_Prop_Type::generate( $uniform );
		}

		$value = $this->build_sides_value( $sides );

		if ( 'border-width' === $family ) {
			return Border_Width_Prop_Type::generate( $value );
		}

		return Dimensions_Prop_Type::generate( $value );
	}

	private function build_sides_value( array $sides ): array {
		$value = [];

		foreach ( self::LOGICAL_BOX_KEYS as $key ) {
			if ( isset( $sides[ $key ] ) ) {
				$value[ $key ] = Size_Prop_Type::generate( $sides[ $key ] );
			}
		}

		return $value;
	}

	private function build_property_meta(): array {
		$meta = [];

		foreach ( self::FAMILIES as $shorthand => $family ) {
			$meta[ $shorthand ] = [
				'kind' => self::KIND_SHORTHAND,
				'family' => $family,
			];

			foreach ( self::SIDE_TO_LOGICAL as $physical_side => $logical_side ) {
				$meta[ $this->build_longhand( $shorthand, $physical_side ) ] = [
					'kind' => self::KIND_LONGHAND,
					'family' => $family,
					'side' => $logical_side,
				];
			}

			foreach ( self::LOGICAL_SIDES as $logical_side ) {
				$meta[ $this->build_longhand( $shorthand, $logical_side ) ] = [
					'kind' => self::KIND_LONGHAND,
					'family' => $family,
					'side' => $logical_side,
				];
			}
		}

		foreach ( self::PAIR_PROPERTIES as $pair_property => $pair_meta ) {
			[ $family, $axis ] = $pair_meta;

			$meta[ $pair_property ] = [
				'kind' => self::KIND_PAIR,
				'family' => $family,
				'axis' => $axis,
			];
		}

		return $meta;
	}

	private function build_longhand( string $shorthand, string $side ): string {
		if ( 'border-width' === $shorthand ) {
			return 'border-' . $side . '-width';
		}

		return $shorthand . '-' . $side;
	}
}
