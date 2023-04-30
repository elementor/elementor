<?php

namespace elementor\core\options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class On_Off_Option_Base extends Boolean_Option_Base {
	protected static function get_options() {
		return [
			static::OPTION_TRUE => __( 'On', 'elementor' ),
			static::OPTION_FALSE => __( 'Off', 'elementor' ),
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
