<?php
/**
 * DB-less unit bootstrap for fast local PHPUnit runs.
 *
 * No WordPress, no MySQL, no plugin boot. It only defines ABSPATH and registers an autoloader
 * that resolves `Elementor\...` classes straight to their files using the same name->path
 * transform as includes/autoloader.php. Use it for pure unit tests whose subjects don't call
 * WordPress at load/run time (e.g. css-converter, prop-types). Run via tests/phpunit/run-unit.sh.
 */

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

$root = dirname( __DIR__, 2 ) . '/';

require $root . 'vendor/autoload.php';

spl_autoload_register( function ( $class ) use ( $root ) {
	$namespace = 'Elementor\\';

	if ( 0 !== strpos( $class, $namespace ) ) {
		return;
	}

	$relative = substr( $class, strlen( $namespace ) );

	$path = strtolower(
		preg_replace(
			[ '/([a-z])([A-Z])/', '/_/', '/\\\\/' ],
			[ '$1-$2', '-', DIRECTORY_SEPARATOR ],
			$relative
		)
	);

	$file = $root . $path . '.php';

	if ( is_readable( $file ) ) {
		require $file;
	}
} );
