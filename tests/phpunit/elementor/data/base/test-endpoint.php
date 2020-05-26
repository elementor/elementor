<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base;

use Elementor\Data\Manager;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Simple\Controller as ControllerSimple;
use Exception;

class Test_Endpoint extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Data\Manager
	 */
	protected $manager;

	public function setUp() {
		parent::setUp();

		$this->manager = Manager::instance();
		$this->manager->kill_server();
	}

	public function test_create_simple() {
		$test_controller_instance = new ControllerSimple();
		$this->manager->run_server();

		// Validate `$this->>register()`.
		$this->assertCount( 1, $test_controller_instance->endpoints );
	}

	public function test_create_invalid_controller() {
		$this->expectException( Exception::class );

		new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint( null );
	}

	public function test_get_base_route() {
		$controller_instance = new ControllerSimple();
		$this->manager->run_server();

		$endpoint_instance = array_values( $controller_instance->endpoints )[ 0 ];

		$this->assertEquals( '/' . $controller_instance->get_name() . '/' . $endpoint_instance->get_name(), $endpoint_instance->get_base_route() );
	}

	public function test_get_base_route_index_endpoint() {
		$this->manager->run_server();
		$controller_instance = new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller();

		$endpoint_instance = $controller_instance->do_register_endpoint( \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint\Index::class );

		$this->assertEquals( '/' . $controller_instance->get_name() . '/' , $endpoint_instance->get_base_route() );
	}

	public function test_register() {
		$this->manager->run_server();

		$controller_instance = new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller();
		$endpoint_instance = new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint( $controller_instance );

		$endpoint_instance->set_test_data( 'get_items', 'valid' );

		// Validate register did 'register_items_route'.
		$data = Manager::run_endpoint( $controller_instance->get_name() . '/' . $endpoint_instance->get_name() );

		$this->assertEquals( $data, 'valid' );
	}

	public function test_register_sub_endpoint() {
		$this->manager->run_server();

		$controller_instance = new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller();
		$endpoint_instance = new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint( $controller_instance );

		$sub_endpoint_instance = $endpoint_instance->do_register_sub_endpoint( 'test-route/', \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\SubEndpoint::class );
		$sub_endpoint_instance->set_test_data( 'get_items', 'valid' );

		$endpoint = $controller_instance->get_name() .  '/test-route/' . $sub_endpoint_instance->get_name();

		$data = Manager::run_endpoint( $endpoint  );

		$this->assertEquals( $data, 'valid' );
	}

	public function test_register_sub_endpoint_invalid_endpoint() {
		$this->expectException( Exception::class );

		$this->manager->run_server();

		$controller_instance = new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller();
		$endpoint_instance = new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint( $controller_instance );

		$endpoint_instance->do_register_sub_endpoint( 'test-route/', \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint::class );
	}

	public function test_get_items() {
		$this->manager->run_server();

		$controller_instance = new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller();
		$endpoint_instance = new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint( $controller_instance );

		$endpoint_instance->set_test_data( 'get_items', 'valid' );

		$this->assertEquals( 'valid', $endpoint_instance->do_get_items( null ) );
	}

	// TODO: Add method: test_get_items_simulated as test_get_items_recursive_simulated.

	public function test_get_items_recursive() {

		$this->manager->run_server();

		$controller_instance = new \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller();
		$endpoint_instance0= $controller_instance->do_register_endpoint( \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint::class );
		$endpoint_instance1 = $controller_instance->do_register_endpoint( \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint::class );
		$endpoint_index_instance = $controller_instance->do_register_endpoint( \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint\Index::class );

		$endpoint_instance0->set_test_data( 'get_items', 'endpoint0_result');
		$endpoint_instance1->set_test_data( 'get_items', 'endpoint1_result');

		// Result should include both endpoints result.
		$results = $endpoint_index_instance->do_get_items_recursive(null);
		$count = 0;

		foreach ( $results as $result ) {
			$this->assertEquals( 'endpoint' . $count . '_result', $result );
			$count++;
		}
	}

	public function test_get_items_recursive_simulated() {
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

	// TODO: Add test_get_permission_callback(), when get_permission_callback() function is completed.


}
