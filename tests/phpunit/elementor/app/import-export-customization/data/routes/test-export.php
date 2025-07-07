<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExport\Data\Routes;

use Elementor\App\Modules\ImportExportCustomization\Module as ImportExportCustomizationModule;
use Elementor\Plugin;
use Elementor\App\Modules\ImportExportCustomization\Data\Controller;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Export extends Elementor_Test_Base {

	/**
	 * @var mixed Original component instance
	 */
	private $original_component;

	/**
	 * Set up test environment
	 */
	public function setUp(): void {
		parent::setUp();

		// Store original component if exists
		$this->original_component = Plugin::$instance->app->get_component( 'import-export-customization' );

		// Initialize the module and REST API
		Plugin::$instance->app->add_component( 'import-export-customization', new ImportExportCustomizationModule() );
		do_action( 'rest_api_init' );
	}

	/**
	 * Clean up after test
	 */
	public function tearDown(): void {
		// Restore original component if it existed
		if ( $this->original_component ) {
			Plugin::$instance->app->add_component( 'import-export-customization', $this->original_component );
		}

		parent::tearDown();
	}

	/**
	 * Test permission callback requires admin
	 */
	public function test_permission_requires_admin() {
		// Arrange
		// Act as subscriber (non-admin)
		$this->act_as_subscriber();
		
		// Act
		$response = $this->send_export_request();

		// Assert - Should get 403 Forbidden, not 500
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'rest_forbidden', $response->get_data()['code'] );
	}

	/**
	 * Test permission callback allows admin users
	 */
	public function test_permission_allows_admin() {
		// Arrange
		// Mock the export kit method to avoid actual export
		$mock_module = $this->getMockBuilder( ImportExportCustomizationModule::class )
			->onlyMethods( ['export_kit'] )
			->getMock();
			
		Plugin::$instance->app->add_component( 'import-export-customization', $mock_module );
		
		// Act as admin
		$this->act_as_admin();
		
		// Act
		$response = $this->send_export_request();

		// Assert - Should NOT get 403 or 500
		$this->assertNotEquals( 403, $response->get_status() );
	}

	/**
	 * Test successful export with minimal parameters
	 */
	public function test_successful_export_with_required_params() {
		// Arrange
        $this->act_as_admin();
		
		// Act
		$response = $this->send_export_request([
			'include' => ['settings'],
			'kitInfo' => [
				'title' => 'Test Kit',
				'description' => 'Test Kit Description',
				'source' => 'test'
			]
		]);
		
		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assertArrayHasKey( 'data', $data );
		$this->assertArrayHasKey( 'manifest', $data['data'] );
		$this->assertArrayHasKey( 'file', $data['data'] );
	}

	/**
	 * Test export with all parameters
	 */
	public function test_successful_export_with_all_parameters() {
		// Arrange
        $this->act_as_admin();

		$this->register_post_type( 'test_post_type', 'Test Post Type' );
		
		$expected_settings = [
			'include' => ['templates', 'content', 'settings', 'plugins'],
			'kitInfo' => [
				'title' => 'My Custom Kit',
				'description' => 'A test kit',
				'source' => 'custom'
			],
			'plugins' => ['elementor', 'elementor-pro'],
			'selectedCustomPostTypes' => ['test_post_type'],
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

	/**
	 * Test export error handling when file cannot be read
	 */
	public function test_export_error_file_not_readable() {
		// Arrange
		$this->act_as_admin();
		
		$mock_module = $this->getMockBuilder( ImportExportCustomizationModule::class )
			->onlyMethods( ['export_kit'] )
			->getMock();
		
		// Return non-existent file
		$mock_module->expects( $this->once() )
			->method( 'export_kit' )
			->willReturn( [
				'file_name' => '/non/existent/file.zip',
				'manifest' => []
			] );
			
		Plugin::$instance->app->add_component( 'import-export-customization', $mock_module );
		
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

        $this->assertEquals( 'export_error', $data['data']['code'] );
        $this->assertEquals( 'Could not read the exported file.', $data['data']['message'] );
	}

	/**
	 * Test export error handling with exception
	 */
	public function test_export_error_with_exception() {
		// Arrange
		$this->act_as_admin();
		
		$mock_module = $this->getMockBuilder( ImportExportCustomizationModule::class )
			->onlyMethods( ['export_kit'] )
			->getMock();
		
		$mock_module->expects( $this->once() )
			->method( 'export_kit' )
			->willThrowException( new \Exception( 'Export failed due to invalid data' ) );
			
		Plugin::$instance->app->add_component( 'import-export-customization', $mock_module );
		
		// Act
		$response = $this->send_export_request( [
			'include' => ['settings'],
			'kitInfo' => [
				'name' => 'Test Kit',
				'source' => 'test'
			]
		] );
		
		// Assert
		$this->assertEquals( 500, $response->get_status() );
		$data = $response->get_data();
		
		$this->assertEquals( 'export_error', $data['data']['code'] );
		$this->assertEquals( 'Export failed due to invalid data', $data['data']['message'] );
	}

	/**
	 * Helper method to send export request
	 */
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
