<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Config_Base {
	const VALUE_TRUE = true;
	const VALUE_FALSE = false;

	/**
	 * @return mixed
	 */
	abstract public static function get_value();

	abstract public static function get_key(): string;

	abstract public static function get_db_key(): string;

	/**
	 * @return mixed
	 */
	abstract public static function get_default();

	/**
	 * @param mixed $value
	 *
	 * @return bool
	 * @throws \Exception
	 */
	final public static function set( $value ): bool {
		if ( ! Manager::is_backend() ) {
			throw new \Exception( static::class . ': Config can only be changed in the admin' );
		}

		// Avoid changing to a value that the user doesn't have permission to.
		if ( ! Manager::is_allowed_cli() && ! static::has_permission( $value ) ) {
			throw new \Exception( static::class . ': User does not have permission to change config' );
		}

		// Avoid changing to a value that is not in the options.
		if ( ! static::validate( $value ) ) {
			throw new \Exception( static::class . ': Invalid value: ' . var_export( $value, true ) );
		}

		$old_value = static::get_value();

		$success = static::setter( $value );

		if ( $success && method_exists( static::class, 'on_change' ) ) {
			$old_value = static::get_default() === $old_value ? null : $old_value;

			static::on_change( $value, $old_value );
		}

		return $success;
	}

	final public static function delete(): bool {
		if ( ! Manager::is_backend() ) {
			throw new \Error( 'Config can only be changed in the admin' );
		}

		// Avoid changing to a value that the user doesn't have permission to.
		if ( ! static::has_permission( '' ) ) {
			return false;
		}

		return static::deleter();
	}

	/**
	 * @param mixed $value
	 */
	abstract protected static function setter( $value ): bool;

	abstract protected static function validate( $value ): bool;

	abstract protected static function has_permission( $value ): bool;

	abstract protected static function deleter(): bool;
}
