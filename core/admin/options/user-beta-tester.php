<?php
namespace Elementor\Core\Admin\Options;

use Elementor\Core\Options\User_Option;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class User_Beta_Tester extends User_Option {
	const SIGNUP = 'beta_tester_signup';

	public static function get_key() {
		return 'beta_tester';
	}

	public static function get_default() {
		return static::OPTION_NO;
	}
}
