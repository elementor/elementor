<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( function_exists( 'home_url' ) ) {
	return;
}

function home_url( $path = '' ) {
	return 'http://baba-site-3.local' . $path;
}

function set_url_scheme( $url, $scheme = null ) {
	if ( null === $scheme ) {
		return $url;
	}

	$parsed = wp_parse_url( $url );

	if ( ! is_array( $parsed ) ) {
		return $url;
	}

	$parsed['scheme'] = $scheme;

	$host = $parsed['host'] ?? '';
	$port = isset( $parsed['port'] ) ? ':' . $parsed['port'] : '';
	$path = $parsed['path'] ?? '';
	$query = isset( $parsed['query'] ) ? '?' . $parsed['query'] : '';

	return $parsed['scheme'] . '://' . $host . $port . $path . $query;
}

function wp_parse_url( $url, $component = -1 ) {
	return parse_url( $url, $component );
}
