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

if ( ! function_exists( 'esc_html' ) ) {
	function esc_html( $text ) {
		return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8' );
	}
}

if ( ! function_exists( 'sanitize_text_field' ) ) {
	function sanitize_text_field( $str ) {
		$filtered = wp_check_invalid_utf8( $str );

		if ( str_contains( $filtered, '<' ) ) {
			$filtered = wp_strip_all_tags( $filtered );
		}

		return trim( $filtered );
	}
}

if ( ! function_exists( 'wp_check_invalid_utf8' ) ) {
	function wp_check_invalid_utf8( $text, $strip = false ) {
		$text = (string) $text;

		if ( 0 === strlen( $text ) ) {
			return '';
		}

		if ( 1 === @preg_match( '/^./us', $text ) ) {
			return $text;
		}

		return $strip ? '' : $text;
	}
}

if ( ! function_exists( 'wp_strip_all_tags' ) ) {
	function wp_strip_all_tags( $text, $remove_breaks = false ) {
		$text = preg_replace( '@<(script|style)[^>]*?>.*?</\\1>@si', '', (string) $text );
		$text = strip_tags( $text );

		if ( $remove_breaks ) {
			$text = preg_replace( '/[\r\n\t ]+/', ' ', $text );
		}

		return trim( $text );
	}
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
