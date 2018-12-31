<?php

/**
 * Plugin Name: Elementor Safe Mode
 * Description: Enter to Elementor Editor in safe mode.
 * Plugin URI: https://elementor.com/?utm_source=wp-plugins&utm_campaign=plugin-uri&utm_medium=wp-dash
 * Author: Elementor.com
 * Version: 0.0.1
 * Author URI: https://elementor.com/?utm_source=wp-plugins&utm_campaign=author-uri&utm_medium=wp-dash
 *
 * Text Domain: elementor
 *
 * @package Elementor
 * @category Safe Mode
 *
 * Elementor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * Elementor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Safe_Mode {

	const OPTION_ENABLED = 'elementor_safe_mode';

	public function __construct() {
		$enabled_type = $this->is_enabled();

		if ( ! $enabled_type ) {
			return;
		}

		if ( ! $this->is_requested() && 'global' !== $enabled_type ) {
			return;
		}

		if ( ! $this->is_editor() && ! $this->is_editor_preview() ) {
			return;
		}

		$this->add_hooks();
	}

	public function is_enabled() {
		return get_option( self::OPTION_ENABLED );
	}

	public function is_requested() {
		return ! empty( $_REQUEST['elementor-mode'] ) && 'safe' === $_REQUEST['elementor-mode'];
	}

	public function is_editor() {
		return is_admin() && isset( $_GET['action'] ) && 'elementor' === $_GET['action'];
	}

	public function is_editor_preview() {
		return isset( $_GET['elementor-preview'] );
	}

	public function add_hooks() {
		add_filter( 'pre_option_active_plugins', function () {
			return get_option( 'elementor_safe_mode_allowed_plugins' );
		} );

		add_filter( 'pre_option_stylesheet', function () {
			return 'elementor-safe';
		} );

		add_filter( 'pre_option_template', function () {
			return 'elementor-safe';
		} );

		add_action( 'elementor/init', function () {
			do_action( 'elementor/safe_mode/init' );
		} );
	}
}

new Safe_Mode();
