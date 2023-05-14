<?php

namespace Elementor\Core\Options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Yes_No_Option_Base extends Boolean_Option_Base {

	protected static function get_options() {
		return [
			static::OPTION_TRUE => __( 'Yes', 'elementor' ),
			static::OPTION_FALSE => __( 'No', 'elementor' ),
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
