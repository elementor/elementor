<?php
namespace Elementor\Testing\Modules\CssConverter;

use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\CssConverter\Routes\Classes_Route;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group css-converter-api
 */
class Test_Classes_Route extends Elementor_Test_Base {
	private $route;
	private $server;

	public function setUp(): void {
		parent::setUp();
		
		global $wp_rest_server;
		$this->server = $wp_rest_server = new \WP_REST_Server();
		$this->route = new Classes_Route();
		
		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		parent::tearDown();
		global $wp_rest_server;
		$wp_rest_server = null;
	}

	public function test_route_registration() {
		$routes = $this->server->get_routes();
		$this->assertArrayHasKey( '/elementor/v2/css-converter/classes', $routes );
	}

	public function test_route_accepts_post_method() {
		$routes = $this->server->get_routes();
		$route = $routes['/elementor/v2/css-converter/classes'][0];
		$this->assertContains( 'POST', $route['methods'] );
	}

	public function test_successful_css_conversion() {
		$request = new WP_REST_Request( 'POST', '/elementor/v2/css-converter/classes' );
		$request->set_param( 'css', '.test-class { color: #ff0000; font-size: 16px; }' );
		$request->set_param( 'store', false );

		$response = $this->route->handle_classes_import( $request );

		$this->assertEquals( 200, $response->get_status() );
		
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
		$this->assertArrayHasKey( 'data', $data );
		
		$conversion_data = $data['data'];
		$this->assertEquals( 1, $conversion_data['stats']['classes_converted'] );
		$this->assertCount( 1, $conversion_data['converted_classes'] );
	}

	public function test_missing_css_parameter() {
		$request = new WP_REST_Request( 'POST', '/elementor/v2/css-converter/classes' );

		$response = $this->route->handle_classes_import( $request );

		$this->assertEquals( 400, $response->get_status() );
		
		$data = $response->get_data();
		$this->assertArrayHasKey( 'error', $data );
		$this->assertEquals( 'Missing url or css parameter', $data['error'] );
	}

	public function test_empty_css_parameter() {
		$request = new WP_REST_Request( 'POST', '/elementor/v2/css-converter/classes' );
		$request->set_param( 'css', '' );

		$response = $this->route->handle_classes_import( $request );

		$this->assertEquals( 422, $response->get_status() );
		
		$data = $response->get_data();
		$this->assertEquals( 'Empty CSS provided', $data['error'] );
	}

	public function test_invalid_css_handling() {
		$request = new WP_REST_Request( 'POST', '/elementor/v2/css-converter/classes' );
		$request->set_param( 'css', '.invalid-css { color: ; }' );
		$request->set_param( 'store', false );

		$response = $this->route->handle_classes_import( $request );

		// Should still succeed but with warnings or empty results
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_logs_creation() {
		$request = new WP_REST_Request( 'POST', '/elementor/v2/css-converter/classes' );
		$request->set_param( 'css', '.test { color: red; }' );
		$request->set_param( 'store', false );

		$response = $this->route->handle_classes_import( $request );
		$data = $response->get_data();

		$this->assertArrayHasKey( 'logs', $data['data'] );
		$this->assertArrayHasKey( 'css', $data['data']['logs'] );
		
		$css_log_path = $data['data']['logs']['css'];
		$this->assertFileExists( $css_log_path );
		$this->assertStringContainsString( '.test', file_get_contents( $css_log_path ) );
	}

	public function test_permission_callback() {
		// Test with admin user
		$admin_user = $this->factory->user->create( [ 'role' => 'administrator' ] );
		wp_set_current_user( $admin_user );
		$this->assertTrue( $this->route->check_permissions() );

		// Test with regular user
		$regular_user = $this->factory->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $regular_user );
		$this->assertFalse( $this->route->check_permissions() );

		// Test with no user
		wp_set_current_user( 0 );
		$this->assertFalse( $this->route->check_permissions() );
	}

	public function test_url_parameter_handling() {
		// Mock a simple HTTP response
		add_filter( 'pre_http_request', function( $preempt, $parsed_args, $url ) {
			if ( 'http://example.com/test.css' === $url ) {
				return [
					'response' => [ 'code' => 200 ],
					'headers' => [ 'content-type' => 'text/css' ],
					'body' => '.url-test { color: blue; }'
				];
			}
			return $preempt;
		}, 10, 3 );

		$request = new WP_REST_Request( 'POST', '/elementor/v2/css-converter/classes' );
		$request->set_param( 'url', 'http://example.com/test.css' );
		$request->set_param( 'store', false );

		$response = $this->route->handle_classes_import( $request );

		$this->assertEquals( 200, $response->get_status() );
		
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
		$this->assertEquals( 1, $data['data']['stats']['classes_converted'] );
	}
}
