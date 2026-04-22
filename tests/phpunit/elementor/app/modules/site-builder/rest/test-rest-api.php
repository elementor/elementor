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

	public function test_get_home_screen__with_mocked_connected_app_returns_data_without_real_http() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

		$mock_app = $this->createMock( \Elementor\App\Modules\SiteBuilder\Connect\App::class );
		$mock_app->method( 'is_connected' )->willReturn( true );
		$mock_app->method( 'get_home_screen' )->willReturn( [
			'step' => 3,
			'sessionId' => 'mock-session',
			'pageNameSuggestions' => [ 'Home', 'About' ],
			'siteTypeSuggestions' => [ 'Business website' ],
		] );

		$rest_api = $this->getMockBuilder( Rest_Api::class )
			->onlyMethods( [ 'get_connect_app' ] )
			->getMock();
		$rest_api->method( 'get_connect_app' )->willReturn( $mock_app );

		$response = $rest_api->get_home_screen();

		$this->assertInstanceOf( WP_REST_Response::class, $response );
		$this->assertSame( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertSame( 3, $data['step'] );
		$this->assertSame( 'mock-session', $data['sessionId'] );
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

	public function test_update_snapshot_rejects_oversized_payload() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'administrator' ] ) );

		$oversized = [];
		for ( $i = 0; $i <= Rest_Api::SNAPSHOT_MAX_KEYS; $i++ ) {
			$oversized[ 'site-key-' . $i ] = [ 'step' => 1 ];
		}

		$request = new WP_REST_Request( 'POST', self::SNAPSHOT_ROUTE );
		$request->set_param( 'value', $oversized );

		$response = rest_do_request( $request );

		$this->assertEquals( 400, $response->get_status() );
		$this->assertFalse( $response->get_data()['success'] );
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

		$this->assertGreaterThanOrEqual( 2, count( $route ) );

		$has_get = false;
		$has_post = false;

		foreach ( $route as $handler ) {
			if ( isset( $handler['methods']['GET'] ) ) {
				$has_get = true;
				$this->assertIsCallable( $handler['callback'] );
			}
			if ( isset( $handler['methods']['POST'] ) || isset( $handler['methods']['PUT'] ) || isset( $handler['methods']['PATCH'] ) ) {
				$has_post = true;
				$this->assertIsCallable( $handler['callback'] );
			}
		}

		$this->assertTrue( $has_get, 'Snapshot endpoint should have GET method' );
		$this->assertTrue( $has_post, 'Snapshot endpoint should have POST method' );
	}
}
