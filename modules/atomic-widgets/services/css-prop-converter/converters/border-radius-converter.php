<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Border_Radius_Converter extends Prop_Converter_Base {

	private const CORNER_LONGHANDS = [
		'border-top-left-radius' => 'start-start',
		'border-top-right-radius' => 'start-end',
		'border-bottom-right-radius' => 'end-end',
		'border-bottom-left-radius' => 'end-start',
	];

	public function get_supported_properties(): array {
		return array_merge( [ 'border-radius' ], array_keys( self::CORNER_LONGHANDS ) );
	}

	public function convert( array $declarations ): array {
		$corners = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$property = $declaration['property'];
			$value = $declaration['value'];

			if ( 'border-radius' === $property ) {
				$expanded = $this->expand_shorthand( $value );

				if ( null === $expanded ) {
					$unconverted[] = $this->unconverted(
						$property,
						$value,
						'Shorthand value could not be parsed; rendered via custom_css.'
					);
					continue;
				}

				foreach ( $expanded as $corner => $size_value ) {
					$corners[ $corner ] = $size_value;
				}

				continue;
			}

			$parsed = Size_Value_Parser::parse( $value );

			if ( null === $parsed ) {
				$unconverted[] = $this->unconverted(
					$property,
					$value,
					'Value could not be parsed as a size; rendered via custom_css.'
				);
				continue;
			}

			$corners[ self::CORNER_LONGHANDS[ $property ] ] = $parsed;
		}

		if ( empty( $corners ) ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		$value = [];

		foreach ( [ 'start-start', 'start-end', 'end-end', 'end-start' ] as $corner ) {
			if ( isset( $corners[ $corner ] ) ) {
				$value[ $corner ] = Size_Prop_Type::generate( $corners[ $corner ] );
			}
		}

		return [
			'props' => [
				'border-radius' => Border_Radius_Prop_Type::generate( $value ),
			],
			'unconverted' => $unconverted,
		];
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
					'start-start' => $parsed[0],
					'start-end' => $parsed[0],
					'end-end' => $parsed[0],
					'end-start' => $parsed[0],
				];
			case 2:
				return [
					'start-start' => $parsed[0],
					'start-end' => $parsed[1],
					'end-end' => $parsed[0],
					'end-start' => $parsed[1],
				];
			case 3:
				return [
					'start-start' => $parsed[0],
					'start-end' => $parsed[1],
					'end-end' => $parsed[2],
					'end-start' => $parsed[1],
				];
			case 4:
				return [
					'start-start' => $parsed[0],
					'start-end' => $parsed[1],
					'end-end' => $parsed[2],
					'end-start' => $parsed[3],
				];
		}

		return null;
	}
}
