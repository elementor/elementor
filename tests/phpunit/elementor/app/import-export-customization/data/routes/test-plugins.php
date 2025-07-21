<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Data\Routes;

use Elementor\App\Modules\ImportExportCustomization\Module as ImportExportCustomizationModule;
use Elementor\Plugin;
use Elementor\App\Modules\ImportExportCustomization\Data\Controller;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Plugins extends Elementor_Test_Base {

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

		$this->original_component = Plugin::$instance->app->get_component( 'import-export-customization' );

		Plugin::$instance->app->add_component( 'import-export-customization', new ImportExportCustomizationModule() );
	}

	public function tearDown(): void {
		if ( $this->original_component ) {
			Plugin::$instance->app->add_component( 'import-export-customization', $this->original_component );
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
		$response = $this->send_plugins_request();

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_permission_allows_admin() {
		// Arrange
		$this->init_rest_api();
		$this->act_as_admin();

		// Act
		$response = $this->send_plugins_request();

		// Assert
		$this->assertNotEquals( 403, $response->get_status() );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_successful_response_structure() {
		// Arrange
		$this->init_rest_api();
		$this->act_as_admin();

		// Act
		$response = $this->send_plugins_request();

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assertArrayHasKey( 'data', $data );
		$this->assertArrayHasKey( 'meta', $data );
		$this->assertIsArray( $data['data'] );
	}

	public function test_plugin_data_format() {
		// Arrange
		$this->init_rest_api();
		$this->act_as_admin();

		$mock_wp = $this->getMockBuilder( \stdClass::class )
			->addMethods( ['get_plugins'] )
			->getMock();

		$mock_collection = $this->getMockBuilder( \stdClass::class )
			->addMethods( ['map', 'all'] )
			->getMock();

		$mock_collection->expects( $this->once() )
			->method( 'map' )
			->willReturnSelf();

		$mock_collection->expects( $this->once() )
			->method( 'all' )
			->willReturn( [
				[
					'name' => 'Test Plugin',
					'plugin' => 'test-plugin/test-plugin.php',
					'pluginUri' => 'https://example.com/test-plugin',
					'version' => '1.0.0'
				]
			] );

		$mock_wp->expects( $this->once() )
			->method( 'get_plugins' )
			->willReturn( $mock_collection );

		Plugin::$instance->wp = $mock_wp;

		// Act
		$response = $this->send_plugins_request();

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$plugins = $data['data'];

		$this->assertNotEmpty( $plugins );
		$this->assertCount( 1, $plugins );

		$first_plugin = $plugins[0];

		$this->assertArrayHasKey( 'name', $first_plugin );
		$this->assertArrayHasKey( 'plugin', $first_plugin );
		$this->assertArrayHasKey( 'pluginUri', $first_plugin );
		$this->assertArrayHasKey( 'version', $first_plugin );

		$this->assertIsString( $first_plugin['name'] );
		$this->assertIsString( $first_plugin['plugin'] );
		$this->assertIsString( $first_plugin['pluginUri'] );
		$this->assertIsString( $first_plugin['version'] );

		$this->assertEquals( 'Test Plugin', $first_plugin['name'] );
		$this->assertEquals( 'test-plugin/test-plugin.php', $first_plugin['plugin'] );
		$this->assertEquals( 'https://example.com/test-plugin', $first_plugin['pluginUri'] );
		$this->assertEquals( '1.0.0', $first_plugin['version'] );
	}

	private function send_plugins_request() {
		$request = new \WP_REST_Request(
			'GET',
			'/' . Controller::API_NAMESPACE . '/' . Controller::API_BASE . '/plugins'
		);

		return rest_do_request( $request );
	}
}
