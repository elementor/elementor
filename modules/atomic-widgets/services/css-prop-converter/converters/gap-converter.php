<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Layout_Direction_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Box_Shorthand_Parser;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Gap_Converter extends Prop_Converter_Base {

	private const PROPERTIES = [
		'gap',
		'row-gap',
		'column-gap',
	];

	private const AXIS_KEYS = [ 'row', 'column' ];

	private const AXIS_BY_PROPERTY = [
		'row-gap' => 'row',
		'column-gap' => 'column',
	];

	public function get_supported_properties(): array {
		return self::PROPERTIES;
	}

	public function convert( array $declarations ): array {
		$axes = [];
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

			$axes = array_merge( $axes, $parsed );
		}

		if ( empty( $axes ) ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		return [
			'props' => [ 'gap' => Layout_Direction_Prop_Type::generate( $this->wrap_axes( $axes ) ) ],
			'unconverted' => $unconverted,
		];
	}

	private function parse_declaration( array $declaration ): ?array {
		if ( 'gap' === $declaration['property'] ) {
			return Box_Shorthand_Parser::expand_axis( $declaration['value'], self::AXIS_KEYS );
		}

		$size = Size_Value_Parser::parse( $declaration['value'] );

		if ( null === $size ) {
			return null;
		}

		return [ self::AXIS_BY_PROPERTY[ $declaration['property'] ] => $size ];
	}

	private function failure_hint( string $property ): string {
		return 'gap' === $property
			? 'gap shorthand could not be parsed; rendered via custom_css.'
			: sprintf( '%s value could not be parsed; rendered via custom_css.', $property );
	}

	private function wrap_axes( array $axes ): array {
		$value = [];

		foreach ( self::AXIS_KEYS as $axis ) {
			if ( isset( $axes[ $axis ] ) ) {
				$value[ $axis ] = Size_Prop_Type::generate( $axes[ $axis ] );
			}
		}

		return $value;
	}
}
