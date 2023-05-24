<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Config_Array_Trait;
use Elementor\Core\Config\User_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class User_Introduction extends User_Config_Base {

	use Config_Array_Trait;

	public static function get_key(): string {
		return 'introduction';
	}

	public static function get_default(): array {
		return [];
	}

	public static function validate( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		foreach ( $value as $key => $val ) {
			if ( ! is_string( $key ) || ! is_bool( $val ) ) {
				return false;
			}
		}

		return true;
	}

	public static function set_viewed( $key, $value ): bool {
		return static::set_sub_option( $key, $value );
	}

	public static function is_viewed( $key ): bool {
		return ! ! static::get_sub_option( $key );
	}
}
