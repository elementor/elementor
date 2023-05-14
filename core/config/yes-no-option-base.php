<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Yes_No_Option_Base extends Boolean_Config_Base {

	protected static function get_options() {
		return [
			static::CONFIG_TRUE => __( 'Yes', 'elementor' ),
			static::CONFIG_FALSE => __( 'No', 'elementor' ),
		];
	}

	public static function is_yes() {
		return static::is_true();
	}

	public static function is_no() {
		return static::is_false();
	}

	public static function set_yes() {
		return static::set_true();
	}

	public static function set_no() {
		return static::set_false();
	}
}
