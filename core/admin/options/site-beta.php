<?php
namespace Elementor\Core\Admin\Options;

use elementor\core\options\On_Off_Option_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Beta extends On_Off_Option_Base {

	public static function get_key() {
		return 'beta';
	}

	public static function should_autoload() {
		return false;
	}

	public static function get_default() {
		return static::OPTION_FALSE;
	}
}
