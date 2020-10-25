<?php
namespace Elementor\Tests\Phpunit\Data\Base\Endpoint\Index;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Data_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Recursive\Controller as ControllerRecursive;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint as EndpointTemplate;

class Test_Recursive extends Data_Test_Base {

	public function test_get_items_recursive() {
		// Arrange.
		$controller_instance = new ControllerRecursive();

		$this->manager->run_server();

		$count = 0;

		foreach ( $controller_instance->endpoints as $endpoint ) {
			$endpoint->set_test_data( 'get_items', "endpoint{$count}_result" );
			++$count;
		}

		// Act - Result should include both endpoints result.
		$results = $controller_instance->get_endpoint_index()->get_items_recursive();

		$count = 0;

		// Assert.
		foreach ( $results as $result ) {
			$this->assertEquals( 'endpoint' . $count . '_result', $result );
			$count++;
		}
	}

	public function test_get_items_recursive_simulated() {
		// Arrange.
		$controller = $this->manager->register_controller_instance( new Mock\Recursive\Controller );
		$this->manager->run_server(); // Ensure controller loaded.

		// Act - Run index endpoint. Run endpoint 'test-controller'.
		$endpoints_results = $this->manager->run_endpoint( $controller->get_name() );

		// Assert.
		foreach ( $endpoints_results as $endpoint_name => $endpoints_result ) {
			// Run endpoint like `test-controller/test-endpoint-{random}`.
			$endpoint = $controller->get_name() . '/' . $endpoint_name;
			$result = $this->manager->run_endpoint( $endpoint );

			// Each manual run of the endpoint equals to part of $endpoints_results which is recursive result.
			$this->assertEquals( $endpoints_result, $result );
		}
	}

	// TODO test_get_items_recursive, where one of the endpoint's `permission_callback` is false.
}
