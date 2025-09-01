<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\Connect\Rest;

use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Core\Common\Modules\Connect\Rest\Rest_Api;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_Http;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Rest_Api extends Elementor_Test_Base {
	/**
	 * @var Rest_Api
	 */
	private $rest_api;

	/**
	 * @var Library|\PHPUnit\Framework\MockObject\MockObject
	 */
	private $mock_app;

	private $original_common;

	public function setUp(): void {
		parent::setUp();

		$this->original_common = Plugin::$instance->common;
		
		$this->mock_app = $this->getMockBuilder( Library::class )
			->setMethods( [
				'action_authorize',
				'action_get_token',
				'action_disconnect',
				'is_connected',
				'set_auth_mode',
			] )
			->disableOriginalConstructor()
			->getMock();

		$connect_mock = $this->createMock( \Elementor\Core\Common\Modules\Connect\Module::class );
		$connect_mock->method( 'get_app' )->willReturn( $this->mock_app );

		$common_mock = $this->createMock( \Elementor\Core\Common\App::class );
		$common_mock->method( 'get_component' )->with( 'connect' )->willReturn( $connect_mock );

		Plugin::$instance->common = $common_mock;

		$this->rest_api = new Rest_Api();
	
	}

	public function test_connect_permissions_check__admin_can_access() {
		$this->act_as_admin();
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/library/connect' );
		
		$result = $this->rest_api->connect_permissions_check( $request );
		
		$this->assertTrue( $result );
	}

	public function test_connect_permissions_check__subscriber_cannot_access() {
		$this->act_as_subscriber();
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/library/connect' );
		
		$result = $this->rest_api->connect_permissions_check( $request );
		
		$this->assertFalse( $result );
	}

	public function test_connect__app_not_available() {
		$this->act_as_admin();
		$connect_mock = $this->createMock( \Elementor\Core\Common\Modules\Connect\Module::class );
		$connect_mock->method( 'get_app' )->willReturn( null );

		$common_mock = $this->createMock( \Elementor\Core\Common\App::class );
		$common_mock->method( 'get_component' )->with( 'connect' )->willReturn( $connect_mock );

		$plugin_instance = Plugin::$instance;
		$plugin_instance->common = $common_mock;

		$this->rest_api = new Rest_Api();
		
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/library/connect' );
		$request->set_param( 'token', 'test_token' );
		
		$response = $this->rest_api->connect( $request );
		
		$this->assertInstanceOf( \WP_Error::class, $response );
		$this->assertEquals( 'elementor_library_app_not_available', $response->get_error_code() );
		$this->assertEquals( WP_Http::INTERNAL_SERVER_ERROR, $response->get_error_data()['status'] );
	}

	public function test_connect__success() {
		$this->act_as_admin();
			
		$this->mock_app->expects( $this->once() )
			->method( 'is_connected' )
			->willReturn( true );
		
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/library/connect' );
		$request->set_param( 'token', 'test_token' );
		
		$response = $this->rest_api->connect( $request );
		$data = $response->get_data();
		
		$this->assertEquals( WP_Http::CREATED, $response->get_status() );
		$this->assertTrue( $data['success'] );
		$this->assertArrayHasKey( 'message', $data );
	}

	public function test_connect__failure() {
		$this->act_as_admin();
			
		$this->mock_app->expects( $this->once() )
			->method( 'is_connected' )
			->willReturn( false );
		
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/library/connect' );
		$request->set_param( 'token', 'test_token' );
		
		$response = $this->rest_api->connect( $request );
		
		$this->assertInstanceOf( \WP_Error::class, $response );
		$this->assertEquals( 'elementor_library_not_connected', $response->get_error_code() );
	}

	public function test_connect__exception() {
		$this->act_as_admin();
			
		$this->mock_app->expects( $this->once() )
			->method( 'action_authorize' )
			->will( $this->throwException( new \Exception( 'Test exception' ) ) );
		
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/library/connect' );
		$request->set_param( 'token', 'test_token' );
		
		$response = $this->rest_api->connect( $request );
		
		$this->assertInstanceOf( \WP_Error::class, $response );
		$this->assertEquals( 'elementor_library_connect_error', $response->get_error_code() );
		$this->assertEquals( 'Test exception', $response->get_error_message() );
	}

	public function test_disconnect__success() {
		$this->act_as_admin();
		
		$request = new \WP_REST_Request( 'DELETE', '/elementor/v1/library/connect' );
		
		$response = $this->rest_api->disconnect( $request );
		$data = $response->get_data();
		
		$this->assertEquals( WP_Http::OK, $response->get_status() );
		$this->assertTrue( $data['success'] );
		$this->assertArrayHasKey( 'message', $data );
	}

	public function test_disconnect__exception() {
		$this->act_as_admin();
			
		$this->mock_app->expects( $this->once() )
			->method( 'action_disconnect' )
			->will( $this->throwException( new \Exception( 'Test exception' ) ) );
		
		$request = new \WP_REST_Request( 'DELETE', '/elementor/v1/library/connect' );
		
		$response = $this->rest_api->disconnect( $request );
		
		$this->assertInstanceOf( \WP_Error::class, $response );
		$this->assertEquals( 'elementor_library_disconnect_error', $response->get_error_code() );
		$this->assertEquals( 'Test exception', $response->get_error_message() );
	}

	public function tearDown(): void {
		parent::tearDown();
		Plugin::$instance->common = $this->original_common;
	}
}
