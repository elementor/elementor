<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Config_Boolean_Trait;
use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Usage_Notice extends Site_Config_Base {

	use Config_Boolean_Trait;

	const VALUE_TRUE = '1';

	const VALUE_FALSE = '0';

	public static function get_key() {
		return 'tracker_notice';
	}

	public static function get_default() {
		return static::VALUE_FALSE;
	}

	public static function should_autoload() {
		return false;
	}

	public static function is_hidden() {
		return '1' === static::get_value();
	}

	public static function set_hidden() {
		return static::set_true();
	}
}
