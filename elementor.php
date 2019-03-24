<?php
/**
 * Plugin Name: Elementor
 * Description: The most advanced frontend drag & drop page builder. Create high-end, pixel perfect websites at record speeds. Any theme, any page, any design.
 * Plugin URI: https://elementor.com/?utm_source=wp-plugins&utm_campaign=plugin-uri&utm_medium=wp-dash
 * Author: Elementor.com
 * Version: 2.5.9
 * Author URI: https://elementor.com/?utm_source=wp-plugins&utm_campaign=author-uri&utm_medium=wp-dash
 *
 * Text Domain: elementor
 *
 * @package Elementor
 * @category Core
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
	exit; // Exit if accessed directly.
}

define( 'ELEMENTOR_VERSION', '2.5.9' );
define( 'ELEMENTOR_PREVIOUS_STABLE_VERSION', '2.4.7' );

define( 'ELEMENTOR__FILE__', __FILE__ );
define( 'ELEMENTOR_PLUGIN_BASE', plugin_basename( ELEMENTOR__FILE__ ) );
define( 'ELEMENTOR_PATH', plugin_dir_path( ELEMENTOR__FILE__ ) );

if ( defined( 'ELEMENTOR_TESTS' ) && ELEMENTOR_TESTS ) {
	define( 'ELEMENTOR_URL', 'file://' . ELEMENTOR_PATH );
} else {
	define( 'ELEMENTOR_URL', plugins_url( '/', ELEMENTOR__FILE__ ) );
}

define( 'ELEMENTOR_MODULES_PATH', plugin_dir_path( ELEMENTOR__FILE__ ) . '/modules' );
define( 'ELEMENTOR_ASSETS_PATH', ELEMENTOR_PATH . 'assets/' );
define( 'ELEMENTOR_ASSETS_URL', ELEMENTOR_URL . 'assets/' );

add_action( 'plugins_loaded', 'elementor_load_plugin_textdomain' );

if ( ! version_compare( PHP_VERSION, '5.4', '>=' ) ) {
	add_action( 'admin_notices', 'elementor_fail_php_version' );
} elseif ( ! version_compare( get_bloginfo( 'version' ), '4.7', '>=' ) ) {
	add_action( 'admin_notices', 'elementor_fail_wp_version' );
} else {
	require ELEMENTOR_PATH . 'includes/plugin.php';
}

/**
 * Load Elementor textdomain.
 *
 * Load gettext translate for Elementor text domain.
 *
 * @since 1.0.0
 *
 * @return void
 */
function elementor_load_plugin_textdomain() {
	load_plugin_textdomain( 'elementor' );
}

/**
 * Elementor admin notice for minimum PHP version.
 *
 * Warning when the site doesn't have the minimum required PHP version.
 *
 * @since 1.0.0
 *
 * @return void
 */
function elementor_fail_php_version() {
	/* translators: %s: PHP version */
	$message = sprintf( esc_html__( 'Elementor requires PHP version %s+, plugin is currently NOT RUNNING.', 'elementor' ), '5.4' );
	$html_message = sprintf( '<div class="error">%s</div>', wpautop( $message ) );
	echo wp_kses_post( $html_message );
}

/**
 * Elementor admin notice for minimum WordPress version.
 *
 * Warning when the site doesn't have the minimum required WordPress version.
 *
 * @since 1.5.0
 *
 * @return void
 */
function elementor_fail_wp_version() {
	/* translators: %s: WordPress version */
	$message = sprintf( esc_html__( 'Elementor requires WordPress version %s+. Because you are using an earlier version, the plugin is currently NOT RUNNING.', 'elementor' ), '4.7' );
	$html_message = sprintf( '<div class="error">%s</div>', wpautop( $message ) );
	echo wp_kses_post( $html_message );
}
