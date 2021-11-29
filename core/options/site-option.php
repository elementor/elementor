<?php

namespace Elementor\Core\Options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Site_Option extends Option_Base {

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

	/**
	 * @return bool
	 */
	public static function should_autoload() {
		throw new \Error( __METHOD__ . ' must be implemented' );
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
