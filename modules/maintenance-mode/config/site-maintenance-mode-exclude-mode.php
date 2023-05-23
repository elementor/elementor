<?php
namespace Elementor\Modules\Maintenance_Mode\Config;

use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Maintenance_Mode_Exclude_Mode extends Site_Config_Base {
	const OPTION_LOGGED_IN = 'logged_in';
	const OPTION_CUSTOM = 'custom';

	public static function get_key(): string {
		return 'maintenance_mode_exclude_mode';
	}

	public static function get_options(): array {
		return [
			static::OPTION_LOGGED_IN => esc_html__( 'Logged In', 'elementor' ),
			static::OPTION_CUSTOM => esc_html__( 'Custom', 'elementor' ),
		];
	}

	public static function get_default(): string {
		return static::OPTION_LOGGED_IN;
	}

	public static function should_autoload(): bool {
		return true;
	}

	public static function is_logged_in(): bool {
		return static::OPTION_LOGGED_IN === static::get_value();
	}

	public static function is_custom(): bool {
		return static::OPTION_CUSTOM === static::get_value();
	}

	public static function set_logged_in() {
		static::set( static::OPTION_LOGGED_IN );
	}

	public static function set_custom() {
		static::set( static::OPTION_CUSTOM );
	}
}
