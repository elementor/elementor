<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Config_On_Off_Trait;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Usage_Opt_In extends Config_On_Off_Trait {
	public static function get_key() {
		return 'allow_tracking';
	}

	public static function should_autoload() {
		return false;
	}

	public static function get_default() {
		return static::CONFIG_FALSE;
	}
}
