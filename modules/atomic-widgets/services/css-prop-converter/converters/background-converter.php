<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Color_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Background_Converter extends Prop_Converter_Base {

	private const PROPERTIES = [
		'background-color',
		'background',
	];

	public function get_supported_properties(): array {
		return self::PROPERTIES;
	}

	public function convert( array $declarations ): array {
		$color = null;
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$property = $declaration['property'];
			$value = trim( $declaration['value'] );

			if ( 'background-color' === $property ) {
				$parsed = Color_Value_Parser::parse( $value );

				if ( null === $parsed ) {
					$unconverted[] = $this->unconverted(
						$property,
						$declaration['value'],
						'background-color value is not a recognized color; rendered via custom_css.'
					);
					continue;
				}

				$color = $parsed;
				continue;
			}

			if ( 'background' === $property ) {
				$parsed = Color_Value_Parser::parse( $value );

				if ( null !== $parsed ) {
					$color = $parsed;
					continue;
				}

				$unconverted[] = $this->unconverted(
					$property,
					$declaration['value'],
					'background shorthand only color-only values are typed; other values rendered via custom_css.'
				);
			}
		}

		if ( null === $color ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		return [
			'props' => [
				'background' => Background_Prop_Type::generate( [
					'color' => Color_Prop_Type::generate( $color ),
				] ),
			],
			'unconverted' => $unconverted,
		];
	}
}
