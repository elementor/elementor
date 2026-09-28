<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Request_Path {

	/**
	 * Check whether the current request URI matches a given filename.
	 * Handles subdirectory WordPress installs transparently.
	 *
	 * @param string $filename e.g. 'llms.txt' or 'llms-full.txt'
	 */
	public static function matches( string $filename ): bool {
		$request_uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) )
			: '';

		$path = wp_parse_url( $request_uri, PHP_URL_PATH );

		if ( ! is_string( $path ) ) {
			return false;
		}

		$path = untrailingslashit( $path );

		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );

		if ( ! is_string( $home_path ) || '' === $home_path || '/' === $home_path ) {
			$trimmed_path = ltrim( $path, '/' );

			return '/' . $filename === $path || $trimmed_path === $filename;
		}

		$home_path        = untrailingslashit( $home_path );
		$home_path_prefix = $home_path . '/';

		if ( 0 !== strpos( $path, $home_path_prefix ) ) {
			return false;
		}

		$relative_path = substr( $path, strlen( $home_path_prefix ) );

		return $filename === $relative_path;
	}
}
