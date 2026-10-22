<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Request_Path {

	/**
	 * Extract the relative path from REQUEST_URI, stripping the home URL
	 * prefix for subdirectory installs and decoding percent-encoded characters.
	 *
	 * @return string Relative path with leading slash, or empty string on failure.
	 */
	public static function get_relative_path(): string {
		$request_uri = esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ?? '' ) );

		$path = wp_parse_url( $request_uri, PHP_URL_PATH );

		if ( ! is_string( $path ) ) {
			return '';
		}

		$path = rawurldecode( $path );

		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );

		if ( ! is_string( $home_path ) || '' === $home_path || '/' === $home_path ) {
			return $path;
		}

		$home_path = rawurldecode( untrailingslashit( $home_path ) );

		if ( 0 === strpos( $path, $home_path . '/' ) ) {
			return substr( $path, strlen( $home_path ) );
		}

		return $path;
	}

	/**
	 * Check whether the current request URI matches a given filename.
	 * Handles subdirectory WordPress installs transparently.
	 *
	 * @param string $filename e.g. 'llms.txt' or 'llms-full.txt'
	 */
	public static function matches( string $filename ): bool {
		$path = self::get_relative_path();

		if ( '' === $path ) {
			return false;
		}

		$path = untrailingslashit( $path );

		$trimmed_path = ltrim( $path, '/' );

		return '/' . $filename === $path || $trimmed_path === $filename;
	}
}
