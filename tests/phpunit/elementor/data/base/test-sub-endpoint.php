<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\SubEndpoint;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\WithSubEndpoint\Controller as ControllerWithSubEndpoint;

class Test_Sub_Endpoint extends Data_Test_Base {
	public function test_create_simple() {
		// Arrange.
		$controller_instance = new ControllerWithSubEndpoint();

		// Act
		$this->manager->run_server();

		// Assert - Validate `$this->>register()`.
		$this->assertCount( 1, $controller_instance->get_test_endpoint()->get_sub_endpoints() );
	}

	public function test_get_parent() {
		// Arrange.
		$controller = new Mock\Template\Controller();
		$controller->bypass_original_register();

		$endpoint = new Mock\Template\Endpoint( $controller );
		$sub_endpoint = new Mock\Template\SubEndpoint( $endpoint );

		// Act.
		$expected = $sub_endpoint->get_parent();

		// Assert.
		$this->assertEquals( $expected, $endpoint );
	}

	// 'test_get_base_route' is different from other 'test_get_base_route' tests its use endpoint as parent.
	public function test_get_base_route() {
		// Arrange.
		$controller = new Mock\Template\Controller();
		$controller->bypass_original_register();

		$endpoint = new Mock\Template\Endpoint( $controller );
		$sub_endpoint = new Mock\Template\SubEndpoint(  $endpoint );

		// Act.
		$actual = $sub_endpoint->get_base_route();

		// Assert.
		$this->assertEquals( implode( '/', [
			$controller->get_name(),
			$endpoint->get_name(),
			$sub_endpoint->get_name(),
		] ), $actual );
	}

	public function test_get_base_route_parent_sub_endpoint() {
		// Arrange.
		$controller = new Mock\Template\Controller();
		$controller->bypass_original_register();

		$endpoint = new Mock\Template\Endpoint( $controller );
		$sub_endpoint = new Mock\Template\SubEndpoint( $endpoint );
		$descendant_endpoint = new Mock\Template\SubEndpoint( $sub_endpoint );

		// Act.
		$actual = $descendant_endpoint->get_base_route();

		// Assert.
		$this->assertEquals( implode( '/', [
			$controller->get_name(),
			$endpoint->get_name(),
			$sub_endpoint->get_name(),
			$descendant_endpoint->get_name()
		] ), $actual );
	}

	public function test_get_base_route_parent_index_of_sub_controller() {
		// Arrange.
		$controller = $this->manager->register_controller( new Mock\Template\Controller() );
		$sub_controller = new Mock\Template\SubController( $controller );

		// Trigger register.
		$this->manager->run_server();

		$index_endpoint = $sub_controller->get_endpoint_index();

		$sub_endpoint = new Mock\Template\SubEndpoint( $index_endpoint );

		// Act.
		$actual = $sub_endpoint->get_base_route();

		// Assert.
		$this->assertEquals( implode( '/', [
			'',
			$controller->get_name(),
			'(?P<id>[\w]+)',
			$sub_controller->get_name(),
			$sub_endpoint->get_name(),
		] ),  $actual );
	}

	public function test_get_base_route_parent_index() {
		// Arrange.
		$controller = new Mock\Template\Controller();

		// Trigger register.
		$this->manager->run_server();

		$index_endpoint = $controller->get_endpoint_index();

		$sub_endpoint = new Mock\Template\SubEndpoint( $index_endpoint );

		// Act.
		$actual = $sub_endpoint->get_base_route();

		// Assert.
		$this->assertEquals( implode( '/', [
			$controller->get_name(),
			$sub_endpoint->get_name(),
		] ),  $actual );
	}

	public function test_get_full_command() {
		// Arrange.
		$controller = new Mock\Template\Controller();
		$controller->bypass_original_register();

		$endpoint = new Mock\Template\Endpoint( $controller );
		$sub_endpoint = new Mock\Template\SubEndpoint(  $endpoint );

		// Act.
		$actual = $sub_endpoint->get_full_command();

		// Assert.
		$this->assertEquals( implode( '/', [
			$controller->get_name(),
			$endpoint->get_name(),
			$sub_endpoint->get_name(),
		] ), $actual );
	}

	public function test_get_full_command_parent_sub_endpoint() {
		// Arrange.
		$controller = new Mock\Template\Controller();
		$controller->bypass_original_register();

		$endpoint = new Mock\Template\Endpoint( $controller );
		$sub_endpoint = new Mock\Template\SubEndpoint( $endpoint, 'first-sub-route' );
		$descendant_endpoint = new Mock\Template\SubEndpoint( $sub_endpoint, 'second-sub-route' );

		// Act.
		$actual = $descendant_endpoint->get_full_command();

		// Assert.
		$this->assertEquals( implode( '/', [
			$controller->get_name(),
			$endpoint->get_name(),
			$sub_endpoint->get_name(),
			$descendant_endpoint->get_name()
		] ), $actual );
	}

	public function test_get_full_command_parent_index_of_sub_controller() {
		// Arrange.
		$controller = $this->manager->register_controller( new Mock\Template\Controller() );
		$sub_controller = new Mock\Template\SubController( $controller );

		$this->manager->run_server();

		$index_endpoint = $sub_controller->get_endpoint_index();

		// Act.
		$actual = $index_endpoint->get_full_command();

		// Assert.
		$this->assertEquals( implode( '/', [
			$controller->get_name(),
			$sub_controller->get_name(),
			$index_endpoint->get_name(),
		] ), $actual );
	}

	public function test_get_name_ancestry() {
		// Arrange.
		$controller = new Mock\Template\Controller();
		$controller->bypass_original_register();

		$endpoint = new Mock\Template\Endpoint( $controller );
		$sub_endpoint = new Mock\Template\SubEndpoint(  $endpoint );

		// Act.
		$actual = $sub_endpoint->get_name_ancestry();

		// Assert.
		$this->assertEquals( implode( '/', [
			$endpoint->get_name(),
			$sub_endpoint->get_name(),
		] ), $actual );
	}

	public function test_execute_sub_endpoint_from_parent_index_as_command() {
		// Arrange.
		$controller = $this->manager->register_controller( Controller::class );

		$this->manager->run_server();

		$index_endpoint = $controller->index_endpoint;

		/**
		 * @var $sub_endpoint \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint
		 */
		$sub_endpoint = $index_endpoint->register_sub_endpoint( new SubEndpoint( $index_endpoint ) );
		$sub_endpoint->set_test_data( 'get_items', 'valid' );

		// Act.
		$data = $this->manager->run( $sub_endpoint->get_full_command() );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}

	public function test_execute_sub_endpoint_from_parent_endpoint_as_command() {
		// Arrange.
		$controller = $this->manager->register_controller( Controller::class );

		$this->manager->run_server();

		$endpoint = new Mock\Template\Endpoint( $controller );
		$sub_endpoint = new Mock\Template\SubEndpoint(  $endpoint );

		$sub_endpoint->set_test_data( 'get_items', 'valid' );

		// Act.
		$data = $this->manager->run( $sub_endpoint->get_full_command() );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}

	public function test_execute_sub_endpoint_from_parent_sub_endpoint_as_command() {
		// Arrange.
		$controller = $this->manager->register_controller( Controller::class );

		$this->manager->run_server();

		$endpoint = new Mock\Template\Endpoint( $controller );
		$sub_endpoint = $endpoint->register_sub_endpoint( new Mock\Template\SubEndpoint( $endpoint ) );

		/**
		 * @var $descendant_endpoint \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint
		 */
		$descendant_endpoint = $sub_endpoint->register_sub_endpoint( new Mock\Template\SubEndpoint( $sub_endpoint ) );
		$descendant_endpoint->set_test_data( 'get_items', 'valid' );

		// Act.
		$data = $this->manager->run( $descendant_endpoint->get_full_command() );

		// Assert.
		$this->assertEquals( 'valid', $data );
	}
}
