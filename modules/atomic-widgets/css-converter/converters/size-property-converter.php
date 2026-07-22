<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Size_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for properties backed by a Size_Prop_Type. One instance per property.
 * Delegates value parsing to Size_Plain_Resolver; a null parse declines (-> custom_css). On success
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

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$parsed = Size_Plain_Resolver::parse( $rule['value'], $this->allow_unitless );

		if ( null === $parsed ) {
			return false;
		}

		$context->set_prop( $this->property, Size_Prop_Type::generate( $parsed ) );

		return true;
	}
}
