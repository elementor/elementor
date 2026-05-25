<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Size_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Size_Converter extends Prop_Converter_Base {

	private const PHYSICAL_TO_LOGICAL = [
		'top' => 'inset-block-start',
		'right' => 'inset-inline-end',
		'bottom' => 'inset-block-end',
		'left' => 'inset-inline-start',
	];

	private const PROPERTIES = [
		'width',
		'height',
		'min-width',
		'min-height',
		'max-width',
		'max-height',
		'font-size',
		'letter-spacing',
		'word-spacing',
		'line-height',
		'column-gap',
		'row-gap',
		'gap',
		'inset-block-start',
		'inset-inline-end',
		'inset-block-end',
		'inset-inline-start',
		'top',
		'right',
		'bottom',
		'left',
		'outline-width',
		'outline-offset',
		'opacity',
		'scroll-margin-top',
	];

	public function get_supported_properties(): array {
		return self::PROPERTIES;
	}

	public function convert( array $declarations ): array {
		$props = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$property = $declaration['property'];
			$value = $declaration['value'];

			$parsed = $this->parse_value( $property, $value );

			if ( null === $parsed ) {
				$unconverted[] = $this->unconverted(
					$property,
					$value,
					'Value could not be parsed as a size; rendered via custom_css.'
				);
				continue;
			}

			$output_key = self::PHYSICAL_TO_LOGICAL[ $property ] ?? $property;
			$props[ $output_key ] = Size_Prop_Type::generate( $parsed );
		}

		return [
			'props' => $props,
			'unconverted' => $unconverted,
		];
	}

	private function parse_value( string $property, string $value ): ?array {
		if ( 'opacity' === $property ) {
			return Size_Value_Parser::parse_opacity( $value );
		}

		if ( 'line-height' === $property ) {
			return Size_Value_Parser::parse_unitless_as_em( $value );
		}

		return Size_Value_Parser::parse( $value );
	}
}
