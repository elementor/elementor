<?php

namespace Elementor\Modules\Agents\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Scanner_Client {

	const DEFAULT_API_URL = 'https://my.elementor.com/apps/api/v1/is-agentic/wordpress/scan';

	const DEFAULT_TIMEOUT = 90;

	const TEST_TYPE = 'wordpress';

	const ERROR_CODE = 'agents_scanner_failed';

	const REASON_LOCAL = 'local';

	const REASON_THROTTLED = 'throttled';

	const REASON_TIMEOUT = 'timeout';

	const HTTP_OK = 200;

	const HTTP_BAD_REQUEST = 400;

	const HTTP_UNPROCESSABLE_ENTITY = 422;

	const HTTP_TOO_MANY_REQUESTS = 429;

	const HTTP_BAD_GATEWAY = 502;

	const HTTP_SERVICE_UNAVAILABLE = 503;

	const HTTP_GATEWAY_TIMEOUT = 504;

	const CURL_TIMEOUT_ERROR = 'cURL error 28';

	/**
	 * @return array|\WP_Error The decoded scan report, or an error carrying `status`, `reason` and `retry_at` (Unix timestamp) data.
	 */
	public function scan() {
		$response = wp_remote_post( $this->get_api_url(), [
			'timeout' => $this->get_timeout(),
			'headers' => [
				'Content-Type' => 'application/json',
				'Accept' => 'application/json',
			],
			'body' => wp_json_encode( [
				'url' => $this->get_site_url(),
				'testType' => self::TEST_TYPE,
			] ),
		] );

		if ( is_wp_error( $response ) ) {
			return $this->transport_error( $response );
		}

		$status = (int) wp_remote_retrieve_response_code( $response );

		if ( self::HTTP_OK !== $status ) {
			return $this->upstream_error( $status, $response );
		}

		$report = json_decode( wp_remote_retrieve_body( $response ), true );

		if ( ! is_array( $report ) || ! isset( $report['checks'] ) ) {
			return $this->error( self::HTTP_BAD_GATEWAY, __( 'The scanner returned an unexpected response.', 'elementor' ) );
		}

		return $report;
	}

	public function get_api_url(): string {
		/**
		 * Filters the scan service endpoint used by the Agent Ready scanner.
		 *
		 * @param string $api_url Scan service URL.
		 */
		return (string) apply_filters( 'elementor/agents/scanner/api_url', self::DEFAULT_API_URL );
	}

	public function get_site_url(): string {
		/**
		 * Filters the site URL sent to the scan service.
		 *
		 * @param string $site_url URL to scan.
		 */
		return (string) apply_filters( 'elementor/agents/scanner/site_url', home_url( '/' ) );
	}

	private function get_timeout(): int {
		/**
		 * Filters how long (in seconds) to wait for the scan service to finish a scan.
		 *
		 * @param int $timeout Request timeout in seconds.
		 */
		return max( 1, (int) apply_filters( 'elementor/agents/scanner/timeout', self::DEFAULT_TIMEOUT ) );
	}

	private function transport_error( \WP_Error $error ): \WP_Error {
		if ( $this->is_timeout( $error ) ) {
			return $this->error(
				self::HTTP_GATEWAY_TIMEOUT,
				__( 'The scan took too long to finish.', 'elementor' ),
				self::REASON_TIMEOUT
			);
		}

		return $this->error( self::HTTP_BAD_GATEWAY, __( 'We couldn\'t reach the scanner.', 'elementor' ) );
	}

	private function is_timeout( \WP_Error $error ): bool {
		$message = $error->get_error_message();

		return false !== strpos( $message, self::CURL_TIMEOUT_ERROR ) || false !== stripos( $message, 'timed out' );
	}

	private function upstream_error( int $status, array $response ): \WP_Error {
		switch ( $status ) {
			case self::HTTP_BAD_REQUEST:
				return $this->error(
					self::HTTP_UNPROCESSABLE_ENTITY,
					__( 'This site can\'t be scanned from outside.', 'elementor' ),
					self::REASON_LOCAL
				);

			case self::HTTP_TOO_MANY_REQUESTS:
				return $this->error(
					self::HTTP_TOO_MANY_REQUESTS,
					__( 'Too many scans. Please try again later.', 'elementor' ),
					self::REASON_THROTTLED,
					time() + $this->get_retry_after( $response )
				);

			case self::HTTP_SERVICE_UNAVAILABLE:
				return $this->error( self::HTTP_SERVICE_UNAVAILABLE, __( 'The scanner is unavailable right now.', 'elementor' ) );

			default:
				return $this->error( self::HTTP_BAD_GATEWAY, __( 'The scan failed.', 'elementor' ) );
		}
	}

	private function get_retry_after( array $response ): int {
		$retry_after = wp_remote_retrieve_header( $response, 'retry-after' );

		if ( is_numeric( $retry_after ) && (int) $retry_after > 0 ) {
			return (int) $retry_after;
		}

		$retry_at = is_string( $retry_after ) ? strtotime( $retry_after ) : false;

		if ( false !== $retry_at && $retry_at > time() ) {
			return $retry_at - time();
		}

		return Scanner_Report_Store::DEFAULT_COOLDOWN;
	}

	private function error( int $status, string $message, ?string $reason = null, ?int $retry_at = null ): \WP_Error {
		return new \WP_Error( self::ERROR_CODE, $message, [
			'status' => $status,
			'reason' => $reason,
			'retry_at' => $retry_at,
		] );
	}
}
