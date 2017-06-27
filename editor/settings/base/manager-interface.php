<?php
namespace Elementor\Editor\Settings\Base;

use Elementor\CSS_File;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

interface ManagerInterface {
	public static function get_saved_settings( $id );

	public static function get_name();

	public static function get_css_file_name();

	public static function ajax_save_settings();

	public static function save_settings( $id, $data );

	/**
	 * @param CSS_File $css_file
	 *
	 * @return Model
	 */
	public static function get_model_for_css_file( CSS_File $css_file );
}
