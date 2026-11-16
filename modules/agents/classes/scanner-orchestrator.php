<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Api\Error_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Scanner_Orchestrator {

	const COOLDOWN_ERROR_CODE = 'agents_scanner_cooldown';

	private Scanner_Client $client;

	private Scanner_Report_Store $store;

	public function __construct( Scanner_Client $client, Scanner_Report_Store $store ) {
		$this->client = $client;
		$this->store  = $store;
	}

	/**
	 * @return array{report: ?array, retryAt: ?string}|\WP_Error
	 */
	public function read_saved_report() {
		return [
			'report'  => $this->store->get_last_report(),
			'retryAt' => $this->format_retry_at( $this->store->get_retry_at() ),
		];
	}

	/**
	 * @return array{report: array, retryAt: string}|\WP_Error
	 */
	public function run_scan() {
		$retry_at = $this->store->get_retry_at();

		if ( null !== $retry_at ) {
			return $this->cooldown_error( $retry_at );
		}

		$result = $this->client->scan();

		if ( is_wp_error( $result ) ) {
			return $this->scan_error( $result );
		}

		$result['scannedAt'] = $this->format_time( time() );

		$report   = $this->store->save_report( $result );
		$retry_at = $this->store->get_report_retry_at( $report );

		$this->store->start_cooldown( $retry_at );

		return [
			'report'  => $report,
			'retryAt' => $this->format_time( $retry_at ),
		];
	}

	private function cooldown_error( int $retry_at ): \WP_Error {
		return Error_Builder::make( self::COOLDOWN_ERROR_CODE, Scanner_Client::HTTP_TOO_MANY_REQUESTS )
			->set_message( __( 'Your site was scanned a moment ago. Please try again later.', 'elementor' ) )
			->set_meta( [
				'reason'  => Scanner_Client::REASON_THROTTLED,
				'retryAt' => $this->format_time( $retry_at ),
			] )
			->build();
	}

	private function scan_error( \WP_Error $error ): \WP_Error {
		$data     = (array) $error->get_error_data();
		$status   = (int) ( $data['status'] ?? Scanner_Client::HTTP_BAD_GATEWAY );
		$retry_at = isset( $data['retry_at'] ) ? (int) $data['retry_at'] : null;

		if ( null !== $retry_at ) {
			$this->store->start_cooldown( $retry_at );
		}

		return Error_Builder::make( $error->get_error_code(), $status )
			->set_message( $error->get_error_message() )
			->set_meta( [
				'reason'  => $data['reason'] ?? null,
				'retryAt' => null === $retry_at ? null : $this->format_time( $retry_at ),
			] )
			->build();
	}

	private function format_retry_at( ?int $retry_at ): ?string {
		return null === $retry_at ? null : $this->format_time( $retry_at );
	}

	private function format_time( int $timestamp ): string {
		return gmdate( 'c', $timestamp );
	}
}
