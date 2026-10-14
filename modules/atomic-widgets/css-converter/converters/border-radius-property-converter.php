<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Box_Shorthand_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Border_Radius_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for border-radius (Union(Border_Radius | Size)). One instance per property.
 * Delegates tokenizing/expansion to Box_Shorthand_Parser; a null parse declines (-> custom_css).
 *
 * A single token emits the Size member. Two-to-four tokens expand via the CSS corner rule
 * (top-left/top-right/bottom-right/bottom-left) and map physical->logical (TL=start-start,
 * TR=start-end, BR=end-end, BL=end-start) into a Border_Radius PropValue. Elliptical values (a "/"
 * separating horizontal/vertical radii) cannot be modeled by the single-Size-per-corner shape, so
 * they decline to custom_css — the parser already rejects the "/" form while keeping calc() division
 * (a single paren-wrapped token) convertible.
 */
class Border_Radius_Property_Converter extends Property_Converter_Base {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$parsed = Box_Shorthand_Parser::parse( $rule['value'] );

		if ( null === $parsed ) {
			return false;
		}

		if ( isset( $parsed['single'] ) ) {
			$context->set_prop( $this->property, Size_Prop_Type::generate( $parsed['single'] ) );

			return true;
		}

		[ $top_left, $top_right, $bottom_right, $bottom_left ] = $parsed['sides'];

		$context->set_prop( $this->property, Border_Radius_Prop_Type::generate( [
			'start-start' => Size_Prop_Type::generate( $top_left ),
			'start-end' => Size_Prop_Type::generate( $top_right ),
			'end-end' => Size_Prop_Type::generate( $bottom_right ),
			'end-start' => Size_Prop_Type::generate( $bottom_left ),
		] ) );

		return true;
	}
}
