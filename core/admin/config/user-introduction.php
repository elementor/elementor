<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\User_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class User_Introduction extends User_Config_Base {
	public static function get_key() {
		return 'introduction';
	}

	public static function get_default() {
		return [];
	}

	public static function validate( $value ) {
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
}
