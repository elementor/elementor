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

		if ( ! self::is_under( $normalized, $abspath_normalized ) ) {
			return '';
		}

		if ( ! self::real_path_stays_under_abspath( $normalized ) ) {
			return '';
		}

		return $normalized;
	}

	private static function real_path_stays_under_abspath( string $path ): bool {
		if ( ! file_exists( $path ) ) {
			return true;
		}

		$real_path = realpath( $path );
		$real_abspath = realpath( ABSPATH );

		if ( false === $real_path || false === $real_abspath ) {
			return false;
		}

		return self::is_under( wp_normalize_path( $real_path ), rtrim( wp_normalize_path( $real_abspath ), '/' ) );
	}

	private static function is_under( string $path, string $root ): bool {
		return $path === $root || 0 === strpos( $path, $root . '/' );
	}
}
