<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Agents\Classes\Scanner_Client;
use Elementor\Modules\Agents\Classes\Scanner_Report_Store;
use Elementor\Modules\Agents\Classes\Scanner_Rest_Api;
use Elementor\Modules\Mcp\Abilities\Agent_Ready_Scan_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Agent_Ready_Scan_Ability extends Elementor_Test_Base {

	private Agent_Ready_Scan_Ability $ability;

	private int $remote_calls = 0;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Agent_Ready_Scan_Ability();
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

	private function get_report(): array {
		return [
			'url' => home_url(),
			'score' => 64,
			'scannedAt' => gmdate( 'c' ),
			'retryAt' => gmdate( 'c', time() + 300 ),
			'layers' => [],
			'checks' => [
				[
					'id' => 'sitemap',
					'label' => 'Sitemap exists',
					'fixBy' => 'Built In',
					'fixDetails' => 'Check WordPress sitemap settings.',
				],
			],
		];
	}

	public function test_check_permission__denies_non_admin() {
		// Arrange
		$this->act_as_subscriber();

		// Assert
		$this->assertFalse( $this->ability->check_permission() );
	}

	public function test_execute__read_returns_saved_report_and_retry_at() {
		// Arrange
		$this->act_as_admin();
		$report = [ 'score' => 42, 'checks' => [] ];
		update_option( Scanner_Report_Store::OPTION_LAST_REPORT, $report, false );
		set_transient( Scanner_Report_Store::TRANSIENT_RETRY_AT, time() + 120, 120 );

		// Act
		$result = $this->ability->execute( [ 'action' => 'read' ] );

		// Assert
		$this->assertSame( $report, $result['report'] );
		$this->assertNotEmpty( $result['retryAt'] );
	}

	public function test_execute__defaults_to_read() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute();

		// Assert
		$this->assertNull( $result['report'] );
		$this->assertNull( $result['retryAt'] );
	}

	public function test_execute__run_persists_report_like_rest() {
		// Arrange
		$this->act_as_admin();
		$this->mock_remote_response( 200, $this->get_report() );

		// Act
		$result = $this->ability->execute( [ 'action' => 'run' ] );

		// Assert
		$this->assertSame( 64, $result['report']['score'] );
		$this->assertNotEmpty( $result['retryAt'] );
		$this->assertSame( $result['report'], get_option( Scanner_Report_Store::OPTION_LAST_REPORT ) );
	}

	public function test_execute__run_returns_cooldown_without_second_remote_call() {
		// Arrange
		$this->act_as_admin();
		$this->mock_remote_response( 200, $this->get_report() );
		$this->ability->execute( [ 'action' => 'run' ] );

		// Act
		$result = $this->ability->execute( [ 'action' => 'run' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Scanner_Rest_Api::COOLDOWN_ERROR_CODE, $result->get_error_code() );
		$this->assertSame( \WP_Http::TOO_MANY_REQUESTS, $result->get_error_data()['status'] );
		$this->assertSame( Scanner_Client::REASON_THROTTLED, $result->get_error_data()['meta']['reason'] );
		$this->assertSame( 1, $this->remote_calls );
	}

	public function test_execute__run_maps_throttle_errors_with_retry_at() {
		// Arrange
		$this->act_as_admin();
		$this->mock_remote_response( 429, [ 'error' => 'Rate limit exceeded' ], [ 'retry-after' => '60' ] );

		// Act
		$result = $this->ability->execute( [ 'action' => 'run' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( Scanner_Client::ERROR_CODE, $result->get_error_code() );
		$this->assertSame( \WP_Http::TOO_MANY_REQUESTS, $result->get_error_data()['status'] );
		$this->assertSame( Scanner_Client::REASON_THROTTLED, $result->get_error_data()['meta']['reason'] );
		$this->assertNotEmpty( $result->get_error_data()['meta']['retryAt'] );
	}

	public function test_validate_input_against_schema__accepts_read_and_run() {
		// Act
		$read = $this->ability->validate_input_against_schema( [ 'action' => 'read' ] );
		$run  = $this->ability->validate_input_against_schema( [ 'action' => 'run' ] );

		// Assert
		$this->assertTrue( $read );
		$this->assertTrue( $run );
	}
}
