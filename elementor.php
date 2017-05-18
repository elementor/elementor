<?php
/**
 * Plugin Name: Elementor
 * Description: The most advanced frontend drag & drop page builder. Create high-end, pixel perfect websites at record speeds. Any theme, any page, any design.
 * Plugin URI: https://elementor.com/
 * Author: Elementor.com
 * Version: 1.4.7
 * Author URI: https://elementor.com/
 *
 * Text Domain: elementor
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

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

define( 'ELEMENTOR_VERSION', '1.4.7' );

define( 'ELEMENTOR__FILE__', __FILE__ );
define( 'ELEMENTOR_PLUGIN_BASE', plugin_basename( ELEMENTOR__FILE__ ) );
define( 'ELEMENTOR_URL', plugins_url( '/', ELEMENTOR__FILE__ ) );
define( 'ELEMENTOR_PATH', plugin_dir_path( ELEMENTOR__FILE__ ) );
define( 'ELEMENTOR_ASSETS_URL', ELEMENTOR_URL . 'assets/' );

add_action( 'plugins_loaded', 'elementor_load_plugin_textdomain' );

if ( ! version_compare( PHP_VERSION, '5.4', '>=' ) ) {
	add_action( 'admin_notices', 'elementor_fail_php_version' );
} else {
	require( ELEMENTOR_PATH . 'includes/plugin.php' );
}

/**
 * Load gettext translate for our text domain.
 *
 * @since 1.0.0
 *
 * @return void
 */
function elementor_load_plugin_textdomain() {
	load_plugin_textdomain( 'elementor' );
}

/**
 * Show in WP Dashboard notice about the plugin is not activated.
 *
 * @since 1.0.0
 *
 * @return void
 */
function elementor_fail_php_version() {
	$message = esc_html__( 'Elementor requires PHP version 5.4+, plugin is currently NOT ACTIVE.', 'elementor' );
	$html_message = sprintf( '<div class="error">%s</div>', wpautop( $message ) );
	echo wp_kses_post( $html_message );
}
