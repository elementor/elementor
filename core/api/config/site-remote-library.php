<?php
namespace Elementor\Core\Api\Config;

use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Remote_Library extends Site_Config_Base {
	public static function get_key() {
		return 'remote_info_library';
	}

	public static function get_default() {
		return [];
	}

	public static function should_autoload() {
		return false;
	}

	protected static function validate( $value ) {
		return is_array( $value );
	}
}
