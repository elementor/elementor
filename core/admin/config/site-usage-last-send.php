<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Usage_Last_Send extends Site_Config_Base {
	public static function get_key() {
		return 'tracker_last_send';
	}

	public static function get_default() {
		return false;
	}

	public static function should_autoload() {
		return false;
	}

	protected static function validate($value) {
		return is_int( $value );
	}
}
