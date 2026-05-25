<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Flex_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Flex_Converter extends Prop_Converter_Base {

	private const PROPERTIES = [
		'flex',
		'flex-grow',
		'flex-shrink',
		'flex-basis',
	];

	public function get_supported_properties(): array {
		return self::PROPERTIES;
	}

	public function convert( array $declarations ): array {
		$shape = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$property = $declaration['property'];
			$value = trim( $declaration['value'] );

			switch ( $property ) {
				case 'flex':
					$expanded = $this->expand_shorthand( $value );

					if ( null === $expanded ) {
						$unconverted[] = $this->unconverted(
							$property,
							$declaration['value'],
							'flex shorthand value could not be parsed; rendered via custom_css.'
						);
						break;
					}

					$shape = array_merge( $shape, $expanded );
					break;

				case 'flex-grow':
				case 'flex-shrink':
					if ( ! is_numeric( $value ) ) {
						$unconverted[] = $this->unconverted(
							$property,
							$declaration['value'],
							sprintf( '%s expects a number; rendered via custom_css.', $property )
						);
						break;
					}

					$key = 'flex-grow' === $property ? 'flexGrow' : 'flexShrink';
					$shape[ $key ] = Number_Prop_Type::generate( (float) $value );
					break;

				case 'flex-basis':
					$basis = Size_Value_Parser::parse( $value );

					if ( null === $basis ) {
						$unconverted[] = $this->unconverted(
							$property,
							$declaration['value'],
							'flex-basis value could not be parsed; rendered via custom_css.'
						);
						break;
					}

					$shape['flexBasis'] = Size_Prop_Type::generate( $basis );
					break;
			}
		}

		if ( empty( $shape ) ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		return [
			'props' => [
				'flex' => Flex_Prop_Type::generate( $shape ),
			],
			'unconverted' => $unconverted,
		];
	}

	private function expand_shorthand( string $value ): ?array {
		$lower = strtolower( $value );

		if ( 'none' === $lower ) {
			return [
				'flexGrow' => Number_Prop_Type::generate( 0 ),
				'flexShrink' => Number_Prop_Type::generate( 0 ),
				'flexBasis' => Size_Prop_Type::generate( [ 'size' => '', 'unit' => 'auto' ] ),
			];
		}

		if ( 'auto' === $lower ) {
			return [
				'flexGrow' => Number_Prop_Type::generate( 1 ),
				'flexShrink' => Number_Prop_Type::generate( 1 ),
				'flexBasis' => Size_Prop_Type::generate( [ 'size' => '', 'unit' => 'auto' ] ),
			];
		}

		$parts = preg_split( '/\s+/', $value );
		$count = count( $parts );

		if ( 1 === $count ) {
			if ( is_numeric( $parts[0] ) ) {
				return [
					'flexGrow' => Number_Prop_Type::generate( (float) $parts[0] ),
					'flexShrink' => Number_Prop_Type::generate( 1 ),
					'flexBasis' => Size_Prop_Type::generate( [ 'size' => 0, 'unit' => 'px' ] ),
				];
			}

			$basis = Size_Value_Parser::parse( $parts[0] );

			if ( null === $basis ) {
				return null;
			}

			return [
				'flexGrow' => Number_Prop_Type::generate( 1 ),
				'flexShrink' => Number_Prop_Type::generate( 1 ),
				'flexBasis' => Size_Prop_Type::generate( $basis ),
			];
		}

		if ( 2 === $count ) {
			if ( ! is_numeric( $parts[0] ) ) {
				return null;
			}

			if ( is_numeric( $parts[1] ) ) {
				return [
					'flexGrow' => Number_Prop_Type::generate( (float) $parts[0] ),
					'flexShrink' => Number_Prop_Type::generate( (float) $parts[1] ),
					'flexBasis' => Size_Prop_Type::generate( [ 'size' => 0, 'unit' => 'px' ] ),
				];
			}

			$basis = Size_Value_Parser::parse( $parts[1] );

			if ( null === $basis ) {
				return null;
			}

			return [
				'flexGrow' => Number_Prop_Type::generate( (float) $parts[0] ),
				'flexShrink' => Number_Prop_Type::generate( 1 ),
				'flexBasis' => Size_Prop_Type::generate( $basis ),
			];
		}

		if ( 3 === $count ) {
			if ( ! is_numeric( $parts[0] ) || ! is_numeric( $parts[1] ) ) {
				return null;
			}

			$basis = Size_Value_Parser::parse( $parts[2] );

			if ( null === $basis ) {
				return null;
			}

			return [
				'flexGrow' => Number_Prop_Type::generate( (float) $parts[0] ),
				'flexShrink' => Number_Prop_Type::generate( (float) $parts[1] ),
				'flexBasis' => Size_Prop_Type::generate( $basis ),
			];
		}

		return null;
	}
}
