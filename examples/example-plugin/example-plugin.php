<?php
/**
 * Plugin Name: Elementor Example Plugin
 * Description: Reference addon demonstrating how to extend Elementor from a separate plugin.
 * Plugin URI:  https://developers.elementor.com/
 * Version:     1.0.0
 * Author:      Elementor
 * Author URI:  https://elementor.com/
 * Text Domain: elementor-example-plugin
 *
 * Requires Plugins: elementor
 * Elementor tested up to: 4.3.0
 * Elementor Pro tested up to: 4.3.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ELEMENTOR_EXAMPLE_PLUGIN_FILE', __FILE__ );

function elementor_example_plugin() {
	require_once __DIR__ . '/includes/plugin.php';

	Elementor_Example_Plugin\Plugin::instance();
}
add_action( 'plugins_loaded', 'elementor_example_plugin' );
