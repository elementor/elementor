<?php
namespace Elementor\Core\Admin\Options;

use Elementor\Core\Options\On_Off_Option_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Usage_Opt_In extends On_Off_Option_Base {
	public static function get_key() {
		return 'allow_tracking';
	}

	public static function should_autoload() {
		return false;
	}

	public static function get_default() {
		return static::OPTION_FALSE;
	}
}
