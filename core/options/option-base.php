<?php

namespace Elementor\Core\Options;

use Elementor\Core\Admin\Options\User_Introduction;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Option_Base {
	/**
	 * @var static
	 */
	public static $instance;

	/**
	 * @return mixed
	 */
	public static function get() {
		wp_die( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @return string
	 */
	public static function get_key() {
		wp_die( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @return string
	 */
	public static function get_default() {
		wp_die( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @param mixed $value
	 * @return bool
	 */
	public static function set( $value ) {
		wp_die( __METHOD__ . ' must be implemented' );
	}
	/**
	 * @return bool
	 */
	public static function delete() {
		wp_die( __METHOD__ . ' must be implemented' );
	}

	public static function get_prefix() {
		return 'elementor_';
	}

	public static function get_full_key() {
		return static::get_prefix() . static::get_key();
	}

	public static function get_sub_option( $key ) {
		$parent_value = static::get();

		return isset( $parent_value[ $key ] ) ? $parent_value[ $key ] : null;
	}

	public static function set_sub_option( $key, $value ) {
		$parent_value = static::get();
		$parent_value[ $key ] = $value;

		return static::set( $parent_value );
	}

	public static function delete_sub_option( $key ) {
		$parent_value = static::get();
		unset( $parent_value[ $key ] );

		return static::set( $parent_value );
	}

	public static function on_change( $new_value, $old_value = null ) {}

	public static function is_on() {
		return 'yes' === static::get();
	}

	public static function is_off() {
		return ! static::is_on();
	}

	public static function set_on() {
		return static::set( 'yes' );
	}

	public static function set_off() {
		return static::delete();
	}
}
