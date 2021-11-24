<?php

namespace Elementor\Core\Options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Site_Option extends Option_Base {
	/**
	 * @return bool
	 */
	public static function get_autoload() {
		wp_die( __METHOD__ . ' must be implemented' );
	}

	public static function get() {
		return get_option( static::get_full_key(), static::get_default() );
	}

	public static function set( $value ) {
		return update_option( static::get_full_key(), $value, static::get_autoload() );
	}

	public static function delete() {
		return delete_option( static::get_full_key() );
	}
}
