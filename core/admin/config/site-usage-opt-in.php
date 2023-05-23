<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Config_On_Off_Trait;
use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Usage_Opt_In extends Site_Config_Base {

	use Config_On_Off_Trait;

	const VALUE_TRUE = 'yes';

	const VALUE_FALSE = 'no';

	public static function get_key(): string {
		return 'allow_tracking';
	}

	public static function should_autoload(): bool {
		return false;
	}

	public static function get_default(): string {
		return static::VALUE_FALSE;
	}
}
