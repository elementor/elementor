<?php

namespace Elementor\Modules\Interactions\Validators;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class String_Value {
	public static function is_valid( $prop_value, $allowed_values = null ) {
		if ( ! is_array( $prop_value ) ) {
			return false;
		}

		if ( ! isset( $prop_value['$$type'] ) || 'string' !== $prop_value['$$type'] ) {
			return false;
		}

		if ( ! isset( $prop_value['value'] ) || ! is_string( $prop_value['value'] ) ) {
			return false;
		}

		if ( null !== $allowed_values && ! in_array( $prop_value['value'], $allowed_values, true ) ) {
			return false;
		}

		return true;
	}
}
