<?php

namespace Elementor\Modules\Mcp\Super_Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Path_Validator {

	public static function resolve_under_abspath( string $path ): string {
		$path = trim( $path );
		if ( empty( $path ) ) {
			return '';
		}

		if ( false !== strpos( $path, "\0" ) ) {
			return '';
		}

		if ( 0 !== validate_file( $path ) && 0 !== validate_file( $path, [ ABSPATH ] ) ) {
			return '';
		}

		$absolute = path_is_absolute( $path ) ? $path : path_join( ABSPATH, $path );
		$normalized = wp_normalize_path( $absolute );

		if ( empty( $normalized ) ) {
			return '';
		}

		$abspath_normalized = rtrim( wp_normalize_path( ABSPATH ), '/' );

		if ( 0 !== strpos( $normalized, $abspath_normalized . '/' ) && $normalized !== $abspath_normalized ) {
			return '';
		}

		return $normalized;
	}
}
