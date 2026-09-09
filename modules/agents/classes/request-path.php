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

		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );

		if ( is_string( $home_path ) && '' !== $home_path && '/' !== $home_path ) {
			$home_path = untrailingslashit( $home_path );

			if ( 0 === strpos( $path, $home_path ) ) {
				$path = substr( $path, strlen( $home_path ) );
			}
		}

		$path = untrailingslashit( $path );

		return '/' . $filename === $path || $filename === ltrim( $path, '/' );
	}
}
