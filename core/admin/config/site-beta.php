<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Config_On_Off_Trait;
use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Beta extends Site_Config_Base {

	use Config_On_Off_Trait;

	public static function get_key() {
		return 'beta';
	}

	public static function should_autoload() : bool {
		return false;
	}

	public static function get_default() {
		return static::CONFIG_FALSE;
	}
}
