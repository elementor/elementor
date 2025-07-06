<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExport\Data;

use Elementor\App\Modules\ImportExportCustomization\Data\Controller;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Controller extends Elementor_Test_Base {

	private $original_rest_server;

	public function setUp(): void {
		parent::setUp();

		// Store the original REST server state
		global $wp_rest_server;
		$this->original_rest_server = $wp_rest_server;
		$wp_rest_server = null;
	}

	public function tearDown(): void {
		parent::tearDown();

		// Restore the original REST server state
		global $wp_rest_server;
		$wp_rest_server = $this->original_rest_server;
	}

	/**
	 * Test that the controller registers hooks properly
	 */
	public function test_register_hooks() {
		// Remove any existing hooks first
		remove_all_actions( 'rest_api_init' );

		// Act
		Controller::register_hooks();

		// Assert - Check that the hook was registered
		$this->assertNotFalse( has_action( 'rest_api_init' ) );
	}

	/**
	 * Test that routes are registered when REST API initializes
	 */
	public function test_routes_are_registered_on_rest_api_init() {
		// Arrange
		Controller::register_hooks();

		// Act - Trigger REST API initialization
		do_action( 'rest_api_init' );
		
		// Get all registered routes
		$routes = rest_get_server()->get_routes();

		// Assert - Check that our route exists
		$expected_route = '/' . Controller::API_NAMESPACE . '/' . Controller::API_BASE . '/export';
		$this->assertArrayHasKey( $expected_route, $routes );
	}
}
