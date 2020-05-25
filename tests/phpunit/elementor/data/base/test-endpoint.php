<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base;

use Elementor\Data\Manager;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Simple\Controller as ControllerSimple;

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
		$this->manager->kill_server();
	}

	public function test_create_simple() {
		$test_controller_instance = new ControllerSimple( $this );
		$this->manager->run_server();

		// Validate `$this->>register()`.
		$this->assertCount( 1, $test_controller_instance->endpoints );
	}

	public function test_create_invalid_controller() {
		$this->expectException( \Exception::class );

		new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint( null );
	}



	public function test_get_items_recursive() {
		/**
		 * TODO: Create Base Endpoint\Internal
		 * TODO: Create Base Endpoint\Internal\Index
		 */

		$controller = $this->manager->register_controller_instance( new Mock\Recursive\Controller );
		$this->manager->run_server(); // Ensure controller loaded.

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
