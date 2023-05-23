<?php
namespace Elementor\Modules\Maintenance_Mode\Config;

use Elementor\Core\Config\Site_Config_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Site_Maintenance_Mode_Mode extends Site_Config_Base {
	const OPTION_DISABLED = '';
	const OPTION_COMING_SOON = 'coming_soon';
	const OPTION_MAINTENANCE = 'maintenance';

	public static function get_key(): string {
		return 'maintenance_mode_mode';
	}

	public static function on_wp_change( $value, $old_value ) {
		do_action( 'elementor/maintenance_mode/mode_changed', $old_value, $value );
	}

	public static function get_options(): array {
		return [
			static::OPTION_DISABLED => esc_html__( 'Disabled', 'elementor' ),
			static::OPTION_COMING_SOON => esc_html__( 'Coming Soon', 'elementor' ),
			static::OPTION_MAINTENANCE => esc_html__( 'Maintenance', 'elementor' ),
		];
	}

	public static function get_default(): string {
		return static::OPTION_DISABLED;
	}

	public static function should_autoload(): bool {
		return true;
	}

	public static function is_maintenance(): bool {
		return static::OPTION_MAINTENANCE === static::get_value();
	}

	public static function is_coming_soon(): bool {
		return static::OPTION_COMING_SOON === static::get_value();
	}

	public static function is_disabled(): bool {
		return static::OPTION_DISABLED === static::get_value();
	}

	public static function set_maintenance() {
		static::set( static::OPTION_MAINTENANCE );
	}

	public static function set_coming_soon() {
		static::set( static::OPTION_COMING_SOON );
	}

	public static function set_disabled() {
		static::set( static::OPTION_DISABLED );
	}
}
