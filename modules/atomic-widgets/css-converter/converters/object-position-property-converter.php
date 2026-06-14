<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Css_Token_Splitter;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Position_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for `object-position`: Union(String enum | Position_Prop_Type{x, y}).
 *
 * Named keyword pairs (e.g. `center left`) emit a String PropValue validated against the enum.
 * Two size tokens (e.g. `50% 30%`, `10px 20px`) emit a Position_Prop_Type PropValue.
 * Anything else declines to custom_css.
 */
class Object_Position_Property_Converter extends Property_Converter_Base {
	protected function get_supported_properties(): array {
		return [ 'object-position' ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$value = trim( $rule['value'] );

		if ( in_array( $value, Position_Prop_Type::get_position_enum_values(), true ) ) {
			$context->set_prop( 'object-position', String_Prop_Type::generate( $value ) );
			return true;
		}

		return $this->try_size_pair( $context, $value );
	}

	private function try_size_pair( Conversion_Context $context, string $value ): bool {
		$tokens = Css_Token_Splitter::split_by_whitespace( $value );

		if ( 2 !== count( $tokens ) ) {
			return false;
		}

		$x = Size_Value_Parser::parse( $tokens[0] );
		$y = Size_Value_Parser::parse( $tokens[1] );

		if ( null === $x || null === $y ) {
			return false;
		}

		$context->set_prop( 'object-position', Position_Prop_Type::generate( [
			'x' => Size_Prop_Type::generate( $x ),
			'y' => Size_Prop_Type::generate( $y ),
		] ) );

		return true;
	}
}
