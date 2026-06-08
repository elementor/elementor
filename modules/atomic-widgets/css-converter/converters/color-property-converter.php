<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for properties backed by a Color_Prop_Type. One instance per property.
 * Color_Prop_Type extends String_Prop_Type with no enum/regex, so any non-empty value is valid:
 * named colors, hex, rgb()/hsl(), var(), color-mix(), currentcolor, transparent. Raw passthrough —
 * it only declines on an empty value. Emits the canonical Color PropValue from generate().
 */
class Color_Property_Converter extends Property_Converter_Base {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$color = trim( $rule['value'] );

		if ( '' === $color ) {
			return false;
		}

		$context->set_prop( $this->property, Color_Prop_Type::generate( $color ) );

		return true;
	}
}
