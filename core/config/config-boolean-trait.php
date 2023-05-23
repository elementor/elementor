<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

trait Config_Boolean_Trait {
	use Config_Enum_Trait;

	public static function get_options(): array {
		return [
			static::VALUE_TRUE => esc_html__( 'True', 'elementor' ),
			static::VALUE_FALSE => esc_html__( 'False', 'elementor' ),
		];
	}

	public static function is_true(): bool {
		return static::VALUE_TRUE === static::get_value();
	}

	public static function is_false(): bool {
		return ! static::is_true();
	}

	public static function set_true(): bool {
		return static::set( static::VALUE_TRUE );
	}

	public static function set_false(): bool {
		return static::set( static::VALUE_FALSE );
	}
}
