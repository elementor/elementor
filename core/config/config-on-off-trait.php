<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

trait Config_On_Off_Trait {

	use Config_Boolean_Trait;

	protected static function get_options(): array {
		return [
			static::VALUE_TRUE => __( 'On', 'elementor' ),
			static::VALUE_FALSE => __( 'Off', 'elementor' ),
		];
	}

	public static function is_on(): bool {
		return static::is_true();
	}

	public static function is_off(): bool {
		return static::is_false();
	}

	public static function set_on(): bool {
		return static::set_true();
	}

	public static function set_off(): bool {
		return static::set_false();
	}
}
