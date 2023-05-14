<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Config_Boolean_Trait;
use Elementor\Core\Config\User_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class User_Beta_Tester extends User_Config_Base {

	use Config_Boolean_Trait;

	const SIGNUP = 'beta_tester_signup';

	public static function get_key(): string {
		return 'beta_tester';
	}

	public static function get_default() {
		return static::VALUE_FALSE;
	}
}
