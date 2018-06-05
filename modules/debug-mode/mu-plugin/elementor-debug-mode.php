<?php

/**
 * Plugin Name: Elementor Debug Mode
 * Description: Enter to Elementor Editor in debug mode.
 * Plugin URI: https://elementor.com/?utm_source=wp-plugins&utm_campaign=plugin-uri&utm_medium=wp-dash
 * Author: Elementor.com
 * Version: 0.0.1
 * Author URI: https://elementor.com/?utm_source=wp-plugins&utm_campaign=author-uri&utm_medium=wp-dash
 *
 * Text Domain: elementor
 *
 * @package Elementor
 * @category Debug Mode
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

$debug_enabled = get_option( 'elementor_debug_mode' );

if ( ! $debug_enabled ) {
	return;
}

$is_editor = is_admin() && isset( $_GET['action'] ) && 'elementor' === $_GET['action'];
$is_editor_preview = isset( $_GET['elementor-preview'] );

if ( ! $is_editor  && ! $is_editor_preview ) {
	return;
}
add_filter( 'pre_option_active_plugins', function () {
	return get_option( 'elementor_debug_mode_allowed_plugins' );
}, 0 );

add_filter( 'pre_option_stylesheet', function () {
	return 'elementor-debug';
}, 0 );

add_filter( 'pre_option_template', function () {
	return 'elementor-debug';
}, 0 );

add_filter( 'template_include', function () {
	return ELEMENTOR_PATH . '/modules/debug-mode/views/template-debug.php';
}, 0 );

add_action( 'elementor/editor/footer', function () {
	$tools_url = add_query_arg(
		[
			'page' => 'elementor-tools#tab-debug_mode',
		],
		admin_url( 'admin.php' )
	);
	?>
	<style>
		#elementor-debug-mode-message {
			position: absolute;
			z-index: 3;
			bottom: 0;
			min-width: 200px;
			height: 30px;
			line-height: 30px;
			background: yellow;
			right: 0;
			text-align: center;
		}

		#elementor-debug-mode-message a{
			color: black;
		}
	</style>
	<div id="elementor-debug-mode-message">
		<a target="_blank" href="<?php echo $tools_url; ?>">
			<?php echo __( 'Exit Debug mode', '' ); ?>
		</a>
	</div>
	<?php
} );
