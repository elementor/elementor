<?php
namespace Elementor\App\Modules\Onboarding\Options;

use Elementor\Core\Config\Site_Yes_No_Option_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Is_Onboarded extends Site_Yes_No_Option_Base {

	public static function get_key() {
		return 'onboarded';
	}

	public static function should_autoload() {
		return false;
	}
}
