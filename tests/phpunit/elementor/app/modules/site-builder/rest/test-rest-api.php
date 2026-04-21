<?php
namespace Elementor\Tests\Phpunit\Elementor\App\Modules\SiteBuilder\Rest;

use Elementor\App\Modules\SiteBuilder\Rest\Rest_Api;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

class Test_Rest_Api extends \WP_UnitTestCase {

	private const ROUTE = '/elementor/v1/site-builder/home-screen';
	private const SNAPSHOT_ROUTE = '/elementor/v1/site-builder/snapshot';

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

	public function test_get_snapshot_returns_data() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

		update_option( 'elementor_site_builder_snapshot', [ 'test-key' => [ 'step' => 2 ] ] );

		$request = new WP_REST_Request( 'GET', self::SNAPSHOT_ROUTE );
		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
		$this->assertEquals( [ 'test-key' => [ 'step' => 2 ] ], $data['data']['value'] );
	}

	public function test_update_snapshot_with_valid_data() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

		$request = new WP_REST_Request( 'POST', self::SNAPSHOT_ROUTE );
		$request->set_param( 'value', [ 'new-key' => [ 'step' => 3 ] ] );

		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
		$this->assertEquals( [ 'new-key' => [ 'step' => 3 ] ], get_option( 'elementor_site_builder_snapshot' ) );
	}

	public function test_update_snapshot_rejects_non_array() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

		$request = new WP_REST_Request( 'POST', self::SNAPSHOT_ROUTE );
		$request->set_param( 'value', 'not_an_array' );

		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_update_snapshot_requires_manage_options() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'subscriber' ] ) );

		$request = new WP_REST_Request( 'POST', self::SNAPSHOT_ROUTE );
		$request->set_param( 'value', [ 'key' => 'value' ] );

		$response = rest_do_request( $request );

		$this->assertContains( $response->get_status(), [ 401, 403 ] );
	}

	public function test_snapshot_endpoint_is_scoped_to_site_builder() {
		$routes = rest_get_server()->get_routes();

		$this->assertArrayHasKey( self::SNAPSHOT_ROUTE, $routes );

		$route = $routes[ self::SNAPSHOT_ROUTE ];

		$this->assertCount( 2, $route );

		$get_route = $route[0];
		$this->assertTrue( $get_route['methods']['GET'] );
		$this->assertIsCallable( $get_route['callback'] );

		$post_route = $route[1];
		$this->assertTrue( $post_route['methods']['POST'] || $post_route['methods']['PUT'] || $post_route['methods']['PATCH'] );
		$this->assertIsCallable( $post_route['callback'] );
	}
}
