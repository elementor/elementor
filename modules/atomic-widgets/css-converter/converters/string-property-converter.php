<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for properties backed by a plain String_Prop_Type. One instance per property.
 * When an allowlist is provided the value must be one of it (enum-backed props); otherwise any
 * non-empty value is accepted (free-string props). Emits the canonical PropValue from generate().
 */
class String_Property_Converter extends Property_Converter_Base {
	private string $property;

	/**
	 * @var string[]|null
	 */
	private ?array $allowed_values;

	/**
	 * @param string        $property       The schema property this converter owns.
	 * @param string[]|null $allowed_values Enum allowlist, or null for a free-string property.
	 */
	public function __construct( string $property, ?array $allowed_values = null ) {
		$this->property = $property;
		$this->allowed_values = $allowed_values;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$value = trim( $rule['value'] );

		if ( '' === $value ) {
			return false;
		}

		if ( null !== $this->allowed_values && ! in_array( $value, $this->allowed_values, true ) ) {
			return false;
		}

		$context->set_prop( $this->property, String_Prop_Type::generate( $value ) );

		return true;
	}
}
