<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExport\Data\Routes;

use Elementor\App\Modules\ImportExport\Module as ImportExportModule;
use Elementor\Plugin;
use Elementor\App\Modules\ImportExport\Data\Controller;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Export extends Elementor_Test_Base {

	/**
	 * @var mixed Original component instance
	 */
	private $original_component;

	/**
	 * @var bool Whether REST API was initialized
	 */
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

		parent::tearDown();
	}

	private function init_rest_api() {
		if ( ! $this->rest_api_initialized ) {
			do_action( 'rest_api_init' );
			$this->rest_api_initialized = true;
		}
	}


	public function test_permission_requires_admin() {
		// Arrange
		$this->init_rest_api();

		$this->act_as_subscriber();

		// Act
		$response = $this->send_export_request();

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_permission_allows_admin() {
		// Arrange
		$this->init_rest_api();

		$mock_module = $this->getMockBuilder( ImportExportModule::class )
			->onlyMethods( ['export_kit'] )
			->getMock();

		Plugin::$instance->app->add_component( 'import-export', $mock_module );

		$this->act_as_admin();

		// Act
		$response = $this->send_export_request();

		// Assert
		$this->assertNotEquals( 403, $response->get_status() );
	}

	public function test_successful_export_with_required_parameters() {
		// Arrange
		$this->init_rest_api();
		$this->act_as_admin();

		// Act
		$response = $this->send_export_request( [
			'include' => ['settings'],
			'kitInfo' => [
				'title' => 'Test Kit',
				'description' => 'Test Kit Description',
				'source' => 'test'
			]
		] );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assertArrayHasKey( 'data', $data );
		$this->assertArrayHasKey( 'manifest', $data['data'] );
		$this->assertArrayHasKey( 'file', $data['data'] );
	}

	public function test_successful_export_with_all_parameters() {
		// Arrange
		$this->init_rest_api();
		$this->act_as_admin();

		$this->register_post_type( 'test_post_type', 'Test Post Type' );

		$expected_settings = [
			'include' => [ 'templates', 'content', 'settings', 'plugins' ],
			'kitInfo' => [
				'title' => 'My Custom Kit',
				'description' => 'A test kit',
				'source' => 'custom'
			],
			'plugins' => [ 'elementor', 'elementor-pro' ],
			'customization' => [
				'settings' => null,
				'content' => null,
				'templates' => null,
				'plugins' => null,
			],
			'selectedCustomPostTypes' => [ 'test_post_type' ],
			'screenShotBlob' => 'base64_encoded_screenshot'
		];

		// Act
		$response = $this->send_export_request( $expected_settings );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assertArrayHasKey( 'data', $data );
		$this->assertArrayHasKey( 'manifest', $data['data'] );
		$this->assertArrayHasKey( 'file', $data['data'] );

		// Cleanups
		unregister_post_type( 'test_post_type' );
	}

	public function test_export_error_file_not_readable() {
		// Arrange
		$this->init_rest_api();
		$this->act_as_admin();

		$temp_file = tempnam( sys_get_temp_dir(), 'test_export' );
		file_put_contents( $temp_file, '' );
		chmod( $temp_file, 0000 );

		$mock_module = $this->getMockBuilder( ImportExportModule::class )
			->onlyMethods( ['export_kit'] )
			->getMock();

		$mock_module->expects( $this->once() )
			->method( 'export_kit' )
			->willReturn( [
				'file_name' => $temp_file,
				'manifest' => []
			] );

		Plugin::$instance->app->add_component( 'import-export', $mock_module );

		// Act
		$response = $this->send_export_request( [
			'include' => ['settings'],
			'kitInfo' => [
				'title' => 'Test Kit',
				'source' => 'test'
			]
		] );

		// Assert
		$this->assertEquals( 500, $response->get_status() );
		$data = $response->get_data();

		$this->assertEquals( 'invalid-zip-file', $data['data']['code'] );
		$this->assertEquals( 'export_error', $data['data']['message'] );

		// Cleanup
		chmod( $temp_file, 0644 );
		unlink( $temp_file );
	}

	public function test_export_error_with_exception() {
		// Arrange
		$this->init_rest_api();
		$this->act_as_admin();

		$mock_module = $this->getMockBuilder( ImportExportModule::class )
			->onlyMethods( ['export_kit'] )
			->getMock();

		$mock_module->expects( $this->once() )
			->method( 'export_kit' )
			->willThrowException( new \Exception( 'cloud-upload-failed' ) );

		Plugin::$instance->app->add_component( 'import-export', $mock_module );

		// Act
		$response = $this->send_export_request( [
			'include' => ['settings'],
			'kitInfo' => [
				'title' => 'Test Kit',
				'source' => 'test'
			]
		] );

		// Assert
		$this->assertEquals( 500, $response->get_status() );
		$data = $response->get_data();

		$this->assertEquals( 'cloud-upload-failed', $data['data']['code'] );
		$this->assertEquals( 'export_error', $data['data']['message'] );
	}

	private function send_export_request( $params = [] ) {
		$request = new \WP_REST_Request(
			'POST',
			'/' . Controller::API_NAMESPACE . '/' . Controller::API_BASE . '/export'
		);

		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}

		return rest_do_request( $request );
	}

	private function register_post_type( $key, $plural_label ) {
		register_post_type( $key, [
			'can_export' => true,
			'public' => true,
			'labels' => [
				'name' => $plural_label,
			],
		] );
	}

}
