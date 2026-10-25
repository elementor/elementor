<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Classes\Scanner_Client;
use Elementor\Modules\Agents\Classes\Scanner_Report_Store;
use Elementor\Modules\Agents\Classes\Scanner_Rest_Api;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Scanner_Rest_Api extends Elementor_Test_Base {

	const ROUTE = '/elementor/v1/agents-ready/scan';

	const RETRY_AFTER_SECONDS = 60;

	const STALE_SCANNED_AT = '2020-01-01T00:00:00+00:00';

	private int $remote_calls = 0;

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Scanner_Rest_Api( new Scanner_Client(), new Scanner_Report_Store() ) )->register_hooks();

		do_action( 'rest_api_init' );

		$this->remote_calls = 0;

		delete_option( Scanner_Report_Store::OPTION_LAST_REPORT );
		delete_transient( Scanner_Report_Store::TRANSIENT_RETRY_AT );
	}

	public function tearDown(): void {
		delete_option( Scanner_Report_Store::OPTION_LAST_REPORT );
		delete_transient( Scanner_Report_Store::TRANSIENT_RETRY_AT );

		parent::tearDown();
	}

	private function mock_remote_response( int $status, array $body, array $headers = [] ): void {
		add_filter( 'pre_http_request', function ( $preempt, $args, $url ) use ( $status, $body, $headers ) {
			if ( Scanner_Client::DEFAULT_API_URL !== $url ) {
				return $preempt;
			}

			$this->remote_calls++;

			return [
				'response' => [ 'code' => $status ],
				'headers' => $headers,
				'body' => wp_json_encode( $body ),
			];
		}, 10, 3 );
	}

	private function get_report( int $retry_in_seconds = 300 ): array {
		return [
			'url' => home_url(),
			'score' => 64,
			'scannedAt' => gmdate( 'c' ),
			'retryAt' => gmdate( 'c', time() + $retry_in_seconds ),
			'grade' => 'C',
			'testTypes' => [ [ 'id' => 'full' ] ],
			'layers' => [
				'discovery' => [ 'weight' => 20, 'earned' => 4, 'possible' => 5 ],
			],
			'checks' => [
				[
					'id' => 'sitemap',
					'label' => 'Sitemap exists',
					'layer' => 'accessibility',
					'task' => 'Find',
					'status' => 'pass',
					'testTypes' => [ 'wordpress' ],
					'failureRecommendation' => 'Add a sitemap.',
					'fixBy' => 'Built In',
					'fixDetails' => 'Check WordPress sitemap settings.',
				],
			],
		];
	}

	private function dispatch(): \WP_REST_Response {
		return rest_get_server()->dispatch( new \WP_REST_Request( 'POST', self::ROUTE ) );
	}

	public function test_scan__stores_the_trimmed_report_and_starts_the_cooldown() {
		// Arrange
		$this->act_as_admin();
		$this->mock_remote_response( 200, $this->get_report() );

		// Act
		$response = $this->dispatch();

		// Assert
		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data()['data'];
		$stored = get_option( Scanner_Report_Store::OPTION_LAST_REPORT );

		$this->assertSame( 64, $data['report']['score'] );
		$this->assertNotEmpty( $data['retryAt'] );
		$this->assertSame( $data['report'], $stored );
		$this->assertArrayNotHasKey( 'testTypes', $stored );
		$this->assertArrayNotHasKey( 'grade', $stored );
		$this->assertArrayNotHasKey( 'testTypes', $stored['checks'][0] );
		$this->assertArrayNotHasKey( 'failureRecommendation', $stored['checks'][0] );
		$this->assertSame( 'Find', $stored['checks'][0]['task'] );
		$this->assertSame( 'Built In', $stored['checks'][0]['fixBy'] );
		$this->assertSame( 'Check WordPress sitemap settings.', $stored['checks'][0]['fixDetails'] );
		$this->assertGreaterThan( time(), (int) get_transient( Scanner_Report_Store::TRANSIENT_RETRY_AT ) );
	}

	public function test_scan__stamps_scanned_at_when_the_service_returns_a_stale_timestamp() {
		// Arrange
		$this->act_as_admin();
		$report = $this->get_report();
		$report['scannedAt'] = self::STALE_SCANNED_AT;
		$this->mock_remote_response( 200, $report );
		$started_at = time();

		// Act
		$response = $this->dispatch();

		// Assert
		$scanned_at = strtotime( $response->get_data()['data']['report']['scannedAt'] );
		$stored = get_option( Scanner_Report_Store::OPTION_LAST_REPORT );

		$this->assertGreaterThanOrEqual( $started_at, $scanned_at );
		$this->assertLessThanOrEqual( time(), $scanned_at );
		$this->assertSame( $response->get_data()['data']['report']['scannedAt'], $stored['scannedAt'] );
	}

	public function test_scan__returns_429_without_calling_the_service_during_the_cooldown() {
		// Arrange
		$this->act_as_admin();
		$this->mock_remote_response( 200, $this->get_report() );
		$this->dispatch();
		$stored_before = get_option( Scanner_Report_Store::OPTION_LAST_REPORT );

		// Act
		$response = $this->dispatch();

		// Assert
		$this->assertSame( 429, $response->get_status() );
		$this->assertSame( 1, $this->remote_calls );
		$this->assertSame( Scanner_Client::REASON_THROTTLED, $response->get_data()['data']['meta']['reason'] );
		$this->assertNotEmpty( $response->get_data()['data']['meta']['retryAt'] );
		$this->assertSame( $stored_before, get_option( Scanner_Report_Store::OPTION_LAST_REPORT ) );
	}

	public function test_scan__keeps_the_previous_report_and_starts_the_cooldown_when_the_service_throttles() {
		// Arrange
		$this->act_as_admin();
		$previous_report = [ 'score' => 50, 'checks' => [] ];
		update_option( Scanner_Report_Store::OPTION_LAST_REPORT, $previous_report, false );
		$this->mock_remote_response( 429, [ 'error' => 'Rate limit exceeded' ], [ 'retry-after' => (string) self::RETRY_AFTER_SECONDS ] );

		// Act
		$response = $this->dispatch();

		// Assert
		$this->assertSame( 429, $response->get_status() );
		$this->assertSame( Scanner_Client::REASON_THROTTLED, $response->get_data()['data']['meta']['reason'] );
		$this->assertSame( $previous_report, get_option( Scanner_Report_Store::OPTION_LAST_REPORT ) );

		$retry_at = (int) get_transient( Scanner_Report_Store::TRANSIENT_RETRY_AT );

		$this->assertGreaterThan( time(), $retry_at );
		$this->assertLessThanOrEqual( time() + self::RETRY_AFTER_SECONDS, $retry_at );
	}

	public function test_scan__uses_the_default_cooldown_when_a_throttle_has_no_retry_after() {
		// Arrange
		$this->act_as_admin();
		$this->mock_remote_response( 429, [ 'error' => 'Rate limit exceeded' ] );
		$started_at = time();

		// Act
		$response = $this->dispatch();

		// Assert
		$retry_at = (int) get_transient( Scanner_Report_Store::TRANSIENT_RETRY_AT );

		$this->assertSame( 429, $response->get_status() );
		$this->assertSame( Scanner_Client::REASON_THROTTLED, $response->get_data()['data']['meta']['reason'] );
		$this->assertFalse( get_option( Scanner_Report_Store::OPTION_LAST_REPORT ) );
		$this->assertGreaterThanOrEqual( $started_at + Scanner_Report_Store::DEFAULT_COOLDOWN, $retry_at );
		$this->assertLessThanOrEqual( time() + Scanner_Report_Store::DEFAULT_COOLDOWN, $retry_at );
	}

	public function test_scan__maps_an_unscannable_site_url_to_the_local_reason() {
		// Arrange
		$this->act_as_admin();
		$this->mock_remote_response( 400, [ 'error' => 'Invalid URL' ] );

		// Act
		$response = $this->dispatch();

		// Assert
		$this->assertSame( 422, $response->get_status() );
		$this->assertSame( Scanner_Client::REASON_LOCAL, $response->get_data()['data']['meta']['reason'] );
		$this->assertFalse( get_option( Scanner_Report_Store::OPTION_LAST_REPORT ) );
		$this->assertFalse( get_transient( Scanner_Report_Store::TRANSIENT_RETRY_AT ) );
	}

	public function test_scan__rejects_users_without_manage_options() {
		// Arrange
		$this->act_as_subscriber();
		$this->mock_remote_response( 200, $this->get_report() );

		// Act
		$response = $this->dispatch();

		// Assert
		$this->assertSame( 403, $response->get_status() );
		$this->assertSame( 0, $this->remote_calls );
	}
}
