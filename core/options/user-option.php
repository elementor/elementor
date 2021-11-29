<?php

namespace Elementor\Core\Options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class User_Option extends Option_Base {

	public static function get() {
		$value = get_user_option( static::get_full_key(), get_current_user_id() );

		if ( false === $value ) {
			$value = static::get_default();
		}

		return $value;
	}

	public static function set( $value ) {
		return update_user_option( get_current_user_id(), static::get_full_key(), $value );
	}

	public static function delete() {
		return delete_user_option( get_current_user_id(), static::get_full_key() );
	}
}
