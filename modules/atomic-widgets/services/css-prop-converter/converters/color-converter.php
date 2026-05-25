<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Prop_Converter_Base;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\ValueParsers\Color_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Converter extends Prop_Converter_Base {

	private const PROPERTIES = [
		'color',
		'border-color',
		'outline-color',
	];

	public function get_supported_properties(): array {
		return self::PROPERTIES;
	}

	public function convert( array $declarations ): array {
		$props = [];
		$unconverted = [];

		foreach ( $declarations as $declaration ) {
			$parsed = Color_Value_Parser::parse( $declaration['value'] );

			if ( null === $parsed ) {
				$unconverted[] = $this->unconverted(
					$declaration['property'],
					$declaration['value'],
					'Value is not a recognized color literal; rendered via custom_css.'
				);
				continue;
			}

			$props[ $declaration['property'] ] = Color_Prop_Type::generate( $parsed );
		}

		return [
			'props' => $props,
			'unconverted' => $unconverted,
		];
	}
}
