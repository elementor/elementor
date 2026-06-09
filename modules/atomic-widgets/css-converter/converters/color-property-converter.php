<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for properties backed by a Color_Prop_Type. One instance per property.
 * Color_Prop_Type extends String_Prop_Type with no enum/regex, so any non-empty value is valid:
 * named colors, hex, rgb()/hsl(), var(), color-mix(), currentcolor, transparent. Raw passthrough,
 * apart from one guard: the model holds a single color, so a multi-color value (e.g. the per-side
 * `border-color: red green blue`) is declined to custom_css. Multiplicity is detected paren-aware so a
 * single functional color with internal spaces (`rgb(255 0 0)`, `color-mix(in srgb, red, blue)`) stays
 * one token. Emits the canonical Color PropValue from generate().
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

		if ( 1 !== count( Css_Token_Splitter::split_by_whitespace( $color ) ) ) {
			return false;
		}

		$context->set_prop( $this->property, Color_Prop_Type::generate( $color ) );

		return true;
	}
}
