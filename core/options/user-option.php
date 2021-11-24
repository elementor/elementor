<?php

namespace Elementor\Core\Options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class User_Option extends Option_Base {
	public static $user_id;

	public function __construct( $user_id ) {
		static::$user_id = $user_id;
	}

	public static function get() {
		$value = get_user_option( static::get_full_key(), static::$user_id );
		if ( false === $value ) {
			$value = static::get_default();
		}
		return $value;
	}

	public static function set( $value ) {
		return update_user_option( static::$user_id, static::get_full_key(), $value );
	}

	public static function delete() {
		return delete_user_option( static::$user_id, static::get_full_key() );
	}
}
