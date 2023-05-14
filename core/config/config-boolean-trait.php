<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

trait Config_Boolean_Trait {

	protected static function get_options(): array {
		return [
			static::CONFIG_TRUE => __( 'True', 'elementor' ),
			static::CONFIG_FALSE => __( 'False', 'elementor' ),
		];
	}

	public static function is_true(): bool {
		return static::CONFIG_TRUE === static::get();
	}

	public static function is_false(): bool {
		return ! static::is_true();
	}

	public static function set_true(): bool {
		return static::set( static::CONFIG_TRUE );
	}

	public static function set_false(): bool {
		return static::set( static::CONFIG_FALSE );
	}
}
