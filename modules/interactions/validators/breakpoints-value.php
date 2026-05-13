<?php

namespace Elementor\Modules\Interactions\Validators;

use Elementor\Modules\Interactions\Validators\String_Value as StringValueValidator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Breakpoints_Value {
	public static function is_valid( $breakpoints_prop_value ) {
		if ( ! is_array( $breakpoints_prop_value ) ) {
			return false;
		}

		if ( ! isset( $breakpoints_prop_value['$$type'] ) || 'interaction-breakpoints' !== $breakpoints_prop_value['$$type'] ) {
			return false;
		}

		if ( ! isset( $breakpoints_prop_value['value'] ) || ! is_array( $breakpoints_prop_value['value'] ) ) {
			return false;
		}

		return self::validate_value( $breakpoints_prop_value['value'] );
	}

	private static function validate_value( $value ) {
		if ( ! is_array( $value ) ) {
			return false;
		}

		if ( ! isset( $value['excluded'] ) || ! is_array( $value['excluded'] ) ) {
			return false;
		}

		return self::validate_excluded( $value['excluded'] );
	}

	private static function validate_excluded( $excluded ) {
		if ( ! is_array( $excluded ) ) {
			return false;
		}

		if ( ! isset( $excluded['$$type'] ) || 'excluded-breakpoints' !== $excluded['$$type'] ) {
			return false;
		}

		if ( ! isset( $excluded['value'] ) || ! is_array( $excluded['value'] ) ) {
			return false;
		}

		return self::validate_excluded_value( $excluded['value'] );
	}

	private static function validate_excluded_value( $value ) {
		if ( ! is_array( $value ) ) {
			return false;
		}

		foreach ( $value as $breakpoint_value ) {
			if ( ! StringValueValidator::is_valid( $breakpoint_value ) ) {
				return false;
			}
		}

		return true;
	}
}
