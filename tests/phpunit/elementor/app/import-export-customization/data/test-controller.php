<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Data;

use Elementor\App\Modules\ImportExportCustomization\Data\Controller;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Controller extends Elementor_Test_Base {

	/**
	 * @var mixed Original REST server instance
	 */
	private $original_rest_server;

	/**
	 * @var bool Whether REST API was initialized
	 */
	private $rest_api_initialized = false;

	/**
	 * @var array Backup of global filters
	 */
	private $filters_backup = [];

	public function setUp(): void {
		parent::setUp();

		// Store the original REST server state
		global $wp_rest_server;
		$this->original_rest_server = $wp_rest_server;
		$wp_rest_server = null;
	}

	public function tearDown(): void {
		// Restore the original REST server state
		global $wp_rest_server;
		$wp_rest_server = $this->original_rest_server;

		// Restore global filters if REST API was initialized
		if ( $this->rest_api_initialized ) {
			global $wp_filter;

			// Restore the backed up filters
			if ( ! empty( $this->filters_backup ) ) {
				$wp_filter = $this->filters_backup;
			}

			$this->rest_api_initialized = false;
			$this->filters_backup = [];
		}

		parent::tearDown();
	}

	/**
	 * Initialize REST API for tests that need it
	 */
	private function init_rest_api() {
		if ( ! $this->rest_api_initialized ) {
			global $wp_filter;

			// Backup current filters state
			$this->filters_backup = $wp_filter;

			do_action( 'rest_api_init' );
			$this->rest_api_initialized = true;
		}
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

		// Act - Initialize REST API with proper cleanup
		$this->init_rest_api();

		// Get all registered routes
		$routes = rest_get_server()->get_routes();

		// Assert - Check that our route exists
		$expected_route = '/' . Controller::API_NAMESPACE . '/' . Controller::API_BASE . '/export';
		$this->assertArrayHasKey( $expected_route, $routes );
	}
}
