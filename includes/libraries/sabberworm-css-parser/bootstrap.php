<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Sabberworm CSS Parser Autoloader
 */
class Sabberworm_CSS_Autoloader {

	private static $namespace_prefix = 'Sabberworm\\CSS\\';
	private static $base_directory;
	private static $registered = false;

	public static function register() {
		if ( self::$registered ) {
			return;
		}

		self::$base_directory = __DIR__ . '/';
		
		if ( ! in_array( [ __CLASS__, 'autoload' ], spl_autoload_functions() ?: [], true ) ) {
			spl_autoload_register( [ __CLASS__, 'autoload' ] );
		}
		
		self::$registered = true;
	}

	public static function autoload( $class ) {
		$prefix_length = strlen( self::$namespace_prefix );
		
		if ( strncmp( self::$namespace_prefix, $class, $prefix_length ) !== 0 ) {
			return;
		}

		if ( class_exists( $class, false ) || interface_exists( $class, false ) || trait_exists( $class, false ) ) {
			return;
		}

		$relative_class = substr( $class, $prefix_length );
		$file_path = self::$base_directory . str_replace( '\\', '/', $relative_class ) . '.php';

		if ( file_exists( $file_path ) ) {
			require $file_path;
		}
	}

	public static function is_registered() {
		return self::$registered;
	}
}

Sabberworm_CSS_Autoloader::register();