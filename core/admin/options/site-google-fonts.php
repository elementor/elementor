<?php
namespace elementor\core\admin\options;

use Elementor\Core\Options\Site_Option;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Google_Fonts extends Site_Option {

	const OPTION_NO = '0';

	const OPTION_YES = '1';

	public static function get_key() {
		return 'google_font';
	}

	public static function get_default() {
		// TODO: For future use, using for new installs.
		//$is_new_site = Upgrade_Manager::install_compare( '3.10.0', '>=' );
		//$default_value = $is_new_site ? '0' : '1';

		return '1';
	}

	public static function should_autoload() {
		return true;
	}
}
