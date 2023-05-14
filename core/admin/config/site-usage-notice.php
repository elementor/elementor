<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\On_Off_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Usage_Notice extends On_Off_Config_Base {
	public static function get_key() {
		return 'tracker_notice';
	}

	public static function get_default() {
		return '';
	}

	public static function should_autoload() {
		return false;
	}

	public static function is_on() {
		return ! static::is_off();
	}

	public static function is_off() {
		return '1' === static::get();
	}

	public static function set_on() {
		return static::delete();
	}

	public static function set_off() {
		return static::set( '1' );
	}
}
