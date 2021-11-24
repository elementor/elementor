<?php
namespace Elementor\Core\Admin\Options;

use Elementor\Core\Options\Site_Option;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Usage_Notice extends Site_Option {
	public static function get_key() {
		return 'tracker_notice';
	}

	public static function get_default() {
		return '';
	}

	public static function get_autoload() {
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
		return static::set( 1 );
	}
}
