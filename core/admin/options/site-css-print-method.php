<?php
namespace Elementor\Core\Admin\Options;

use Elementor\Core\Options\Site_Option;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_CSS_Print_Method extends Site_Option {
	public static function get_key() {
		return 'css_print_method';
	}

	public static function get_default() {
		return 'external';
	}

	public static function get_autoload() {
		return true;
	}

	public static function is_external() {
		return 'internal' !== static::get();
	}

	public static function on_change( $new_value, $old_value = null ) {
		Plugin::$instance->files_manager->clear_cache();
	}
}
