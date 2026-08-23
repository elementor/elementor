<?php
namespace Elementor\Core\Logger\Sentry;

use Elementor\Tracker;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Reporter {

	const LOGGER_IDENTIFIER = 'elementor.php';

	const REQUEST_TIMEOUT = 2;

	const THROTTLE_INTERVAL = DAY_IN_SECONDS;

	const TRANSIENT_PREFIX = 'elementor_sentry_fp_';

	private static $fatal_error_types = [
		E_ERROR,
		E_PARSE,
		E_CORE_ERROR,
		E_COMPILE_ERROR,
		E_USER_ERROR,
		E_RECOVERABLE_ERROR,
	];

	private $sanitizer;

	private $sampler;

	public function __construct( Sanitizer $sanitizer = null, Sampler $sampler = null ) {
		$this->sanitizer = $sanitizer ?? new Sanitizer();
		$this->sampler = $sampler ?? new Sampler();
	}

	public function report( array $error ) {
		try {
			$this->maybe_report( $error );
		} catch ( \Throwable $e ) {
			return;
		}
	}

	private function maybe_report( array $error ) {
		if ( ! Tracker::is_allow_track() ) {
			return;
		}

		$dsn = Dsn::from_config();

		if ( ! $dsn ) {
			return;
		}

		if ( empty( $error['type'] ) || ! $this->is_fatal_error_type( (int) $error['type'] ) ) {
			return;
		}

		if ( empty( $error['file'] ) || ! Utils::is_elementor_path( $error['file'] ) ) {
			return;
		}

		$error_type_name = $this->get_error_type_name( (int) $error['type'] );
		$sanitized_message = $this->sanitizer->sanitize_message( $error['message'] ?? '' );
		$relative_file = $this->sanitizer->get_relative_elementor_path( $error['file'] );
		$fingerprint = $this->build_fingerprint( $error_type_name, $sanitized_message, $relative_file );

		if ( ! $this->sampler->should_sample( $fingerprint ) ) {
			return;
		}

		if ( $this->is_throttled( $fingerprint ) ) {
			return;
		}

		$this->set_throttle( $fingerprint );

		$event_id = $this->generate_event_id();
		$event = $this->build_event( $error, $error_type_name, $sanitized_message, $relative_file, $fingerprint, $event_id );
		$envelope = $this->build_envelope( $event, $event_id );

		$this->send( $dsn, $envelope );
	}

	private function is_fatal_error_type( $type ) {
		return in_array( $type, self::$fatal_error_types, true );
	}

	private function get_error_type_name( $type ) {
		$error_names = [
			E_ERROR => 'E_ERROR',
			E_PARSE => 'E_PARSE',
			E_CORE_ERROR => 'E_CORE_ERROR',
			E_COMPILE_ERROR => 'E_COMPILE_ERROR',
			E_USER_ERROR => 'E_USER_ERROR',
			E_RECOVERABLE_ERROR => 'E_RECOVERABLE_ERROR',
		];

		return $error_names[ $type ] ?? 'E_ERROR';
	}

	private function build_fingerprint( $error_type_name, $sanitized_message, $relative_file ) {
		return [
			$error_type_name,
			$sanitized_message,
			$relative_file,
		];
	}

	private function is_throttled( array $fingerprint ) {
		return (bool) get_transient( $this->get_transient_key( $fingerprint ) );
	}

	private function set_throttle( array $fingerprint ) {
		/**
		 * Throttle interval for duplicate Sentry fatal error reports.
		 *
		 * @param int $interval Throttle interval in seconds.
		 */
		$interval = (int) apply_filters( 'elementor/logger/sentry_throttle_interval', self::THROTTLE_INTERVAL );

		if ( $interval <= 0 ) {
			$interval = self::THROTTLE_INTERVAL;
		}

		set_transient( $this->get_transient_key( $fingerprint ), 1, $interval );
	}

	private function get_transient_key( array $fingerprint ) {
		return self::TRANSIENT_PREFIX . md5( implode( '|', $fingerprint ) );
	}

	private function build_event( array $error, $error_type_name, $sanitized_message, $relative_file, array $fingerprint, $event_id ) {
		return [
			'event_id' => $event_id,
			'timestamp' => microtime( true ),
			'platform' => 'php',
			'level' => 'fatal',
			'logger' => self::LOGGER_IDENTIFIER,
			'release' => 'elementor@' . ELEMENTOR_VERSION,
			'fingerprint' => $fingerprint,
			'exception' => [
				'values' => [
					[
						'type' => $error_type_name,
						'value' => $sanitized_message,
						'stacktrace' => [
							'frames' => [
								[
									'filename' => $relative_file,
									'lineno' => isset( $error['line'] ) ? (int) $error['line'] : 0,
								],
							],
						],
					],
				],
			],
			'tags' => [
				'elementor_version' => ELEMENTOR_VERSION,
				'php_version' => PHP_VERSION,
				'wordpress_version' => get_bloginfo( 'version' ),
				'php_error_type' => $error_type_name,
			],
		];
	}

	private function generate_event_id() {
		return bin2hex( random_bytes( 16 ) );
	}

	private function build_envelope( array $event, $event_id ) {
		$event_json = wp_json_encode( $event );

		if ( false === $event_json ) {
			return '';
		}

		$envelope_header = wp_json_encode( [
			'event_id' => $event_id,
			'sent_at' => gmdate( 'Y-m-d\TH:i:s\Z' ),
		] );

		$item_header = wp_json_encode( [
			'type' => 'event',
			'length' => strlen( $event_json ),
			'content_type' => 'application/json',
		] );

		return "{$envelope_header}\n{$item_header}\n{$event_json}";
	}

	private function send( Dsn $dsn, $envelope ) {
		if ( '' === $envelope ) {
			return;
		}

		wp_safe_remote_post(
			$dsn->get_envelope_url(),
			[
				'timeout' => self::REQUEST_TIMEOUT,
				'blocking' => false,
				'headers' => [
					'Content-Type' => 'application/x-sentry-envelope',
					'X-Sentry-Auth' => sprintf(
						'Sentry sentry_version=7, sentry_client=elementor/%s, sentry_key=%s',
						ELEMENTOR_VERSION,
						$dsn->get_public_key()
					),
				],
				'body' => $envelope,
			]
		);
	}
}
