<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

add_action( 'admin_menu', 'hello_elementor_settings_page' );
add_action( 'init', 'hello_elementor_tweak_settings', 0 );

/**
 * Register theme settings page.
 */
function hello_elementor_settings_page() {

	$menu_hook = '';

	$menu_hook = add_theme_page(
		esc_html__( 'Hello Theme Settings', 'hello-elementor' ),
		esc_html__( 'Theme Settings', 'hello-elementor' ),
		'manage_options',
		'hello-theme-settings',
		'hello_elementor_settings_page_render'
	);

	add_action( 'load-' . $menu_hook, function() {
		add_action( 'admin_enqueue_scripts', 'hello_elementor_settings_page_scripts', 10 );
	} );

}

/**
 * Register settings page scripts.
 */
function hello_elementor_settings_page_scripts() {

	$dir = get_template_directory() . '/assets/js';
	$suffix = defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ? '' : '.min';
	$handle = 'hello-admin';
	$asset_path = "$dir/hello-admin.asset.php";
	$asset_url = get_template_directory_uri() . '/assets/js';
	if ( ! file_exists( $asset_path ) ) {
		throw new \Error( 'You need to run `npm run build` for the "hello-theme" first.' );
	}
	$script_asset = require( $asset_path );

	wp_enqueue_script(
		$handle,
		"$asset_url/$handle$suffix.js",
		$script_asset['dependencies'],
		$script_asset['version']
	);

	wp_set_script_translations( $handle, 'hello-elementor' );

	wp_enqueue_style(
		$handle,
		"$asset_url/$handle$suffix.css",
		[ 'wp-components' ],
		$script_asset['version']
	);

	$plugins = get_plugins();

	if ( ! isset( $plugins['elementor/elementor.php'] ) ) {
		$action_link_type = 'install-elementor';
		$action_link_url = wp_nonce_url(
			add_query_arg(
				[
					'action' => 'install-plugin',
					'plugin' => 'elementor',
				],
				admin_url( 'update.php' )
			),
			'install-plugin_elementor'
		);
	} elseif ( ! defined( 'ELEMENTOR_VERSION' ) ) {
		$action_link_type = 'activate-elementor';
		$action_link_url = wp_nonce_url( 'plugins.php?action=activate&plugin=elementor/elementor.php', 'activate-plugin_elementor/elementor.php' );
	} elseif ( hello_header_footer_experiment_active() && ! hello_header_footer_experiment_active() ) {
		$action_link_type = 'activate-header-footer-experiment';
		$action_link_url = wp_nonce_url( 'admin.php?page=elementor#tab-experiments' );
	} elseif ( hello_header_footer_experiment_active() ) {
		$action_link_type = 'style-header-footer';
		$action_link_url = wp_nonce_url( 'post.php?post=' . get_option( 'elementor_active_kit' ) . '&action=elementor' );
	} else {
		$action_link_type = '';
		$action_link_url = '';
	}

	wp_localize_script(
		$handle,
		'helloAdminData',
		[
			'actionLinkType' => $action_link_type,
			'actionLinkURL' => $action_link_url,
			'templateDirectoryURI' => get_template_directory_uri(),
		]
	);
}

/**
 * Render settings page wrapper element.
 */
function hello_elementor_settings_page_render() {
	?>
	<div id="hello-elementor-settings"></div>
	<?php
}

/**
 * Theme tweaks & settings.
 */
function hello_elementor_tweak_settings() {

	$settings_group = 'hello_elementor_settings';

	$settings = [
		'DESCRIPTION_META_TAG' => '_description_meta_tag',
		'SKIP_LINK' => '_skip_link',
		'HEADER_FOOTER' => '_header_footer',
		'PAGE_TITLE' => '_page_title',
		'HELLO_STYLE' => '_hello_style',
		'HELLO_THEME' => '_hello_theme',
	];

	hello_elementor_register_settings( $settings_group, $settings );
	hello_elementor_render_tweaks( $settings_group, $settings );
}

/**
 * Register theme settings.
 */
function hello_elementor_register_settings( $settings_group, $settings ) {

	foreach ( $settings as $setting_key => $setting_value ) {
		register_setting(
			$settings_group,
			$settings_group . $setting_value,
			[
				'default' => '',
				'show_in_rest' => true,
				'type' => 'string',
			]
		);
	}

}

/**
 * Run a tweek only if the user requested it.
 */
function hello_elementor_do_tweak( $setting, $tweak_callback ) {

	$option = get_option( $setting );
	if ( isset( $option ) && ( 'true' === $option ) && is_callable( $tweak_callback ) ) {
		$tweak_callback();
	}

}

/**
 * Render theme tweaks.
 */
function hello_elementor_render_tweaks( $settings_group, $settings ) {

	hello_elementor_do_tweak( $settings_group . $settings['DESCRIPTION_META_TAG'], function() {
		remove_action( 'wp_head', 'hello_elementor_add_description_meta_tag' );
	} );

	hello_elementor_do_tweak( $settings_group . $settings['SKIP_LINK'], function() {
		add_filter( 'hello_elementor_enable_skip_link', '__return_false' );
	} );

	hello_elementor_do_tweak( $settings_group . $settings['HEADER_FOOTER'], function() {
		add_filter( 'hello_elementor_header_footer', '__return_false' );
	} );

	hello_elementor_do_tweak( $settings_group . $settings['PAGE_TITLE'], function() {
		add_filter( 'hello_elementor_page_title', '__return_false' );
	} );

	hello_elementor_do_tweak( $settings_group . $settings['HELLO_STYLE'], function() {
		add_filter( 'hello_elementor_enqueue_style', '__return_false' );
	} );

	hello_elementor_do_tweak( $settings_group . $settings['HELLO_THEME'], function() {
		add_filter( 'hello_elementor_enqueue_theme_style', '__return_false' );
	} );

}
