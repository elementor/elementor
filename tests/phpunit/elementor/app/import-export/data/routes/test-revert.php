<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExport\Data\Routes;

use Elementor\App\Modules\ImportExport\Module as ImportExportModule;
use Elementor\Plugin;
use Elementor\App\Modules\ImportExport\Data\Controller;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Revert extends Elementor_Test_Base {

	private $original_component;

	private $rest_api_initialized = false;

	public function setUp(): void {
		parent::setUp();

		$this->original_component = Plugin::$instance->app->get_component( 'import-export' );

		Plugin::$instance->app->add_component( 'import-export', new ImportExportModule() );
	}

	public function tearDown(): void {
		if ( $this->original_component ) {
			Plugin::$instance->app->add_component( 'import-export', $this->original_component );
		}

		if ( $this->rest_api_initialized ) {
			remove_all_filters( 'rest_api_init' );
			$this->rest_api_initialized = false;
		}

		delete_option( ImportExportModule::OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS );

		parent::tearDown();
	}

	private function init_rest_api() {
		if ( ! $this->rest_api_initialized ) {
			do_action( 'rest_api_init' );
			$this->rest_api_initialized = true;
		}
	}

	public function test_permission_requires_admin() {
		$this->init_rest_api();

		$this->act_as_subscriber();

		$response = $this->send_revert_request();

		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_permission_allows_admin() {
		$this->init_rest_api();

		$this->create_mock_import_session();

		$this->act_as_admin();

		$response = $this->send_revert_request();

		$this->assertNotEquals( 403, $response->get_status() );
	}

	public function test_successful_revert_with_import_sessions() {
		$this->init_rest_api();
		$this->act_as_admin();

		$this->create_mock_import_session();

		$response = $this->send_revert_request();

		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assertArrayHasKey( 'data', $data );
		$this->assertArrayHasKey( 'revert_completed', $data['data'] );
		$this->assertTrue( $data['data']['revert_completed'] );
		$this->assertArrayHasKey( 'referrer_kit_id', $data['data'] );
		$this->assertArrayHasKey( 'show_referrer_dialog', $data['data'] );
	}

	public function test_revert_without_import_sessions() {
		$this->init_rest_api();
		$this->act_as_admin();

		$response = $this->send_revert_request();

		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assertArrayHasKey( 'data', $data );
		$this->assertArrayHasKey( 'revert_completed', $data['data'] );
		$this->assertFalse( $data['data']['revert_completed'] );
		$this->assertArrayHasKey( 'message', $data['data'] );
		$this->assertEquals( 'No import sessions available to revert.', $data['data']['message'] );
	}

	public function test_revert_with_referrer_kit_id() {
		$this->init_rest_api();
		$this->act_as_admin();

		$this->create_mock_import_session();

		$_GET['referrer_kit'] = 'test-kit-123';

		$response = $this->send_revert_request();

		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assertTrue( $data['data']['revert_completed'] );
		$this->assertEquals( 'test-kit-123', $data['data']['referrer_kit_id'] );
		$this->assertTrue( $data['data']['show_referrer_dialog'] );

		unset( $_GET['referrer_kit'] );
	}

	public function test_revert_without_referrer_kit_id() {
		$this->init_rest_api();
		$this->act_as_admin();

		$this->create_mock_import_session();

		$response = $this->send_revert_request();

		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assertTrue( $data['data']['revert_completed'] );
		$this->assertEquals( '', $data['data']['referrer_kit_id'] );
		$this->assertFalse( $data['data']['show_referrer_dialog'] );
	}

	public function test_revert_error_handling() {
		$this->init_rest_api();
		$this->act_as_admin();

		$mock_module = $this->getMockBuilder( ImportExportModule::class )
			->onlyMethods( ['revert_last_imported_kit'] )
			->getMock();

		$mock_module->expects( $this->once() )
			->method( 'revert_last_imported_kit' )
			->willThrowException( new \Exception( 'revert_error' ) );

		Plugin::$instance->app->add_component( 'import-export', $mock_module );

		$response = $this->send_revert_request();

		$this->assertEquals( 500, $response->get_status() );
		$data = $response->get_data();

		$this->assertEquals( 'revert_error', $data['data']['code'] );
		$this->assertEquals( 'revert_error', $data['data']['message'] );
	}

	private function send_revert_request() {
		$request = new \WP_REST_Request(
			'POST',
			'/' . Controller::API_NAMESPACE . '/' . Controller::API_BASE . '/revert'
		);

		return rest_do_request( $request );
	}

	private function create_mock_import_session() {
		$session_data = [
			[
				'session_id' => 'test-session-' . time(),
				'kit_title' => 'Test Kit',
				'kit_name' => 'test-kit',
				'kit_thumbnail' => '',
				'kit_source' => 'local',
				'start_timestamp' => time(),
				'source' => 'local',
			],
		];

		update_option( ImportExportModule::OPTION_KEY_ELEMENTOR_IMPORT_SESSIONS, $session_data, false );
	}
}
