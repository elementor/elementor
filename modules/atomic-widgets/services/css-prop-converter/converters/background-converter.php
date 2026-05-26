<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Color_Value_Parser;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Gradient_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Background_Converter extends Prop_Converter_Base {

	private const PROPERTIES = [
		'background-color',
		'background-image',
		'background',
	];

	public function get_supported_properties(): array {
		return self::PROPERTIES;
	}

	public function convert( array $declarations ): array {
		$color = null;
		$gradient_overlay = null;
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

			if ( 'background-image' === $property ) {
				$parsed = Gradient_Value_Parser::parse( $value );

				if ( null === $parsed ) {
					$unconverted[] = $this->unconverted(
						$property,
						$declaration['value'],
						'background-image only supports linear-gradient and bare radial-gradient with explicit color stops; other values rendered via custom_css.'
					);
					continue;
				}

				$gradient_overlay = $parsed;
				continue;
			}

			if ( 'background' === $property ) {
				$parsed_color = Color_Value_Parser::parse( $value );

				if ( null !== $parsed_color ) {
					$color = $parsed_color;
					continue;
				}

				$parsed_gradient = Gradient_Value_Parser::parse( $value );

				if ( null !== $parsed_gradient ) {
					$gradient_overlay = $parsed_gradient;
					continue;
				}

				$unconverted[] = $this->unconverted(
					$property,
					$declaration['value'],
					'background shorthand: only solid colors and gradients are typed; other values rendered via custom_css.'
				);
			}
		}

		$background_value = [];

		if ( null !== $color ) {
			$background_value['color'] = Color_Prop_Type::generate( $color );
		}

		if ( null !== $gradient_overlay ) {
			$background_value['background-overlay'] = [
				'$$type' => 'background-overlay',
				'value' => [ $gradient_overlay ],
			];
		}

		if ( empty( $background_value ) ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		return [
			'props' => [
				'background' => Background_Prop_Type::generate( $background_value ),
			],
			'unconverted' => $unconverted,
		];
	}
}
