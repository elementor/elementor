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
			$parsed = $this->parse_declaration( $declaration );

			if ( null === $parsed ) {
				$unconverted[] = $this->unconverted(
					$declaration['property'],
					$declaration['value'],
					$this->failure_hint( $declaration['property'] )
				);
				continue;
			}

			if ( isset( $parsed['color'] ) ) {
				$color = $parsed['color'];
			}

			if ( isset( $parsed['gradient_overlay'] ) ) {
				$gradient_overlay = $parsed['gradient_overlay'];
			}
		}

		return $this->build_result( $color, $gradient_overlay, $unconverted );
	}

	private function parse_declaration( array $declaration ): ?array {
		$value = trim( $declaration['value'] );

		switch ( $declaration['property'] ) {
			case 'background-color':
				return $this->parse_as_color( $value );
			case 'background-image':
				return $this->parse_as_gradient( $value );
			case 'background':
				return $this->parse_shorthand( $value );
		}

		return null;
	}

	private function parse_as_color( string $value ): ?array {
		$parsed = Color_Value_Parser::parse( $value );

		if ( null === $parsed ) {
			return null;
		}

		return [ 'color' => $parsed ];
	}

	private function parse_as_gradient( string $value ): ?array {
		$parsed = Gradient_Value_Parser::parse( $value );

		if ( null === $parsed ) {
			return null;
		}

		return [ 'gradient_overlay' => $parsed ];
	}

	private function parse_shorthand( string $value ): ?array {
		$color = $this->parse_as_color( $value );

		if ( null !== $color ) {
			return $color;
		}

		return $this->parse_as_gradient( $value );
	}

	private function failure_hint( string $property ): string {
		switch ( $property ) {
			case 'background-color':
				return 'background-color value is not a recognized color; rendered via custom_css.';
			case 'background-image':
				return 'background-image only supports linear-gradient and bare radial-gradient with explicit color stops; other values rendered via custom_css.';
			case 'background':
				return 'background shorthand: only solid colors and gradients are typed; other values rendered via custom_css.';
		}

		return '';
	}

	private function build_result( ?string $color, ?array $gradient_overlay, array $unconverted ): array {
		$background_value = $this->build_background_value( $color, $gradient_overlay );

		if ( empty( $background_value ) ) {
			return [
				'props' => [],
				'unconverted' => $unconverted,
			];
		}

		return [
			'props' => [ 'background' => Background_Prop_Type::generate( $background_value ) ],
			'unconverted' => $unconverted,
		];
	}

	private function build_background_value( ?string $color, ?array $gradient_overlay ): array {
		$value = [];

		if ( null !== $color ) {
			$value['color'] = Color_Prop_Type::generate( $color );
		}

		if ( null !== $gradient_overlay ) {
			$value['background-overlay'] = [
				'$$type' => 'background-overlay',
				'value' => [ $gradient_overlay ],
			];
		}

		return $value;
	}
}
