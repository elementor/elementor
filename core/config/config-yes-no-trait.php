<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

trait Config_Yes_No_Trait {

	use Config_Boolean_Trait;

	public static function get_options(): array {
		return [
			static::VALUE_TRUE => esc_html__( 'Yes', 'elementor' ),
			static::VALUE_FALSE => esc_html__( 'No', 'elementor' ),
		];
	}

	public static function is_yes(): bool {
		return static::is_true();
	}

	public static function is_no(): bool {
		return static::is_false();
	}

	public static function set_yes(): bool {
		return static::set_true();
	}

	public static function set_no(): bool {
		return static::set_false();
	}
}
