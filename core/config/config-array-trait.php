<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

trait Config_Array_Trait {
	public static function get_sub_option( $key ) {
		$parent_value = static::get_value();

		return $parent_value[$key] ?? null;
	}

	public static function set_sub_option( $key, $value ) {
		$parent_value = static::get_value();
		if ( ! is_array( $parent_value ) ) {
			throw new \Error( 'Parent option is not an array' );
		}

		$parent_value[ $key ] = $value;

		return static::set( $parent_value );
	}

	public static function delete_sub_option( $key ) {
		$parent_value = static::get_value();
		unset( $parent_value[ $key ] );

		return static::set( $parent_value );
	}
}
