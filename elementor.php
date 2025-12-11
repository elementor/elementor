<?php
/**
 * Plugin Name: Elementor
 * Description: The Elementor Website Builder has it all: drag and drop page builder, pixel perfect design, mobile responsive editing, and more. Get started now!
 * Plugin URI: https://elementor.com/?utm_source=wp-plugins&utm_campaign=plugin-uri&utm_medium=wp-dash
 * Version: 3.35.0
 * Author: Elementor.com
 * Author URI: https://elementor.com/?utm_source=wp-plugins&utm_campaign=author-uri&utm_medium=wp-dash
 * Requires PHP: 7.4
 * Requires at least: 6.6
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

define( 'ELEMENTOR_VERSION', '3.35.0' );

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

if ( ! defined( 'ELEMENTOR_EDITOR_EVENTS_MIXPANEL_TOKEN' ) ) {
	define( 'ELEMENTOR_EDITOR_EVENTS_MIXPANEL_TOKEN', '' );
}

if ( file_exists( ELEMENTOR_PATH . 'vendor/autoload.php' ) ) {
	require_once ELEMENTOR_PATH . 'vendor/autoload.php';
	// We need this file because of the DI\create function that we are using.
	// Autoload classmap doesn't include this file.
}

// Load the prefixed deprecation-contracts function file for Twig compatibility.
// This file defines ElementorDeps\trigger_deprecation() which is required by Twig.
$deprecation_func_file = ELEMENTOR_PATH . 'vendor_prefixed/twig/symfony/deprecation-contracts/function.php';
// #region debug log
error_log( '[ELEMENTOR_DEBUG] ELEMENTOR_PATH=' . ELEMENTOR_PATH );
error_log( '[ELEMENTOR_DEBUG] deprecation_func_file=' . $deprecation_func_file );
error_log( '[ELEMENTOR_DEBUG] file_exists=' . ( file_exists( $deprecation_func_file ) ? 'true' : 'false' ) );
// #endregion
if ( file_exists( $deprecation_func_file ) ) {
	require_once $deprecation_func_file;
	// #region debug log
	error_log( '[ELEMENTOR_DEBUG] function_exists(ElementorDeps\trigger_deprecation)=' . ( function_exists( 'ElementorDeps\trigger_deprecation' ) ? 'true' : 'false' ) );
	error_log( '[ELEMENTOR_DEBUG] function_exists(trigger_deprecation) before define=' . ( function_exists( 'trigger_deprecation' ) ? 'true' : 'false' ) );
	// #endregion
	// Also define the function in global namespace as a fallback, because PHP function
	// resolution only checks current namespace then global - it doesn't walk up namespaces.
	if ( ! function_exists( 'trigger_deprecation' ) ) {
		function trigger_deprecation( string $package, string $version, string $message, ...$args ): void {
			\ElementorDeps\trigger_deprecation( $package, $version, $message, ...$args );
		}
		// #region debug log
		error_log( '[ELEMENTOR_DEBUG] Global trigger_deprecation() defined successfully' );
		// #endregion
	}
} else {
	// #region debug log
	error_log( '[ELEMENTOR_DEBUG] WARNING: deprecation_func_file does NOT exist!' );
	// #endregion
}

if ( ! version_compare( PHP_VERSION, '7.4', '>=' ) ) {
	add_action( 'admin_notices', 'elementor_fail_php_version' );
} elseif ( ! version_compare( get_bloginfo( 'version' ), '6.5', '>=' ) ) {
	add_action( 'admin_notices', 'elementor_fail_wp_version' );
} else {
	require ELEMENTOR_PATH . 'includes/plugin.php';
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
	$html_message = sprintf(
		'<div class="error"><h3>%1$s</h3><p>%2$s <a href="https://go.elementor.com/wp-dash-update-php/" target="_blank">%3$s</a></p></div>',
		esc_html__( 'Elementor isn’t running because PHP is outdated.', 'elementor' ),
		sprintf(
			/* translators: %s: PHP version. */
			esc_html__( 'Update to version %s and get back to creating!', 'elementor' ),
			'7.4'
		),
		esc_html__( 'Show me how', 'elementor' )
	);

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
	$html_message = sprintf(
		'<div class="error"><h3>%1$s</h3><p>%2$s <a href="https://go.elementor.com/wp-dash-update-wordpress/" target="_blank">%3$s</a></p></div>',
		esc_html__( 'Elementor isn’t running because WordPress is outdated.', 'elementor' ),
		sprintf(
			/* translators: %s: WordPress version. */
			esc_html__( 'Update to version %s and get back to creating!', 'elementor' ),
			'6.5'
		),
		esc_html__( 'Show me how', 'elementor' )
	);

	echo wp_kses_post( $html_message );
}
