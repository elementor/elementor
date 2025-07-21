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

		// Act
		$response = $this->send_plugins_request();

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$plugins = $data['data'];

		if ( ! empty( $plugins ) ) {
			$first_plugin = $plugins[0];

			$this->assertArrayHasKey( 'name', $first_plugin );
			$this->assertArrayHasKey( 'plugin', $first_plugin );
			$this->assertArrayHasKey( 'pluginUri', $first_plugin );
			$this->assertArrayHasKey( 'version', $first_plugin );

			$this->assertIsString( $first_plugin['name'] );
			$this->assertIsString( $first_plugin['plugin'] );
			$this->assertIsString( $first_plugin['version'] );
		}
	}

	public function test_returns_all_installed_plugins() {
		// Arrange
		$this->init_rest_api();
		$this->act_as_admin();

		// Mock the plugins list to ensure we have predictable data
		$mock_plugins = [
			'test-plugin/test-plugin.php' => [
				'Name' => 'Test Plugin',
				'PluginURI' => 'https://example.com/test-plugin',
				'Version' => '1.0.0',
				'Description' => 'A test plugin',
				'Author' => 'Test Author'
			],
			'another-plugin/another-plugin.php' => [
				'Name' => 'Another Plugin',
				'PluginURI' => 'https://example.com/another-plugin',
				'Version' => '2.0.0',
				'Description' => 'Another test plugin',
				'Author' => 'Another Author'
			]
		];

		// Mock the WP object and plugins collection
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
				],
				[
					'name' => 'Another Plugin',
					'plugin' => 'another-plugin/another-plugin.php',
					'pluginUri' => 'https://example.com/another-plugin',
					'version' => '2.0.0'
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

		$this->assertCount( 2, $plugins );
		
		$this->assertEquals( 'Test Plugin', $plugins[0]['name'] );
		$this->assertEquals( 'test-plugin/test-plugin.php', $plugins[0]['plugin'] );
		$this->assertEquals( 'https://example.com/test-plugin', $plugins[0]['pluginUri'] );
		$this->assertEquals( '1.0.0', $plugins[0]['version'] );

		$this->assertEquals( 'Another Plugin', $plugins[1]['name'] );
		$this->assertEquals( 'another-plugin/another-plugin.php', $plugins[1]['plugin'] );
		$this->assertEquals( 'https://example.com/another-plugin', $plugins[1]['pluginUri'] );
		$this->assertEquals( '2.0.0', $plugins[1]['version'] );
	}

	public function test_empty_plugins_response() {
		// Arrange
		$this->init_rest_api();
		$this->act_as_admin();

		// Mock empty plugins list
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
			->willReturn( [] );

		$mock_wp->expects( $this->once() )
			->method( 'get_plugins' )
			->willReturn( $mock_collection );

		Plugin::$instance->wp = $mock_wp;

		// Act
		$response = $this->send_plugins_request();

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();

		$this->assertArrayHasKey( 'data', $data );
		$this->assertIsArray( $data['data'] );
		$this->assertEmpty( $data['data'] );
	}

	private function send_plugins_request() {
		$request = new \WP_REST_Request(
			'GET',
			'/' . Controller::API_NAMESPACE . '/' . Controller::API_BASE . '/plugins'
		);

		return rest_do_request( $request );
	}
} 