<?php
namespace Elementor\Core\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Manager {
	/**
	 * @var Base\Manager[]
	 */
	private static $settings_managers = [];

	private static $builtin_settings_managers_names = [ 'page', 'general' ];

	public static function add_settings_manager( Base\Manager $manager ) {
		self::$settings_managers[ $manager->get_name() ] = $manager;
	}

	/**
	 * @return Base\Manager|Base\Manager[]
	 */
	public static function get_settings_managers( $manager_name = null ) {
		if ( $manager_name ) {
			if ( isset( self::$settings_managers[ $manager_name ] ) ) {
				return self::$settings_managers[ $manager_name ];
			}

			return null;
		}

		return self::$settings_managers;
	}

	private static function register_default_settings_managers() {
		foreach ( self::$builtin_settings_managers_names as $manager_name ) {
			$manager_class = __NAMESPACE__ . '\\' . ucfirst( $manager_name ) . '\Manager';

			self::add_settings_manager( new $manager_class() );
		}
	}

	public static function get_settings_managers_config() {
		$config = [];

		foreach ( self::$settings_managers as $name => $manager ) {
			$settings_model = $manager->get_model_for_config();

			$config[ $name ] = [
				'name' => $manager->get_name(),
				'panelPage' => $settings_model->get_panel_page_settings(),
				'cssWrapperSelector' => $settings_model->get_css_wrapper_selector(),
				'controls' => $settings_model->get_controls(),
				'tabs' => $settings_model->get_tabs_controls(),
				'settings' => $settings_model->get_settings(),
			];
		}

		return $config;
	}

	public static function get_settings_frontend_config() {
		$config = [];

		foreach ( self::$settings_managers as $name => $manager ) {
			$settings_model = $manager->get_model_for_config();

			$config[ $name ] = $settings_model->get_frontend_settings();
		}

		return $config;
	}

	public static function run() {
		self::register_default_settings_managers();
	}
}
