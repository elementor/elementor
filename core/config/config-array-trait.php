<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

trait Config_Array_Trait {

	public static function get_default() {
		return [];
	}

	public static function get_sub_option( $key ) {
		$parent_value = static::get_value();

		return $parent_value[ $key ] ?? null;
	}

	/**
	 * @throws \Exception
	 */
	public static function set_sub_option( $key, $value ) {
		$parent_value = static::get_value();

		if ( ! is_array( $parent_value ) ) {
			throw new \Exception( 'Invalid parent option: ' . var_export( $parent_value, 1 ) );
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
