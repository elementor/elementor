<?php
namespace Elementor\Core\Admin\Options;

use Elementor\Core\Options\User_Option;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class User_Introduction extends User_Option {
	public static function get_key() {
		return 'introduction';
	}

	public static function get_default() {
		return [];
	}
}
