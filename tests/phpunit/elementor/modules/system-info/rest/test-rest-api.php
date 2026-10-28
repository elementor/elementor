<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\System_Info\Rest;

use Elementor\Modules\System_Info\Rest\Rest_Api;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

class Test_Rest_Api extends Elementor_Test_Base {

	private const ROUTE = '/elementor/v1/system-info';

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();
		do_action( 'rest_api_init' );
	}

	public function test_register_routes__registers_system_info_endpoint() {
		// Arrange
		$routes = rest_get_server()->get_routes();

		// Assert
		$this->assertArrayHasKey( self::ROUTE, $routes );

		$route = $routes[ self::ROUTE ][0];
		$this->assertTrue( $route['methods']['GET'] );
		$this->assertIsCallable( $route['callback'] );
		$this->assertIsCallable( $route['permission_callback'] );
	}

	public function test_check_permission__requires_manage_options() {
		// Arrange
		$rest_api = new Rest_Api();

		// Act + Assert
		$this->act_as_subscriber();
		$this->assertFalse( $rest_api->check_permission() );

		$this->act_as_admin();
		$this->assertTrue( $rest_api->check_permission() );
	}

	public function test_get_system_info__forbidden_for_subscriber() {
		// Arrange
		$this->act_as_subscriber();
		$request = new WP_REST_Request( 'GET', self::ROUTE );

		// Act
		$response = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertSame( 403, $response->get_status() );
	}

	public function test_get_system_info__returns_reports_for_admin() {
		// Arrange
		$this->act_as_admin();
		$request = new WP_REST_Request( 'GET', self::ROUTE );

		// Act
		$response = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data();
		$this->assertArrayHasKey( 'data', $data );
		$this->assertArrayHasKey( 'server', $data['data'] );
		$this->assertArrayHasKey( 'wordpress', $data['data'] );
		$this->assertArrayHasKey( 'label', $data['data']['server'] );
		$this->assertArrayHasKey( 'report', $data['data']['server'] );
		$this->assertNotEmpty( $data['data']['server']['report'] );
	}
}
