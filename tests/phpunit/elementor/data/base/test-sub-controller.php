<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base;

use Elementor\Data\Manager;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Simple\Controller as ControllerSimple;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\SubController as SubControllerTemplate;

class Test_Sub_Controller extends Data_Test_Base {
	public function tearDown() {
		parent::tearDown();

		$this->manager->kill_server();
	}

	public function test_create_simple() {
		// Arrange.
		$controller = new ControllerSimple();
		$sub_controller = new SubControllerTemplate( $controller );

		$this->manager->run_server();

		// Act.
		$rest_index = $this->manager->run_endpoint( $controller->get_name() );

		// Assert.
		$this->assertArrayHaveKeys( [ '/' . $sub_controller->get_controller_route() ], $rest_index['routes'] );
	}

	public function test_get_reset_base() {
		// Arrange.
		$controller = new ControllerSimple();
		$sub_controller = new SubControllerTemplate( $controller );
		$excepted = Manager::REST_BASE . $controller->get_name() . '/' . $sub_controller->get_name();

		// Act.
		$actual = $sub_controller->get_rest_base();

		// Assert.
		$this->assertEquals( $excepted, $actual );
	}

	public function test_execute_sub_controller_from_internal_endpoint() {
		// Arrange.
		$controller = new ControllerSimple();
		$sub_controller = new SubControllerTemplate( $controller );

		// By default internal endpoints will be used for the controller.
		$sub_controller->set_test_data( 'get_items', 'valid' );

		$this->manager->run_server();

		// Act.
		$data = $this->manager->run_endpoint( $sub_controller->get_rest_base() );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}

	public function test_execute_sub_controller_from_internal_endpoint_as_command() {
		// Arrange.
		$controller = new ControllerSimple();
		$sub_controller = new SubControllerTemplate( $controller );

		// By default internal endpoints will be used for the controller.
		$sub_controller->set_test_data( 'get_items', 'valid' );

		$this->manager->register_controller_instance( $controller );
		$this->manager->run_server();

		// Act.
		$data = $this->manager->run( $sub_controller->get_endpoint_internal_index()->get_full_command() );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}

	public function test_execute_sub_controller_from_custom_endpoint() {
		// Arrange.
		$controller = new ControllerSimple();
		$sub_controller = new SubControllerTemplate( $controller );

		$this->manager->run_server();

		$custom_endpoint = $sub_controller->do_register_endpoint( \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint::class );
		$custom_endpoint->set_test_data( 'get_items', 'valid' );

		// Act.
		$data = $this->manager->run_endpoint( $custom_endpoint->get_full_command() );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}

	public function test_execute_sub_controller_from_custom_endpoint_as_command() {
		// Arrange.
		$controller = new ControllerSimple();
		$sub_controller = new SubControllerTemplate( $controller );

		$this->manager->register_controller_instance( $controller );
		$this->manager->run_server();

		$custom_endpoint = $sub_controller->do_register_endpoint( \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint::class );
		$custom_endpoint->set_test_data( 'get_items', 'valid' );

		// Act.
		$data = $this->manager->run( $custom_endpoint->get_full_command() );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}
}
