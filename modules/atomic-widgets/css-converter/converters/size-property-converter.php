<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for properties backed by a Size_Prop_Type. One instance per property.
 * Delegates value parsing to Size_Value_Parser; a null parse declines (-> custom_css). On success
 * it emits the canonical Size PropValue from generate().
 */
class Size_Property_Converter extends Property_Converter_Base {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$parsed = Size_Value_Parser::parse( $rule['value'] );

		if ( null === $parsed ) {
			return false;
		}

		$context->set_prop( $this->property, Size_Prop_Type::generate( $parsed ) );

		return true;
	}
}
