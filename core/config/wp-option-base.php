<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class WP_Option_Base extends Config_Base {
	const PREFIX = '';

	public static function on_register() {
		if ( method_exists( static::class, 'on_wp_change' ) ) {
			/** @var static $classname */
			$classname = static::class;
			$option_name = static::get_full_key();

			add_action( "add_option_{$option_name}", function( $option, $value ) use ( $classname ) {
				$classname::on_wp_change( $value );
			}, 10, 2 );

			add_action( "update_option_{$option_name}", function( $old_value, $value ) use ( $classname ) {
				$classname::on_wp_change( $value, $old_value );
			}, 10, 2 );
		}
	}

	final public static function get_raw() {
		return get_option( static::get_full_key() );
	}

	final public static function get() {
		return get_option( static::get_full_key(), static::get_default() );
	}

	final protected static function deleter(): bool {
		return delete_option( static::get_full_key() );
	}

	protected static function setter( $value ): bool {
		return update_option( static::get_full_key(), $value );
	}

	protected static function has_permission( $value ) {
		return current_user_can( 'manage_options' );
	}
}
