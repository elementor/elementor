<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for properties backed by a Number_Prop_Type. One instance per property.
 * Accepts only a strict numeric value (no units, no functions); anything else declines (-> custom_css).
 * Emits the canonical Number PropValue from generate().
 */
class Number_Property_Converter extends Property_Converter_Base {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$value = trim( $rule['value'] );

		if ( ! is_numeric( $value ) ) {
			return false;
		}

		$context->set_prop( $this->property, Number_Prop_Type::generate( $value + 0 ) );

		return true;
	}
}
