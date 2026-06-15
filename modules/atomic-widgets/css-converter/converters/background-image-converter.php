<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Background_Image_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Overlay_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converter for `background-image`. Delegates parsing to Background_Image_Value_Parser which returns
 * fully-constructed overlay PropValues (image overlays for url(), gradient overlays for linear/radial-
 * gradient()). The resulting ordered list is stored as `background-overlay` in the `background`
 * aggregate context object, preserving any existing scalar fields (color, clip).
 *
 * Sibling background longhands processed afterwards (background-repeat, background-size, etc.) read
 * and update the image-overlay items via Background_Layer_Field_Converter.
 */
class Background_Image_Converter extends Property_Converter_Base {
	protected function get_supported_properties(): array {
		return [ 'background-image' ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$overlays = Background_Image_Value_Parser::parse( trim( $rule['value'] ) );

		if ( null === $overlays ) {
			return false;
		}

		$fields = $this->current_background_fields( $context->get_prop( 'background' ) );
		$fields['background-overlay'] = Background_Overlay_Prop_Type::generate( $overlays );

		$context->set_prop( 'background', Background_Prop_Type::generate( $fields ) );

		return true;
	}

	private function current_background_fields( $existing ): array {
		if ( ! is_array( $existing ) ) {
			return [];
		}

		$type = $existing['$$type'] ?? null;

		if ( Background_Prop_Type::get_key() === $type && is_array( $existing['value'] ?? null ) ) {
			return $existing['value'];
		}

		return [];
	}
}
