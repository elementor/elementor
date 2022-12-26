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
	public function get_scripts();

	/**
	 * Return a list of the scripts handles to enqueue (loaders for the apps).
	 *
	 * @return string[] handle names
	 */
	public function get_scripts_for_enqueue();

	/**
	 * Return a list of the styles to register.
	 *
	 * @return array
	 */
	public function get_styles();

	/**
	 * Return a list of the style handles to enqueue (loaders for the apps).
	 *
	 * @return string[] handle names
	 */
	public function get_styles_for_enqueue();

	/**
	 * Return the path to the template body file.
	 *
	 * @return string
	 */
	public function get_template_body_file_path();
}
