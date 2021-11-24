<?php
namespace Elementor\Core\Admin\Options;

use Elementor\Core\Options\Site_Option;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Usage_Last_Send extends Site_Option {
	public static function get_key() {
		return 'tracker_last_send';
	}

	public static function get_default() {
		return false;
	}

	public static function get_autoload() {
		return false;
	}
}
