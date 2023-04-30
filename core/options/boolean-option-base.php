<?php

namespace Elementor\Core\Options;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Boolean_Option_Base extends Option_Base {
	const OPTION_TRUE = true;
	const OPTION_FALSE = false;

	protected static function get_options() {
		return [
			static::OPTION_TRUE => __( 'True', 'elementor' ),
			static::OPTION_FALSE => __( 'False', 'elementor' ),
		];
	}

	public static function is_true() {
		return static::OPTION_TRUE === static::get();
	}

	public static function is_false() {
		return ! static::is_true();
	}

	public static function set_true() {
		return static::set( static::OPTION_TRUE );
	}

	public static function set_false() {
		return static::set( static::OPTION_FALSE );
	}
}
