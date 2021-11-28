<?php
namespace Elementor\Core\Admin\Options;

use Elementor\Core\Options\Site_Option;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Usage_Opt_In extends Site_Option {
	public static function get_key() {
		return 'allow_tracking';
	}

	public static function should_autoload() {
		return false;
	}

	public static function get_default() {
		return 'no';
	}
}
