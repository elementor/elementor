<?php

namespace Elementor\Core\Options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class User_Option extends Option_Base {
	public static $user_id = 0;

	public static function get() {
		static::set_current_user();

		$value = get_user_option( static::get_full_key(), static::$user_id );

		if ( false === $value ) {
			$value = static::get_default();
		}

		return $value;
	}

	public static function set( $value ) {
		static::set_current_user();
		return update_user_option( static::$user_id, static::get_full_key(), $value );
	}

	public static function delete() {
		static::set_current_user();
		return delete_user_option( static::$user_id, static::get_full_key() );
	}

	public static function set_current_user() {
		if ( empty( static::$user_id ) ) {
			throw \Exception( 'static::$user_id is not set.' );
		}
	}
}
