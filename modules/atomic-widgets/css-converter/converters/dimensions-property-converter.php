<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Box_Shorthand_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for the box shorthands backed by Union(Dimensions | Size) (padding/margin). One
 * instance per property. Delegates tokenizing/expansion to Box_Shorthand_Parser; a null parse declines
 * (-> custom_css).
 *
 * A single token emits the Size member (the union accepts it). Two-to-four tokens expand via the CSS
 * box rule and map physical->logical (top=block-start, right=inline-end, bottom=block-end,
 * left=inline-start) into a Dimensions PropValue.
 */
class Dimensions_Property_Converter extends Property_Converter_Base {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$parsed = Box_Shorthand_Parser::parse( $rule['value'] );

		if ( null === $parsed ) {
			return false;
		}

		if ( isset( $parsed['single'] ) ) {
			$context->set_prop( $this->property, Size_Prop_Type::generate( $parsed['single'] ) );

			return true;
		}

		[ $top, $right, $bottom, $left ] = $parsed['sides'];

		$context->set_prop( $this->property, Dimensions_Prop_Type::generate( [
			'block-start' => Size_Prop_Type::generate( $top ),
			'inline-end' => Size_Prop_Type::generate( $right ),
			'block-end' => Size_Prop_Type::generate( $bottom ),
			'inline-start' => Size_Prop_Type::generate( $left ),
		] ) );

		return true;
	}
}
