<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Logger;

use Elementor\Core\Logger\Sentry\Dsn;
use Elementor\Core\Logger\Sentry\Reporter;
use Elementor\Core\Logger\Sentry\Sampler;
use Elementor\Core\Logger\Sentry\Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Sentry_Reporter extends Elementor_Test_Base {

	const VALID_DSN = 'https://abcdef0123456789abcdef0123456789@o123.ingest.sentry.io/456789';

	private $captured_request;

	private $request_count = 0;

	public function setUp(): void {
		parent::setUp();

		$this->captured_request = null;
		$this->request_count = 0;

		update_option( 'elementor_allow_tracking', 'yes' );
		delete_transient( Reporter::TRANSIENT_PREFIX . md5( 'E_ERROR|Test fatal error|core/logger/manager.php' ) );

		add_filter( 'elementor/logger/sentry_dsn', [ $this, 'filter_valid_dsn' ] );
		add_filter( 'elementor/logger/sentry_sample_rate', [ $this, 'filter_full_sample_rate' ] );
		add_filter( 'pre_http_request', [ $this, 'capture_http_request' ], 10, 3 );
	}

	public function tearDown(): void {
		remove_filter( 'elementor/logger/sentry_dsn', [ $this, 'filter_valid_dsn' ] );
		remove_filter( 'elementor/logger/sentry_sample_rate', [ $this, 'filter_full_sample_rate' ] );
		remove_filter( 'pre_http_request', [ $this, 'capture_http_request' ], 10 );

		update_option( 'elementor_allow_tracking', 'no' );
		remove_all_filters( 'elementor/logger/sentry_dsn' );
		remove_all_filters( 'elementor/logger/sentry_sample_rate' );
		remove_all_filters( 'elementor/logger/sentry_throttle_interval' );

		parent::tearDown();
	}

	public function filter_valid_dsn() {
		return self::VALID_DSN;
	}

	public function filter_full_sample_rate() {
		return 1.0;
	}

	public function filter_related_paths( $paths ) {
		$paths[] = '/opt/wordpress/plugins/elementor-pro/';

		return $paths;
	}

	public function capture_http_request( $preempt, $parsed_args, $url ) {
		++$this->request_count;
		$this->captured_request = [
			'url' => $url,
			'args' => $parsed_args,
		];

		return [
			'response' => [ 'code' => 200 ],
			'body' => '',
		];
	}

	private function get_elementor_error( $overrides = [] ) {
		return array_merge( [
			'type' => E_ERROR,
			'message' => 'Test fatal error',
			'file' => ELEMENTOR_PATH . 'core/logger/manager.php',
			'line' => 42,
		], $overrides );
	}

	private function get_envelope_parts_from_captured_request() {
		$lines = explode( "\n", $this->captured_request['args']['body'] );

		return [
			'header' => json_decode( $lines[0], true ),
			'item_header' => json_decode( $lines[1], true ),
			'event' => json_decode( $lines[2], true ),
		];
	}

	private function get_event_from_captured_request() {
		return $this->get_envelope_parts_from_captured_request()['event'];
	}

	public function test_report_does_not_send_without_tracking_consent() {
		// Arrange
		update_option( 'elementor_allow_tracking', 'no' );
		$reporter = new Reporter();

		// Act
		$reporter->report( $this->get_elementor_error() );

		// Assert
		$this->assertNull( $this->captured_request );
	}

	public function test_report_does_not_send_without_dsn() {
		// Arrange
		remove_filter( 'elementor/logger/sentry_dsn', [ $this, 'filter_valid_dsn' ] );
		add_filter( 'elementor/logger/sentry_dsn', '__return_empty_string' );
		$reporter = new Reporter();

		// Act
		$reporter->report( $this->get_elementor_error() );

		// Assert
		$this->assertNull( $this->captured_request );
	}

	/**
	 * @dataProvider invalid_dsn_provider
	 */
	public function test_dsn_parse_rejects_invalid_dsn( $dsn ) {
		// Arrange

		// Act
		$parsed = Dsn::parse( $dsn );

		// Assert
		$this->assertNull( $parsed );
	}

	public function invalid_dsn_provider() {
		return [
			[ '' ],
			[ 'not-a-dsn' ],
			[ 'http://abcdef0123456789abcdef0123456789@o123.ingest.sentry.io/456789' ],
			[ 'https://short@o123.ingest.sentry.io/456789' ],
			[ 'https://abcdef0123456789abcdef0123456789@o123.ingest.sentry.io/not-numeric' ],
		];
	}

	/**
	 * @dataProvider non_fatal_error_type_provider
	 */
	public function test_report_does_not_send_for_non_fatal_errors( $error_type ) {
		// Arrange
		$reporter = new Reporter();

		// Act
		$reporter->report( $this->get_elementor_error( [ 'type' => $error_type ] ) );

		// Assert
		$this->assertNull( $this->captured_request );
	}

	public function non_fatal_error_type_provider() {
		return [
			[ E_WARNING ],
			[ E_NOTICE ],
			[ E_DEPRECATED ],
			[ E_USER_DEPRECATED ],
		];
	}

	public function test_report_does_not_send_for_non_elementor_file() {
		// Arrange
		$reporter = new Reporter();

		// Act
		$reporter->report( $this->get_elementor_error( [
			'file' => '/tmp/not-elementor/file.php',
		] ) );

		// Assert
		$this->assertNull( $this->captured_request );
	}

	public function test_report_does_not_send_when_sample_rate_is_zero() {
		// Arrange
		remove_filter( 'elementor/logger/sentry_sample_rate', [ $this, 'filter_full_sample_rate' ] );
		add_filter( 'elementor/logger/sentry_sample_rate', '__return_zero' );
		$reporter = new Reporter();

		// Act
		$reporter->report( $this->get_elementor_error() );

		// Assert
		$this->assertNull( $this->captured_request );
	}

	public function test_report_sends_when_sample_rate_is_one() {
		// Arrange
		$reporter = new Reporter();

		// Act
		$reporter->report( $this->get_elementor_error() );

		// Assert
		$this->assertNotNull( $this->captured_request );
	}

	public function test_sampler_is_deterministic_for_same_fingerprint() {
		// Arrange
		$sampler = new Sampler();
		$fingerprint = [ 'E_ERROR', 'Test fatal error', 'core/logger/manager.php' ];
		$results = [];

		// Act
		for ( $i = 0; $i < 20; $i++ ) {
			$results[] = $sampler->should_sample( $fingerprint );
		}

		// Assert
		$this->assertEquals( 1, count( array_unique( $results, SORT_REGULAR ) ) );
	}

	public function test_sampler_clamps_sample_rate_to_valid_range() {
		// Arrange
		$sampler = new Sampler();

		add_filter( 'elementor/logger/sentry_sample_rate', function () {
			return 2.5;
		} );

		// Act
		$rate = $sampler->get_sample_rate();

		// Assert
		$this->assertEquals( 1.0, $rate );
	}

	public function test_report_sends_sanitized_payload_to_envelope_endpoint() {
		// Arrange
		$reporter = new Reporter();
		$message = 'Fatal error: Call to undefined function foo() in ' . ABSPATH . 'wp-content/plugins/elementor/test.php on line 99. Contact admin@example.com or visit https://example.com/path';

		// Act
		$reporter->report( $this->get_elementor_error( [
			'message' => $message,
		] ) );

		// Assert
		$this->assertNotNull( $this->captured_request );
		$this->assertEquals( 'https://o123.ingest.sentry.io/api/456789/envelope/', $this->captured_request['url'] );
		$this->assertEquals( 'application/x-sentry-envelope', $this->captured_request['args']['headers']['Content-Type'] );
		$this->assertFalse( $this->captured_request['args']['blocking'] );
		$this->assertEquals( Reporter::REQUEST_TIMEOUT, $this->captured_request['args']['timeout'] );

		$parts = $this->get_envelope_parts_from_captured_request();
		$exception_value = $parts['event']['exception']['values'][0]['value'];

		$this->assertEquals( $parts['event']['event_id'], $parts['header']['event_id'] );
		$this->assertNotEmpty( $parts['header']['sent_at'] );
		$this->assertStringContainsString( 'Call to undefined function foo()', $exception_value );
		$this->assertStringNotContainsString( ABSPATH, $exception_value );
		$this->assertStringNotContainsString( 'admin@example.com', $exception_value );
		$this->assertStringNotContainsString( 'https://example.com/path', $exception_value );
		$this->assertStringNotContainsString( 'on line 99', $exception_value );
		$this->assertEquals( 'core/logger/manager.php', $parts['event']['exception']['values'][0]['stacktrace']['frames'][0]['filename'] );
	}

	public function test_report_includes_release_and_tags() {
		// Arrange
		$reporter = new Reporter();

		// Act
		$reporter->report( $this->get_elementor_error( [
			'type' => E_USER_ERROR,
		] ) );

		// Assert
		$event = $this->get_event_from_captured_request();

		$this->assertEquals( 'elementor@' . ELEMENTOR_VERSION, $event['release'] );
		$this->assertEquals( 'php', $event['platform'] );
		$this->assertEquals( 'fatal', $event['level'] );
		$this->assertEquals( Reporter::LOGGER_IDENTIFIER, $event['logger'] );
		$this->assertEquals( ELEMENTOR_VERSION, $event['tags']['elementor_version'] );
		$this->assertEquals( PHP_VERSION, $event['tags']['php_version'] );
		$this->assertEquals( get_bloginfo( 'version' ), $event['tags']['wordpress_version'] );
		$this->assertEquals( 'E_USER_ERROR', $event['tags']['php_error_type'] );
	}

	public function test_report_throttles_duplicate_fingerprints() {
		// Arrange
		$reporter = new Reporter();
		$error = $this->get_elementor_error();

		// Act
		$reporter->report( $error );
		$reporter->report( $error );

		// Assert
		$this->assertEquals( 1, $this->request_count );
	}

	public function test_default_throttle_interval_is_one_day() {
		// Arrange

		// Act

		// Assert
		$this->assertEquals( DAY_IN_SECONDS, Reporter::THROTTLE_INTERVAL );
	}

	public function test_sanitizer_returns_generic_value_for_empty_message() {
		// Arrange
		$sanitizer = new Sanitizer();

		// Act
		$sanitized = $sanitizer->sanitize_message( '' );

		// Assert
		$this->assertEquals( Sanitizer::GENERIC_VALUE, $sanitized );
	}

	public function test_sanitizer_preserves_meaningful_message_when_removing_file_suffix() {
		// Arrange
		$sanitizer = new Sanitizer();
		$message = 'Fatal error: Uncaught Error: Class not found in SomeClass in ' . ABSPATH . 'wp-content/plugins/elementor/test.php on line 12';

		// Act
		$sanitized = $sanitizer->sanitize_message( $message );

		// Assert
		$this->assertStringContainsString( 'Uncaught Error: Class not found in SomeClass', $sanitized );
		$this->assertStringNotContainsString( 'on line 12', $sanitized );
		$this->assertStringNotContainsString( ABSPATH, $sanitized );
	}

	public function test_sanitizer_redacts_related_and_unknown_absolute_paths() {
		// Arrange
		$sanitizer = new Sanitizer();
		$message = 'Failure in /opt/wordpress/plugins/elementor-pro/module.php, /srv/private/plugin/file.php, and C:\Users\customer\plugin\file.php';
		add_filter( 'elementor/utils/elementor_related_paths', [ $this, 'filter_related_paths' ] );

		// Act
		$sanitized = $sanitizer->sanitize_message( $message );
		remove_filter( 'elementor/utils/elementor_related_paths', [ $this, 'filter_related_paths' ] );

		// Assert
		$this->assertStringNotContainsString( '/opt/wordpress/plugins/elementor-pro/', $sanitized );
		$this->assertStringNotContainsString( '/srv/private/plugin/file.php', $sanitized );
		$this->assertStringNotContainsString( 'C:\Users\customer\plugin\file.php', $sanitized );
	}

	public function test_sanitizer_returns_generic_value_for_invalid_utf8() {
		// Arrange
		$sanitizer = new Sanitizer();

		// Act
		$sanitized = $sanitizer->sanitize_message( "\xFF\xFE invalid" );

		// Assert
		$this->assertEquals( Sanitizer::GENERIC_VALUE, $sanitized );
	}

	public function test_dsn_parse_accepts_valid_https_dsn() {
		// Arrange

		// Act
		$parsed = Dsn::parse( self::VALID_DSN );

		// Assert
		$this->assertInstanceOf( Dsn::class, $parsed );
		$this->assertEquals( 'https://o123.ingest.sentry.io/api/456789/envelope/', $parsed->get_envelope_url() );
	}
}
