<?php
namespace Elementor\Editor\Settings\Base;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

interface ManagerInterface {
	public static function get_saved_settings( $id );

	public static function get_name();

	public static function ajax_save_settings();

	public static function save_settings( $id, $data );
}
