<?php
namespace Elementor\Core\Logger\Sentry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dsn {

	private $public_key;

	private $host;

	private $project_id;

	public static function from_config() {
		$dsn_string = self::get_dsn_string();

		if ( empty( $dsn_string ) ) {
			return null;
		}

		return self::parse( $dsn_string );
	}

	public static function get_dsn_string() {
		$dsn = defined( 'ELEMENTOR_SENTRY_DSN' ) ? ELEMENTOR_SENTRY_DSN : '';

		/**
		 * Sentry DSN for fatal PHP error reporting.
		 *
		 * @param string $dsn Sentry DSN string.
		 */
		return (string) apply_filters( 'elementor/logger/sentry_dsn', $dsn );
	}

	public static function parse( $dsn_string ) {
		if ( ! is_string( $dsn_string ) || '' === $dsn_string ) {
			return null;
		}

		$parsed = wp_parse_url( $dsn_string );

		if ( ! is_array( $parsed ) ) {
			return null;
		}

		if ( empty( $parsed['scheme'] ) || 'https' !== $parsed['scheme'] ) {
			return null;
		}

		if ( empty( $parsed['host'] ) || empty( $parsed['user'] ) || empty( $parsed['path'] ) ) {
			return null;
		}

		$project_id = trim( $parsed['path'], '/' );

		if ( ! preg_match( '/^\d+$/', $project_id ) ) {
			return null;
		}

		if ( ! preg_match( '/^[a-f0-9]{32}$/i', $parsed['user'] ) ) {
			return null;
		}

		$instance = new self();
		$instance->public_key = $parsed['user'];
		$instance->host = $parsed['host'];
		$instance->project_id = $project_id;

		return $instance;
	}

	public function get_envelope_url() {
		return sprintf( 'https://%s/api/%s/envelope/', $this->host, $this->project_id );
	}

	public function get_public_key() {
		return $this->public_key;
	}
}
