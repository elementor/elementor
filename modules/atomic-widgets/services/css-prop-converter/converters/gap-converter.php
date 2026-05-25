<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Layout_Direction_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
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

	public function get_supported_properties(): array {
		return self::PROPERTIES;
	}

	public function convert( array $declarations ): array {
		$axes = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$property = $declaration['property'];
			$value = $declaration['value'];

			switch ( $property ) {
				case 'row-gap':
					$parsed = Size_Value_Parser::parse( $value );

					if ( null === $parsed ) {
						$unconverted[] = $this->unconverted(
							$property,
							$value,
							'row-gap value could not be parsed; rendered via custom_css.'
						);
						break;
					}

					$axes['row'] = $parsed;
					break;

				case 'column-gap':
					$parsed = Size_Value_Parser::parse( $value );

					if ( null === $parsed ) {
						$unconverted[] = $this->unconverted(
							$property,
							$value,
							'column-gap value could not be parsed; rendered via custom_css.'
						);
						break;
					}

					$axes['column'] = $parsed;
					break;

				case 'gap':
					$expanded = $this->expand_shorthand( $value );

					if ( null === $expanded ) {
						$unconverted[] = $this->unconverted(
							$property,
							$value,
							'gap shorthand could not be parsed; rendered via custom_css.'
						);
						break;
					}

					$axes = array_merge( $axes, $expanded );
					break;
			}
		}

		if ( empty( $axes ) ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		$value = [];

		if ( isset( $axes['row'] ) ) {
			$value['row'] = Size_Prop_Type::generate( $axes['row'] );
		}

		if ( isset( $axes['column'] ) ) {
			$value['column'] = Size_Prop_Type::generate( $axes['column'] );
		}

		return [
			'props' => [
				'gap' => Layout_Direction_Prop_Type::generate( $value ),
			],
			'unconverted' => $unconverted,
		];
	}

	private function expand_shorthand( string $value ): ?array {
		$parts = preg_split( '/\s+/', trim( $value ) );

		if ( empty( $parts ) || count( $parts ) > 2 ) {
			return null;
		}

		$row = Size_Value_Parser::parse( $parts[0] );

		if ( null === $row ) {
			return null;
		}

		if ( 1 === count( $parts ) ) {
			return [
				'row' => $row,
				'column' => $row,
			];
		}

		$column = Size_Value_Parser::parse( $parts[1] );

		if ( null === $column ) {
			return null;
		}

		return [
			'row' => $row,
			'column' => $column,
		];
	}
}
