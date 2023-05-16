<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class User_Config_Base extends Config_Base {
	const PREFIX = 'elementor_';

	public static function get() {
		$value = get_user_option( static::get_full_key(), get_current_user_id() );

		if ( false === $value ) {
			$value = static::get_default();
		}

		return $value;
	}

	public static function setter( $value ) {
		return update_user_option( get_current_user_id(), static::get_full_key(), $value );
	}

	public static function delete() {
		return delete_user_option( get_current_user_id(), static::get_full_key() );
	}

	protected static function has_permission( $value ) {
		return is_user_logged_in() || current_user_can( 'manage_options' );
	}
}
