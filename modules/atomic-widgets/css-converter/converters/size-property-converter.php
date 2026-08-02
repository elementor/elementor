<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for properties backed by a Size_Prop_Type. One instance per property.
 * Delegates value parsing to Size_Value_Parser; a null parse declines (-> custom_css). On success
 * it emits the canonical Size PropValue from generate(). $allow_unitless opts a property into
 * keeping unitless multipliers (e.g. line-height: 1.1) instead of declining them.
 */
class Size_Property_Converter extends Property_Converter_Base {
	private string $property;

	private bool $allow_unitless;

	public function __construct( string $property, bool $allow_unitless = false ) {
		$this->property = $property;
		$this->allow_unitless = $allow_unitless;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	protected function get_custom_converter( Conversion_Context $context, array $rule ): ?callable {
		if ( 'opacity' !== $rule['property'] || ! preg_match( '/^-?\d*\.?\d+$/', $rule['value'] ?? '' ) ) {
			return null;
		}

		return function() use ( $context, $rule ) {
			$constrained = max( 0.0, min( (float) $rule['value'], 1.0 ) );
			$size        = round( $constrained * 100, 4 );

			$context->set_prop( 'opacity', Size_Prop_Type::generate( [
				'size' => 0.0 === $size ? 0 : $size,
				'unit' => Size_Constants::UNIT_PERCENT,
			] ) );

			return true;
		};
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$parsed = Size_Value_Parser::parse( $rule['value'], $this->allow_unitless );

		if ( null === $parsed ) {
			return false;
		}

		$context->set_prop( $this->property, Size_Prop_Type::generate( $parsed ) );

		return true;
	}
}
