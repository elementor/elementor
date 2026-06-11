<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Filter_Value_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for the filter-function lists backed by Array(Css_Filter_Func) (filter/
 * backdrop-filter). One instance per property; the wrapping $$type differs only by key, so it is
 * injected. Delegates the whole value to Filter_Value_Parser; a null parse declines (-> custom_css).
 */
class Filter_Property_Converter extends Property_Converter_Base {
	private string $property;

	private string $type_key;

	public function __construct( string $property, string $type_key ) {
		$this->property = $property;
		$this->type_key = $type_key;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$items = Filter_Value_Parser::parse( $rule['value'] );

		if ( null === $items ) {
			return false;
		}

		$context->set_prop( $this->property, [
			'$$type' => $this->type_key,
			'value' => $items,
		] );

		return true;
	}
}
