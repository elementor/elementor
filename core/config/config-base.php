<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Config_Base {
	const PREFIX = '';

	const VALUE_TRUE = true;
	const VALUE_FALSE = false;

	protected static function get_options() {
		throw new \Error( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @return mixed
	 */
	public static function get() {
		throw new \Error( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @return string
	 */
	public static function get_key() {
		throw new \Error( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @return string
	 */
	public static function get_default() {
		throw new \Error( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @param mixed $value
	 *
	 * @return bool
	 */
	public static function set( $value ) {
		$old_value = static::get();

		// Avoid changing the value on the frontend.
		if ( ! is_admin() ) {
			throw new \Error( 'Config can only be changed in the admin' );
		}

		// Avoid changing to a value that is not in the options.
		if ( ! static::validate( $value ) ) {
			throw new \Error( self::class . ': Invalid value: ' . print_r( $value, true ) );
		}

		// Avoid changing to a value that the user doesn't have permission to.
		if ( ! static::has_permission( $value ) ) {
			return false;
		}

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
	protected static function setter( $value ) {
		throw new \Error( __METHOD__ . ' must be implemented' );
	}

	protected static function validate( $value ) {
		return in_array( $value, array_keys( static::get_options() ), true );
	}

	protected static function has_permission( $value ) {
		throw new \Error( __METHOD__ . ' must be implemented' );
	}

	/**
	 * @return bool
	 */
	public static function delete() {
		throw new \Error( __METHOD__ . ' must be implemented' );
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
		if ( ! is_array( $parent_value ) ) {
			throw new \Error( 'Parent option is not an array' );
		}

		$parent_value[ $key ] = $value;

		return static::set( $parent_value );
	}

	public static function delete_sub_option( $key ) {
		$parent_value = static::get();
		unset( $parent_value[ $key ] );

		return static::set( $parent_value );
	}
}
