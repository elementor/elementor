<?php
namespace Elementor\Core\Admin\Config;

use Elementor\Core\Config\Config_Enum_Trait;
use Elementor\Core\Config\Site_Config_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_CSS_Print_Method extends Site_Config_Base {

	use Config_Enum_Trait;

	const OPTION_EXTERNAL = 'external';
	const OPTION_INTERNAL = 'internal';

	public static function get_key(): string {
		return 'css_print_method';
	}

	public static function get_options(): array {
		return [
			static::OPTION_EXTERNAL => esc_html__( 'External File', 'elementor' ),
			static::OPTION_INTERNAL => esc_html__( 'Internal Embedding', 'elementor' ),
		];
	}

	public static function get_default(): string {
		return static::OPTION_EXTERNAL;
	}

	public static function should_autoload(): bool {
		return true;
	}

	public static function is_external(): bool {
		return static::OPTION_EXTERNAL === static::get_value();
	}

	public static function on_external_change() {
		Plugin::$instance->files_manager->clear_cache();
	}

	public static function set_internal() {
		static::set( static::OPTION_INTERNAL );
	}

	public static function set_external() {
		static::set( static::OPTION_EXTERNAL );
	}
}
