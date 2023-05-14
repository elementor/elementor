<?php
namespace Elementor\App\Modules\Onboarding\Options;

use Elementor\Core\Config\Config_Yes_No_Trait;
use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Is_Onboarded extends Site_Config_Base {

	use Config_Yes_No_Trait;

	public static function get_key() {
		return 'onboarded';
	}

	public static function should_autoload() {
		return false;
	}
}
