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
 * Reusable converter for box shorthands backed by Union(<sides object> | Size): padding/margin
 * (Dimensions) and border-width (Border_Width) all share the four logical sides, differing only by the
 * wrapping object prop type, which is injected. One instance per property. Delegates
 * tokenizing/expansion to Box_Shorthand_Parser; a null parse declines (-> custom_css).
 *
 * A single token emits the Size member (the union accepts it). Two-to-four tokens expand via the CSS
 * box rule and map physical->logical (top=block-start, right=inline-end, bottom=block-end,
 * left=inline-start) into the injected object's PropValue.
 */
class Dimensions_Property_Converter extends Property_Converter_Base {
	private string $property;

	private string $object_prop_type;

	/**
	 * @param string $property         The CSS property this instance owns.
	 * @param string $object_prop_type Object_Prop_Type class used to wrap the four expanded sides.
	 */
	public function __construct( string $property, string $object_prop_type = Dimensions_Prop_Type::class ) {
		$this->property = $property;
		$this->object_prop_type = $object_prop_type;
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

		$context->set_prop( $this->property, ( $this->object_prop_type )::generate( [
			'block-start' => Size_Prop_Type::generate( $top ),
			'inline-end' => Size_Prop_Type::generate( $right ),
			'block-end' => Size_Prop_Type::generate( $bottom ),
			'inline-start' => Size_Prop_Type::generate( $left ),
		] ) );

		return true;
	}
}
