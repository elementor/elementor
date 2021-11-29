<?php

namespace Elementor\Core\Options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Site_Option extends Option_Base {
	/**
	 * @return bool
	 */
	public static function should_autoload() {
		throw new \Exception( __METHOD__ . ' must be implemented' );
	}

	public static function get() {
		return get_option( static::get_full_key(), static::get_default() );
	}

	public static function setter( $value ) {
		return update_option( static::get_full_key(), $value, static::should_autoload() );
	}

	public static function delete() {
		return delete_option( static::get_full_key() );
	}
}
