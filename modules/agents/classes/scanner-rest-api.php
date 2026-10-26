<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Api\Error_Builder;
use Elementor\Core\Utils\Api\Response_Builder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Scanner_Rest_Api {

	const API_NAMESPACE = 'elementor/v1';

	const ROUTE = '/agents-ready/scan';

	const COOLDOWN_ERROR_CODE = 'agents_scanner_cooldown';

	private Scanner_Client $client;

	private Scanner_Report_Store $store;

	public function __construct( Scanner_Client $client, Scanner_Report_Store $store ) {
		$this->client = $client;
		$this->store  = $store;
	}

	public function register_hooks(): void {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes(): void {
		register_rest_route( self::API_NAMESPACE, self::ROUTE, [
			'methods'             => \WP_REST_Server::CREATABLE,
			'callback'            => [ $this, 'scan' ],
			'permission_callback' => fn() => current_user_can( 'manage_options' ),
		] );
	}

	/**
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function scan() {
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

		return Response_Builder::make( [
			'report'  => $report,
			'retryAt' => $this->format_time( $retry_at ),
		] )->build();
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

	private function format_time( int $timestamp ): string {
		return gmdate( 'c', $timestamp );
	}
}
