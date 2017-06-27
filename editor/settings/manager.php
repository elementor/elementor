<?php
namespace Elementor\Editor\Settings;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Manager {
	/**
	 * @var Base\Manager[]
	 */
	private static $settings_managers = [];

	private static $default_settings_managers_names = [ 'page' ];

	public static function add_settings_manager( $manager_class ) {
		/**
		 * @var Base\Manager $manager_class
		 */
		$manager_class::run();

		self::$settings_managers[ $manager_class::get_name() ] = $manager_class;
	}

	private static function register_default_settings_managers() {
		foreach ( self::$default_settings_managers_names as $manager_name ) {
			self::add_settings_manager( __NAMESPACE__ . '\\' . ucfirst( $manager_name ) . '\Manager' );
		}
	}

	public static function get_settings_managers_config() {
		$config = [];

		foreach ( self::$settings_managers as $name => $manager ) {
			$settings_model = $manager::get_model_for_config();

			$config[ $name ] = [
				'name' => $manager::get_name(),
				'panelPageSettings' => $settings_model->get_panel_page_settings(),
				'cssWrapperSelector' => $settings_model->get_css_wrapper_selector(),
				'controls' => $settings_model->get_controls(),
				'tabs' => $settings_model->get_tabs_controls(),
				'settings' => $settings_model->get_settings(),
			];
		}

		return $config;
	}

	public static function run() {
		self::register_default_settings_managers();
	}
}
