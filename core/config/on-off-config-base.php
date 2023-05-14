<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class On_Off_Config_Base extends Boolean_Config_Base {
	protected static function get_options() {
		return [
			static::CONFIG_TRUE => __( 'On', 'elementor' ),
			static::CONFIG_FALSE => __( 'Off', 'elementor' ),
		];
	}

	public static function is_on() {
		return static::is_true();
	}

	public static function is_off() {
		return static::is_false();
	}

	public static function set_on() {
		return static::set_true();
	}

	public static function set_off() {
		return static::set_false();
	}
}
