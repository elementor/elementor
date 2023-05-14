<?php
namespace Elementor\App\Modules\Onboarding\Options;

use Elementor\Core\Config\Config_Yes_No_Trait;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Is_Onboarded extends Config_Yes_No_Trait {

	public static function get_key() {
		return 'onboarded';
	}

	public static function should_autoload() {
		return false;
	}
}
