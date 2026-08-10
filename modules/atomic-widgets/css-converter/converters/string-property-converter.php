<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Reusable converter for properties backed by a String_Prop_Type (or a subclass with its own
 * `$$type` key, e.g. Font_Family_Prop_Type). One instance per property. When an allowlist is
 * provided the value must be one of it (enum-backed props); otherwise any non-empty value is
 * accepted (free-string props). Emits the canonical PropValue enveloped with the schema's own
 * `$$type` key, sourced from the live schema rather than hardcoded, so subclasses that override
 * get_key() (like Font_Family_Prop_Type) still validate against Props_Parser.
 */
class String_Property_Converter extends Property_Converter_Base {
	private string $property;

	/**
	 * @var string[]|null
	 */
	private ?array $allowed_values;

	private string $type_key;

	/**
	 * @param string        $property       The schema property this converter owns.
	 * @param string[]|null $allowed_values Enum allowlist, or null for a free-string property.
	 * @param string|null   $type_key       The `$$type` key to envelope the value with, sourced from
	 *                                      the schema's prop type (e.g. `font-family`). Defaults to
	 *                                      the plain String_Prop_Type key.
	 */
	public function __construct( string $property, ?array $allowed_values = null, ?string $type_key = null ) {
		$this->property = $property;
		$this->allowed_values = $allowed_values;
		$this->type_key = $type_key ?? String_Prop_Type::get_key();
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	protected function do_convert( Conversion_Context $context, array $rule ): bool {
		$value = trim( $rule['value'] );

		if ( '' === $value ) {
			return false;
		}

		if ( null !== $this->allowed_values && ! in_array( $value, $this->allowed_values, true ) ) {
			return false;
		}

		$context->set_prop( $this->property, [
			'$$type' => $this->type_key,
			'value' => $value,
		] );

		return true;
	}
}
