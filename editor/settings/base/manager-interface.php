<?php
namespace Elementor\Editor\Settings\Base;

use Elementor\CSS_File;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

interface ManagerInterface {
	/**
	 * @param int $id
	 *
	 * @return array
	 */
	public static function get_saved_settings( $id );

	/**
	 * @return string
	 */
	public static function get_name();

	/**
	 * @return string
	 */
	public static function get_css_file_name();

	/**
	 * @return void
	 */
	public static function ajax_save_settings();

	/**
	 * @param int   $id
	 * @param array $settings
	 *
	 * @return void
	 */
	public static function save_settings( $id, array $settings );

	/**
	 * @param CSS_File $css_file
	 *
	 * @return Model
	 */
	public static function get_model_for_css_file( CSS_File $css_file );

	/**
	 * @return Model
	 */
	public static function get_model_for_config();
}
