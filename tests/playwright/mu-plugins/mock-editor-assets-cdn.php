<?php
/**
 * Plugin Name: Mock Editor Assets CDN for Testing
 * Description: Answers editor-assets CDN requests from local fixtures so tests do not depend on the live marketing
 * campaign. A request is mocked only when a fixture exists for its path, other requests reach the CDN.
 * A test selects a campaign scenario with the `e2e_cdn_scenario` cookie, `no-promotion` is the default.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

const ELEMENTOR_E2E_CDN_HOST = 'assets.elementor.com';
const ELEMENTOR_E2E_CDN_FIXTURES_DIR = __DIR__ . '/editor-assets-cdn';
const ELEMENTOR_E2E_CDN_DEFAULT_SCENARIO = 'no-promotion';
const ELEMENTOR_E2E_CDN_SCENARIO_COOKIE = 'e2e_cdn_scenario';
const ELEMENTOR_E2E_CDN_CACHE_OPTIONS = [
	'elementor_conversion_banner_assets_data',
	'elementor_side_menu_assets_data',
	'elementor_plugins_page_assets_data',
	'elementor_pointer_assets_data',
	'elementor_connect_page_assets_data',
	'elementor_pro_setup_panel_promotion_assets_data',
	'elementor_sticky_panel_promotion_assets_data',
	'elementor_theme_builder_promotion_assets_data',
	'_elementor_notifications_data',
	'_elementor_home_screen_data',
];

function elementor_e2e_cdn_scenario(): string {
	$scenario = isset( $_COOKIE[ ELEMENTOR_E2E_CDN_SCENARIO_COOKIE ] )
		? sanitize_key( wp_unslash( $_COOKIE[ ELEMENTOR_E2E_CDN_SCENARIO_COOKIE ] ) )
		: '';

	return $scenario && is_dir( ELEMENTOR_E2E_CDN_FIXTURES_DIR . '/' . $scenario )
		? $scenario
		: ELEMENTOR_E2E_CDN_DEFAULT_SCENARIO;
}

function elementor_e2e_cdn_find_fixture( string $path ): string {
	if ( false !== strpos( $path, '..' ) ) {
		return '';
	}

	foreach ( array_unique( [ elementor_e2e_cdn_scenario(), ELEMENTOR_E2E_CDN_DEFAULT_SCENARIO ] ) as $scenario ) {
		$fixture = ELEMENTOR_E2E_CDN_FIXTURES_DIR . '/' . $scenario . $path;

		if ( is_file( $fixture ) ) {
			return $fixture;
		}
	}

	return '';
}

add_filter( 'pre_http_request', function ( $preempt, $args, $url ) {
	if ( strtolower( (string) wp_parse_url( $url, PHP_URL_HOST ) ) !== ELEMENTOR_E2E_CDN_HOST ) {
		return $preempt;
	}

	$fixture = elementor_e2e_cdn_find_fixture( (string) wp_parse_url( $url, PHP_URL_PATH ) );

	if ( ! $fixture ) {
		return $preempt;
	}

	return [
		'headers' => [ 'content-type' => 'application/json' ],
		'body' => (string) file_get_contents( $fixture ),
		'response' => [
			'code' => 200,
			'message' => 'OK',
		],
		'cookies' => [],
		'filename' => null,
	];
}, 10, 3 );

// Campaign requests skip the shared CDN cache, so their data never leaks into parallel default-scenario requests.
if ( ELEMENTOR_E2E_CDN_DEFAULT_SCENARIO !== elementor_e2e_cdn_scenario() ) {
	foreach ( ELEMENTOR_E2E_CDN_CACHE_OPTIONS as $elementor_e2e_cdn_cache_option ) {
		add_filter( "pre_option_{$elementor_e2e_cdn_cache_option}", '__return_empty_array' );
		add_filter( "pre_update_option_{$elementor_e2e_cdn_cache_option}", fn( $value, $old_value ) => $old_value, 10, 2 );
	}
}
