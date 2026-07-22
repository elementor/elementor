<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\EventsManager\RestApi;

use Elementor\Core\Common\Modules\EventsManager\RestApi\Events_Proxy_REST_API;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Events_Proxy_REST_API extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Events_Proxy_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );

		// Registered at a high priority so it always has final say over the per-test upstream
		// mocks below, which don't discriminate by URL and would otherwise also swallow this
		// unrelated remote-config fetch that Module::get_mixpanel_api_host()/get_mixpanel_lib_host()
		// trigger on demand.
		add_filter( 'pre_http_request', function ( $preempt, $args, $url ) {
			if ( false === strpos( $url, 'assets.elementor.com' ) ) {
				return $preempt;
			}

			return [
				'response' => [ 'code' => 200 ],
				'headers' => [],
				'body' => wp_json_encode( [
					'mixpanel' => [
						[
							'apiHost' => 'https://api-eu.mixpanel.com',
							'libHost' => 'https://cdn.mxpnl.com/libs',
						],
					],
				] ),
			];
		}, 20, 3 );
	}

	private function seed_remote_mixpanel_config( array $config ): void {
		update_option( '_elementor_mixpanel_config', [
			'timeout' => current_time( 'timestamp' ) + HOUR_IN_SECONDS,
			'value' => wp_json_encode( $config ),
		] );
	}

	public function test_registers_the_api_and_libs_routes() {
		// Arrange
		// Act
		$routes = $GLOBALS['wp_rest_server']->get_routes();

		// Assert
		$this->assertArrayHasKey( '/elementor/v1/events/api/(?P<path>.+)', $routes );
		$this->assertArrayHasKey( '/elementor/v1/events/libs/(?P<file>[\w\-.]+)', $routes );
	}

	public function test_api_route_rejects_anonymous_users() {
		// Arrange
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/events/api/track' );

		// Act
		$response = $GLOBALS['wp_rest_server']->dispatch( $request );

		// Assert
		$this->assertEquals( 401, $response->get_status() );
	}

	public function test_api_route_rejects_users_without_edit_posts_capability() {
		// Arrange
		$this->act_as_subscriber();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/events/api/track' );

		// Act
		$response = $GLOBALS['wp_rest_server']->dispatch( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_libs_route_rejects_anonymous_users() {
		// Arrange
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/events/libs/recorder.min.js' );

		// Act
		$response = $GLOBALS['wp_rest_server']->dispatch( $request );

		// Assert
		$this->assertEquals( 401, $response->get_status() );
	}

	public function test_api_request_is_forwarded_to_the_fixed_upstream_host_with_headers() {
		// Arrange
		$this->act_as_admin();

		$captured = null;

		add_filter( 'pre_http_request', function ( $preempt, $args, $url ) use ( &$captured ) {
			$captured = [
				'url' => $url,
				'args' => $args,
			];

			return [
				'response' => [ 'code' => 200 ],
				'headers' => [ 'content-type' => 'text/plain' ],
				'body' => '1',
			];
		}, 10, 3 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/events/api/flags' );
		$request->set_query_params( [ 'ip' => '1' ] );
		$request->set_header( 'content-type', 'application/x-www-form-urlencoded' );
		$request->set_header( 'authorization', 'Basic abc123' );
		$request->set_body( 'data=abc' );

		// Act
		$response = $GLOBALS['wp_rest_server']->dispatch( $request );

		// Assert
		$this->assertEquals( 'https://api-eu.mixpanel.com/flags?ip=1', $captured['url'] );
		$this->assertEquals( 'POST', $captured['args']['method'] );
		$this->assertEquals( 'data=abc', $captured['args']['body'] );
		$this->assertEquals( 'application/x-www-form-urlencoded', $captured['args']['headers']['content-type'] );
		$this->assertEquals( 'Basic abc123', $captured['args']['headers']['authorization'] );
		$this->assertTrue( $captured['args']['blocking'] );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( '1', $response->get_data() );
	}

	/**
	 * track/engage/groups/record are fire-and-forget writes the SDK doesn't wait on, so the
	 * proxy must dispatch them without blocking and reply immediately with Mixpanel's normal
	 * success shape (status 200, body "1"), instead of waiting on the real upstream response.
	 */
	public function test_fire_and_forget_paths_are_dispatched_asynchronously_and_reply_immediately() {
		// Arrange
		$this->act_as_admin();

		$captured = null;

		add_filter( 'pre_http_request', function ( $preempt, $args, $url ) use ( &$captured ) {
			$captured = [
				'url' => $url,
				'args' => $args,
			];

			return new \WP_Error( 'http_request_failed', 'Should not affect the response' );
		}, 10, 3 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/events/api/track' );
		$request->set_body( 'data=abc' );

		// Act
		$response = $GLOBALS['wp_rest_server']->dispatch( $request );

		// Assert
		$this->assertEquals( 'https://api-eu.mixpanel.com/track', $captured['url'] );
		$this->assertFalse( $captured['args']['blocking'] );
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( '1', $response->get_data() );
	}

	public function test_libs_request_is_forwarded_to_the_fixed_cdn_host() {
		// Arrange
		$this->act_as_admin();

		$captured_url = null;

		add_filter( 'pre_http_request', function ( $preempt, $args, $url ) use ( &$captured_url ) {
			$captured_url = $url;

			return [
				'response' => [ 'code' => 200 ],
				'headers' => [ 'content-type' => 'application/javascript' ],
				'body' => 'console.log(1);',
			];
		}, 10, 3 );

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/events/libs/recorder.min.js' );

		// Act
		$response = $GLOBALS['wp_rest_server']->dispatch( $request );

		// Assert
		$this->assertEquals( 'https://cdn.mxpnl.com/libs/recorder.min.js', $captured_url );
		$this->assertEquals( 'console.log(1);', $response->get_data() );
	}

	public function test_api_route_rejects_unsupported_http_method() {
		// Arrange
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'DELETE', '/elementor/v1/events/api/track' );

		// Act
		$response = $GLOBALS['wp_rest_server']->dispatch( $request );

		// Assert
		$this->assertEquals( 404, $response->get_status() );
	}

	public function test_oversized_body_is_rejected_with_413_before_forwarding() {
		// Arrange
		$this->act_as_admin();

		$request_sent = false;

		add_filter( 'pre_http_request', function ( $preempt, $args, $url ) use ( &$request_sent ) {
			if ( false === strpos( $url, 'assets.elementor.com' ) ) {
				$request_sent = true;
			}

			return $preempt;
		}, 10, 3 );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/events/api/track' );
		$request->set_body( str_repeat( 'a', 10 * MB_IN_BYTES + 1 ) );

		// Act
		$response = $GLOBALS['wp_rest_server']->dispatch( $request );

		// Assert
		$this->assertFalse( $request_sent );
		$this->assertEquals( 413, $response->get_status() );
	}

	public function test_upstream_failure_is_surfaced_as_a_502() {
		// Arrange
		$this->act_as_admin();

		add_filter( 'pre_http_request', function () {
			return new \WP_Error( 'http_request_failed', 'Could not resolve host' );
		} );

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/events/api/flags' );

		// Act
		$response = $GLOBALS['wp_rest_server']->dispatch( $request );

		// Assert
		$this->assertEquals( 502, $response->get_status() );
	}

	/**
	 * The SDK cannot supply a WP REST nonce, so this route must stay reachable for logged-in Editor sessions
	 * even though WordPress' cookie-auth layer would otherwise demand one. Exercised directly against the
	 * filter callback, since simulating WP's real cookie-auth nonce flow in PHPUnit is not practical.
	 */
	public function test_nonce_check_is_bypassed_for_its_own_route_but_not_for_other_routes() {
		// Arrange
		$proxy = new Events_Proxy_REST_API();
		$existing_error = new \WP_Error( 'rest_cookie_invalid_nonce', 'Cookie check failed' );

		// Act
		$_SERVER['REQUEST_URI'] = '/wp-json/elementor/v1/events/api/track';
		$own_route_result = $proxy->bypass_nonce_check_for_own_routes( $existing_error );

		$_SERVER['REQUEST_URI'] = '/wp-json/wp/v2/posts';
		$other_route_result = $proxy->bypass_nonce_check_for_own_routes( $existing_error );

		unset( $_SERVER['REQUEST_URI'] );

		// Assert
		$this->assertTrue( $own_route_result );
		$this->assertSame( $existing_error, $other_route_result );
	}

	public function test_raw_response_filter_echoes_the_upstream_body_and_marks_the_request_served() {
		// Arrange
		$proxy = new Events_Proxy_REST_API();
		$response = new \WP_REST_Response( 'console.log(1);', 200 );
		$response->header( 'Content-Type', 'application/javascript' );
		$response->header( Events_Proxy_REST_API::RAW_RESPONSE_HEADER, '1' );

		// Act
		ob_start();
		$served = $proxy->maybe_serve_raw_response( false, $response );
		$output = ob_get_clean();

		// Assert
		$this->assertTrue( $served );
		$this->assertEquals( 'console.log(1);', $output );
	}

	public function test_raw_response_filter_ignores_responses_without_the_raw_marker() {
		// Arrange
		$proxy = new Events_Proxy_REST_API();
		$response = new \WP_REST_Response( [ 'data' => 'unrelated' ], 200 );

		// Act
		$served = $proxy->maybe_serve_raw_response( false, $response );

		// Assert
		$this->assertFalse( $served );
	}
}
