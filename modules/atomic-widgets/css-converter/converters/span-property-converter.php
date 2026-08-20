<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Span_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for properties backed by a Span_Prop_Type (grid-column/grid-row). One instance
 * per property. Accepts any non-empty string that matches the schema regex (URLs/semicolons are
 * rejected by the live grid-* pattern); a non-matching value declines (-> custom_css). Emits the
 * canonical Span PropValue from generate().
 */
class Span_Property_Converter extends Property_Converter_Base {
	private string $property;

	private ?string $pattern;

	/**
	 * @param string      $property The schema property this converter owns.
	 * @param string|null $pattern  The Span regex sourced from the schema, or null for no constraint.
	 */
	public function __construct( string $property, ?string $pattern = null ) {
		$this->property = $property;
		$this->pattern = $pattern;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$value = trim( $rule['value'] );

		if ( '' === $value ) {
			return false;
		}

		if ( null !== $this->pattern && 1 !== preg_match( $this->pattern, $value ) ) {
			return false;
		}

		$context->set_prop( $this->property, Span_Prop_Type::generate( $value ) );

		return true;
	}
}
