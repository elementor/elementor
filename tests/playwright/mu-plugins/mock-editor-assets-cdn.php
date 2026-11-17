<?php
/**
 * Plugin Name: Mock Editor Assets CDN for Testing
 * Description: Answers editor-assets CDN requests from local fixtures so tests do not depend on the live marketing
 * campaign. A request is mocked only when a fixture exists for its path, other requests reach the CDN.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

add_filter( 'pre_http_request', function ( $preempt, $args, $url ) {
	$cdn_host = 'assets.elementor.com';
	$scenario = 'no-promotion';

	if ( strtolower( (string) wp_parse_url( $url, PHP_URL_HOST ) ) !== $cdn_host ) {
		return $preempt;
	}

	$path = (string) wp_parse_url( $url, PHP_URL_PATH );
	$fixture = __DIR__ . '/editor-assets-cdn/' . $scenario . $path;

	if ( false !== strpos( $path, '..' ) || ! is_file( $fixture ) ) {
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
