<?php
namespace Elementor\Tests\Phpunit\Elementor\App\Modules\SiteBuilder\Rest;

use Elementor\App\Modules\SiteBuilder\Rest\Rest_Api;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class Test_Rest_Api extends \WP_UnitTestCase {

	private const ROUTE = '/elementor/v1/site-builder/home-screen';

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();
		do_action( 'rest_api_init' );

		( new Rest_Api() )->register_routes();
	}

	public function test_register_routes__registers_home_screen_endpoint() {
		$routes = rest_get_server()->get_routes();

		$this->assertArrayHasKey( self::ROUTE, $routes );

		$route = $routes[ self::ROUTE ][0];

		$this->assertTrue( $route['methods']['GET'] );
		$this->assertIsCallable( $route['callback'] );
		$this->assertIsCallable( $route['permission_callback'] );
	}

	public function test_register_routes__permission_callback_requires_manage_options() {
		$routes = rest_get_server()->get_routes();
		$permission_callback = $routes[ self::ROUTE ][0]['permission_callback'];

		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$this->assertFalse( (bool) $permission_callback() );

		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );
		$this->assertTrue( (bool) $permission_callback() );
	}

	public function test_get_home_screen__returns_wp_error_when_connect_app_unavailable() {
		$response = ( new Rest_Api() )->get_home_screen();

		$this->assertInstanceOf( WP_Error::class, $response );
		$this->assertSame( 'site_builder_unavailable', $response->get_error_code() );
		$this->assertSame( 503, $response->get_error_data()['status'] );
	}

	public function test_get_home_screen__via_rest_do_request_returns_503_when_unavailable() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

		$request = new WP_REST_Request( 'GET', self::ROUTE );
		$response = rest_do_request( $request );

		$this->assertSame( 503, $response->get_status() );
		$data = $response->get_data();
		$this->assertSame( 'site_builder_unavailable', $data['code'] );
	}

	public function test_get_home_screen__via_rest_do_request_is_rejected_for_non_admin() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );

		$request = new WP_REST_Request( 'GET', self::ROUTE );
		$response = rest_do_request( $request );

		$this->assertContains( $response->get_status(), [ 401, 403 ] );
	}
}
