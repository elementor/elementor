<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Data\Base;

use Elementor\Data\Base\Endpoint;
use Elementor\Data\Base\Controller;
use Elementor\Data\Manager;
use Elementor\Testing\Elementor_Test_Base;

class Mock_Endpoint extends Endpoint {
	public function get_name() {
		static $name = null;

		if ( ! $name ) {
			$name = 'test-endpoint-' . rand_long_str( 5 );
		}

		return $name;
	}

	public function get_items( $request ) {
		return [
			'get_items' => [
				'fakeKey' => 'fakeValue'
			],
		];
	}
}

class Recursive_Internal_Endpoint extends Endpoint {

	public function get_name() {
		return 'index';
	}

	public function get_items( $request ) {
		return $this->get_items_recursive( $request );
	}
}

class Recursive_Controller extends Controller {

	public function get_name() {
		return 'test-controller';
	}

	public function register_endpoints() {
		$this->register_endpoint( Mock_Endpoint::class );
		$this->register_endpoint( Mock_Endpoint::class );
	}

	protected function register_internal_endpoints() {
		$this->register_endpoint( Recursive_Internal_Endpoint::class );
	}

	public function permission_callback( $request ) {
		return true; // Bypass.
	}
}

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

		$controller = $this->manager->register_controller_instance( new Recursive_Controller() );

		do_action( 'rest_api_init' ); // Ensure controller loaded.

		// Run internal index endpoint. Run endpoint 'test-controller'.
		$endpoints_results = $this->manager->run_endpoint( $controller->get_name() );

		foreach ( $endpoints_results as $endpoint_name => $endpoints_result ) {
			// EG: Run endpoint 'test-controller/test-endpoint-{random}'.
			$endpoint = $controller->get_name() . '/' . $endpoint_name;
			$result = $this->manager->run_endpoint( $endpoint );

			// Each manual run of the endpoint equals to part of $endpoints_results which is recursive result.
			$this->assertEquals( $endpoints_result, $result );
		}
	}
}
