<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

trait Config_Yes_No_Trait {

	use Config_Boolean_Trait;

	protected static function get_options() {
		return [
			static::VALUE_TRUE => esc_html__( 'Yes', 'elementor' ),
			static::VALUE_FALSE => esc_html__( 'No', 'elementor' ),
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
