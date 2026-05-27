<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Box_Shorthand_Parser;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Uniform_Size_Detector;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Border_Radius_Converter extends Prop_Converter_Base {

	private const CORNER_LONGHANDS = [
		'border-top-left-radius' => 'start-start',
		'border-top-right-radius' => 'start-end',
		'border-bottom-right-radius' => 'end-end',
		'border-bottom-left-radius' => 'end-start',
		'border-start-start-radius' => 'start-start',
		'border-start-end-radius' => 'start-end',
		'border-end-end-radius' => 'end-end',
		'border-end-start-radius' => 'end-start',
	];

	private const CORNER_KEYS = [ 'start-start', 'start-end', 'end-end', 'end-start' ];

	public function get_supported_properties(): array {
		return array_merge( [ 'border-radius' ], array_keys( self::CORNER_LONGHANDS ) );
	}

	public function convert( array $declarations ): array {
		$corners = [];
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

			$corners = array_merge( $corners, $parsed );
		}

		if ( empty( $corners ) ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		return [
			'props' => [ 'border-radius' => $this->build_radius_shape( $corners ) ],
			'unconverted' => $unconverted,
		];
	}

	private function parse_declaration( array $declaration ): ?array {
		if ( 'border-radius' === $declaration['property'] ) {
			return Box_Shorthand_Parser::expand_box( $declaration['value'], self::CORNER_KEYS );
		}

		$size = Size_Value_Parser::parse( $declaration['value'] );

		if ( null === $size ) {
			return null;
		}

		return [ self::CORNER_LONGHANDS[ $declaration['property'] ] => $size ];
	}

	private function failure_hint( string $property ): string {
		return 'border-radius' === $property
			? 'Shorthand value could not be parsed; rendered via custom_css.'
			: 'Value could not be parsed as a size; rendered via custom_css.';
	}

	private function build_radius_shape( array $corners ): array {
		$uniform = Uniform_Size_Detector::find( $corners, self::CORNER_KEYS );

		if ( null !== $uniform ) {
			return Size_Prop_Type::generate( $uniform );
		}

		return Border_Radius_Prop_Type::generate( $this->wrap_corners( $corners ) );
	}

	private function wrap_corners( array $corners ): array {
		$value = [];

		foreach ( self::CORNER_KEYS as $corner ) {
			if ( isset( $corners[ $corner ] ) ) {
				$value[ $corner ] = Size_Prop_Type::generate( $corners[ $corner ] );
			}
		}

		return $value;
	}
}
