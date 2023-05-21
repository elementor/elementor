<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\WP_Option_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WP_Home extends WP_Option_Base {
	public static function get_key() {
		return 'home';
	}

	public static function get_default() {
		return '';
	}

	protected static function validate($value) {
		return !empty( $value ) && is_string( $value );
	}
}
