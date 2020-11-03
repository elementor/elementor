<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base;

use Elementor\Data\Manager;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\WithEndpoint\Controller as ControllerWithEndpoint;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller as ControllerTemplate;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Sub_Controller as SubControllerTemplate;

class Test_Sub_Controller extends Data_Test_Base {
	public function test_get_base_route() {
		// Arrange.
		$controller = $this->manager->register_controller( new ControllerTemplate() );
		$sub_controller = new SubControllerTemplate( $controller );

		// Act.
		$actual = $sub_controller->get_base_route();

		// Assert.
		$this->assertEquals( Manager::REST_BASE . $controller->get_name() . '/' . $sub_controller->get_name(), $actual );
	}

	public function test_get_full_name() {
		// Arrange.
		$controller = $this->manager->register_controller( new ControllerTemplate() );
		$sub_controller = new SubControllerTemplate( $controller );

		// Act.
		$actual = $sub_controller->get_full_name();

		// Assert.
		$this->assertEquals( $controller->get_name() . '/' . $sub_controller->get_name(), $actual );
	}

	public function test_execute_simple() {
		// Arrange.
		$controller = $this->manager->register_controller( new ControllerTemplate() );

		$sub_controller = new SubControllerTemplate( $controller );

		$this->manager->run_server();

		$route = '/elementor/v1' . $sub_controller->get_endpoint_index()->get_base_route();

		// Act.
		$rest_index = $this->manager->run_endpoint( $controller->get_name() );

		// Assert.
		$this->assertArrayHaveKeys( [ $route ], $rest_index['routes'] );
	}

	public function test_execute_sub_controller_from_index_endpoint() {
		// Arrange.
		$controller = $this->manager->register_controller( new ControllerWithEndpoint() );
		$sub_controller = new SubControllerTemplate( $controller );

		// By default index endpoint will use the controller.
		$sub_controller->set_test_data( 'get_items', 'valid' );

		$this->manager->run_server();

		$index_endpoint_route = $controller->get_name() . '/1/' . $sub_controller->get_name();

		// Act.
		$data = $this->manager->run_endpoint( $index_endpoint_route );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}

	public function test_execute_sub_controller_from_index_endpoint_as_command() {
		// Arrange.
		$controller = $this->manager->register_controller( new ControllerWithEndpoint() );
		$sub_controller = new SubControllerTemplate( $controller );

		// By default index endpoint will use the controller.
		$sub_controller->set_test_data( 'get_items', 'valid' );

		$this->manager->register_controller_instance( $controller );
		$this->manager->run_server();

		// Act.
		$data = $this->manager->run( $sub_controller->get_endpoint_index()->get_full_command(), [
			'id' => '1'
		] );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}

	public function test_execute_sub_controller_from_endpoint() {
		// Arrange.
		$controller = $this->manager->register_controller( new ControllerWithEndpoint() );
		$sub_controller = new SubControllerTemplate( $controller );

		$this->manager->run_server();

		$endpoint = $sub_controller->do_register_endpoint( new Endpoint( $sub_controller ) );
		$endpoint->set_test_data( 'get_items', 'valid' );

		// Act.
		$data = $this->manager->run_endpoint( $endpoint->get_full_command() );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}

	public function test_execute_sub_controller_from_endpoint_as_command() {
		// Arrange.
		$controller = $this->manager->register_controller( new ControllerWithEndpoint() );
		$sub_controller = new SubControllerTemplate( $controller );

		$this->manager->register_controller_instance( $controller );
		$this->manager->run_server();

		$endpoint = $sub_controller->do_register_endpoint( new Endpoint( $sub_controller ) );
		$endpoint->set_test_data( 'get_items', 'valid' );

		// Act.
		$data = $this->manager->run( $endpoint->get_full_command() );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}
}
