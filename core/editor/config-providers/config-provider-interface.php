<?php
namespace Elementor\Core\Editor\Config_Providers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Config_Provider_Interface {
	/**
	 * Return a list of the scripts to register.
	 *
	 * @return array
	 */
	public function get_script_configs();

	/**
	 * Return a list of the scripts handles to enqueue (loaders for the apps).
	 *
	 * @return string[] handle names
	 */
	public function get_script_handles_to_enqueue();

	/**
	 * Return the settings objects that will be printed with the scripts.
	 *
	 * @return array
	 */
	public function get_client_settings();

	/**
	 * Return a list of the styles to register.
	 *
	 * @return array
	 */
	public function get_style_configs();

	/**
	 * Return a list of the style handles to enqueue (loaders for the apps).
	 *
	 * @return string[] handle names
	 */
	public function get_style_handles_to_enqueue();

	/**
	 * Return the path to the template body file.
	 *
	 * @return string
	 */
	public function get_template_body_file_path();

	/**
	 * Return a list of Marionette templates to register.
	 *
	 * @return string[]
	 */
	public function get_additional_template_paths();
}
