<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Site_Boolean_Config_Base extends Site_Config_Base {
	const CONFIG_TRUE = true;
	const CONFIG_FALSE = false;

	protected static function get_options() {
		return [
			static::CONFIG_TRUE => __( 'True', 'elementor' ),
			static::CONFIG_FALSE => __( 'False', 'elementor' ),
		];
	}

	public static function is_true() {
		return static::CONFIG_TRUE === static::get();
	}

	public static function is_false() {
		return ! static::is_true();
	}

	public static function set_true() {
		return static::set( static::CONFIG_TRUE );
	}

	public static function set_false() {
		return static::set( static::CONFIG_FALSE );
	}
}
