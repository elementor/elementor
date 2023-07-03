<?php
namespace Elementor\Core\Editor\Loader;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Editor_Loader_Interface {
	/**
	 * @return void
	 */
	public function register_scripts();

	/**
	 * @return void
	 */
	public function enqueue_scripts();

	/**
	 * @return void
	 */
	public function load_scripts_translations();

	/**
	 * @return void
	 */
	public function print_scripts_settings();

	/**
	 * @return void
	 */
	public function register_styles();

	/**
	 * @return void
	 */
	public function enqueue_styles();

	/**
	 * @return void
	 */
	public function print_root_template();

	/**
	 * @return void
	 */
	public function register_additional_templates();
}
