<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Data\Base;

use Elementor\Data\Manager;
use Elementor\Testing\Elementor_Test_Base;

class Test_Endpoint extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Data\Manager
	 */
	protected $manager;

	/**
	 * @var \WP_REST_Server
	 */
	protected $server;

	public function setUp() {
		parent::setUp();

		$this->manager = Manager::instance();
		$this->server = $this->manager->run_server();
	}

	public function test_get_items_recursive() {
		/**
		 * TODO: Create Base Endpoint\Internal
		 * TODO: Create Base Endpoint\Internal\Index
		 */

		$controller = $this->manager->register_controller_instance( new Mock\Recursive\Controller );

		do_action( 'rest_api_init' ); // Ensure controller loaded.

		// Run internal index endpoint. Run endpoint 'test-controller'.
		$endpoints_results = $this->manager->run_endpoint( $controller->get_name() );

		foreach ( $endpoints_results as $endpoint_name => $endpoints_result ) {
			// Run endpoint like `test-controller/test-endpoint-{random}`.
			$endpoint = $controller->get_name() . '/' . $endpoint_name;
			$result = $this->manager->run_endpoint( $endpoint );

			// Each manual run of the endpoint equals to part of $endpoints_results which is recursive result.
			$this->assertEquals( $endpoints_result, $result );
		}
	}
}
