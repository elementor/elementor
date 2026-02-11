<?php

namespace Elementor\Modules\Interactions\Validators;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Custom_Effect_Value {
	public static function is_valid( $prop_value ) {
		if ( ! is_array( $prop_value ) ) {
			return false;
		}

		if ( ! isset( $prop_value['$$type'] ) || 'custom-effect' !== $prop_value['$$type'] ) {
			return false;
		}

		if ( ! isset( $prop_value['value'] ) || ! is_array( $prop_value['value'] ) ) {
			return false;
		}

		$value = $prop_value['value'];

		if ( isset( $value['from'] ) && ! self::is_valid_custom_effect_properties( $value['from'] ) ) {
			return false;
		}

		if ( isset( $value['to'] ) && ! self::is_valid_custom_effect_properties( $value['to'] ) ) {
			return false;
		}

		return true;
	}

	private static function is_valid_custom_effect_properties( $prop_value ) {
		if ( ! is_array( $prop_value ) ) {
			return false;
		}

		if ( ! isset( $prop_value['$$type'] ) || 'custom-effect-properties' !== $prop_value['$$type'] ) {
			return false;
		}

		if ( ! isset( $prop_value['value'] ) || ! is_array( $prop_value['value'] ) ) {
			return false;
		}

		$value = $prop_value['value'];

		if ( isset( $value['opacity'] ) && ! self::is_valid_number_prop( $value['opacity'] ) ) {
			return false;
		}

		$dimension_keys = [ 'scale', 'move', 'rotate', 'skew' ];
		foreach ( $dimension_keys as $key ) {
			if ( isset( $value[ $key ] ) && ! self::is_valid_movement_dimensions( $value[ $key ] ) ) {
				return false;
			}
		}

		return true;
	}

	private static function is_valid_movement_dimensions( $prop_value ) {
		if ( ! is_array( $prop_value ) ) {
			return false;
		}

		if ( ! isset( $prop_value['$$type'] ) || 'movement-dimensions' !== $prop_value['$$type'] ) {
			return false;
		}

		if ( ! isset( $prop_value['value'] ) || ! is_array( $prop_value['value'] ) ) {
			return false;
		}

		$value = $prop_value['value'];

		if ( isset( $value['x'] ) && ! self::is_valid_number_prop( $value['x'] ) ) {
			return false;
		}
		if ( isset( $value['y'] ) && ! self::is_valid_number_prop( $value['y'] ) ) {
			return false;
		}
		if ( isset( $value['z'] ) && ! self::is_valid_number_prop( $value['z'] ) ) {
			return false;
		}

		return true;
	}

	private static function is_valid_number_prop( $prop_value ) {
		if ( ! is_array( $prop_value ) ) {
			return false;
		}

		if ( ! isset( $prop_value['$$type'] ) || 'number' !== $prop_value['$$type'] ) {
			return false;
		}

		if ( ! array_key_exists( 'value', $prop_value ) || ! is_numeric( $prop_value['value'] ) ) {
			return false;
		}

		return true;
	}
}
