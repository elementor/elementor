<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\User_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class User_Beta_Tester extends User_Config_Base {
	const SIGNUP = 'beta_tester_signup';

	public static function get_key() {
		return 'beta_tester';
	}

	public static function get_default() {
		return static::OPTION_NO;
	}
}
