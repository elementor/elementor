<?php

namespace Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Interfaces\Admin_Menu_Item_With_Page;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Cloud Hosting Plans Menu Item.
 */
class Cloud_Hosting_Plans_Menu_Item implements Admin_Menu_Item_With_Page {
	const URL = 'https://go.elementor.com/host-local-side-menu/';

	public function is_visible() {
		$env_type = wp_get_environment_type();

		if ( in_array( $env_type, [ 'development', 'local', 'staging' ] ) ) {
			return true;
		}

		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		$host = isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '';

		$is_dev = (
			false !== strpos( $host, '.local' )
			|| false !== strpos( $host, 'localhost' )
			|| preg_match( '/^192\.168\./', $ip )
			|| '127.0.0.1' === $ip
		);

		return $is_dev;
	}

	public function get_parent_slug() {
		return 'edit.php?post_type=elementor_library';
	}

	public function get_label() {
		return esc_html__( 'Hosting Plans', 'elementor' );
	}

	public function get_capability() {
		return 'manage_options';
	}

	public function get_page_title() {
		return esc_html__( 'Hosting Plans', 'elementor' );
	}

	public function render() {
		exit;
	}

	public static function get_url() {
		return self::URL;
	}
}
