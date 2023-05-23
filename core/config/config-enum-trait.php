<?php

namespace Elementor\Core\Config;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

trait Config_Enum_Trait {

	abstract public static function get_options(): array;

	public static function validate( $value ): bool {
		return in_array( $value, array_keys( static::get_options() ), true );
	}
}
