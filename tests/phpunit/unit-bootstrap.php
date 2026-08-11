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

if ( ! function_exists( 'wp_json_encode' ) ) {
	function wp_json_encode( $data ) {
		return json_encode( $data );
	}
}

if ( ! function_exists( '__' ) ) {
	function __( $text, $domain = 'default' ) {
		return $text;
	}
}

if ( ! function_exists( 'esc_html__' ) ) {
	function esc_html__( $text, $domain = 'default' ) {
		return htmlspecialchars( (string) $text, ENT_QUOTES, 'UTF-8' );
	}
}

if ( ! function_exists( 'sprintf' ) ) {
	// sprintf is a PHP built-in; guard is a no-op but kept for symmetry.
}

if ( ! function_exists( 'is_wp_error' ) ) {
	function is_wp_error( $thing ) {
		return $thing instanceof \WP_Error;
	}
}

if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error {
		private string $code;
		private string $message;
		private array $data;

		public function __construct( string $code = '', string $message = '', $data = '' ) {
			$this->code    = $code;
			$this->message = $message;
			$this->data    = [ $code => [ $data ] ];
		}

		public function get_error_code(): string {
			return $this->code;
		}

		public function get_error_message(): string {
			return $this->message;
		}

		public function get_error_data( string $code = '' ) {
			return $this->data[ $code ][0] ?? null;
		}
	}
}

if ( ! class_exists( 'WP_Http' ) ) {
	class WP_Http {
		const BAD_REQUEST = 400;
		const NOT_FOUND   = 404;
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
