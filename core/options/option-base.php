<?php

namespace Elementor\Core\Options;

use Elementor\Core\Admin\Options\User_Introduction;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Option_Base {
	const PREFIX = 'elementor_';

	const OPTION_NO = 'no';
	const OPTION_YES = 'yes';

	/**
	 * @var static
	 */
	public static $instance;

	/**
	 * @return mixed
	 * @throws \Exception
	 */
	public static function get() {
		throw new \Exception( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @return string
	 * @throws \Exception
	 */
	public static function get_key() {
		throw new \Exception( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @return string
	 * @throws \Exception
	 */
	public static function get_default() {
		throw new \Exception( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @param mixed $value
	 *
	 * @return bool
	 */
	public static function set( $value ) {
		$old_value = static::get();

		$success = static::setter( $value );

		if ( $success && method_exists( static::class, 'on_change' ) ) {
			$old_value = static::get_default() === $old_value ? null : $old_value;

			static::on_change( $value, $old_value );
		}

		return $success;
	}

	/**
	 * @param mixed $value
	 *
	 * @return bool
	 */
	public static function setter( $value ) {
		throw new \Error( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @return bool
	 * @throws \Exception
	 */
	public static function delete() {
		throw new \Exception( __METHOD__ . ' must be implemented' );
	}

	public static function get_prefix() {
		return static::PREFIX;
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
		return static::OPTION_YES === static::get();
	}

	public static function is_off() {
		return ! static::is_on();
	}

	public static function set_on() {
		return static::set( static::OPTION_YES );
	}

	public static function set_off() {
		return static::delete();
	}
}
