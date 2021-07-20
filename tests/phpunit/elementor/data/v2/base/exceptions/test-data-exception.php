<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\V2\Base\Exceptions;

use Elementor\Tests\Phpunit\Elementor\Data\V2\Base\Data_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Data\V2\Base\Mock\Template\ControllerGetItemsException;
use Elementor\Tests\Phpunit\Elementor\Data\V2\Base\Mock\Template\Endpoint as EndpointTemplate;

class Test_Data_Exception extends Data_Test_Base {
	public function test() {
		// Arrange.
		$controller = new ControllerGetItemsException();
		$controller->bypass_original_register();

		$endpoint = $controller->do_register_endpoint( new EndpointTemplate( $controller ) );

		$request = new \WP_REST_Request();
		$request->set_param( 'error', 501 );

		// Act
		$result = $endpoint->base_callback( \WP_REST_Server::READABLE, $request, true );

		// Assert.
		$this->assertEquals( 501, $result->get_error_data()['status'] );
		$this->assertEquals( '501 Not Implemented', $result->get_error_message() );
	}

	public function test__foreign_error_in_debug_mode() {
		// Arrange.
		$controller = new ControllerGetItemsException();
		$controller->bypass_original_register();

		$endpoint = $controller->do_register_endpoint( new EndpointTemplate( $controller ) );

		$request = new \WP_REST_Request();
		$request->set_param( 'error', 'mysqli' );

		// Act
		$result = $endpoint->base_callback( \WP_REST_Server::READABLE, $request, true, [
			'is_debug' => true,
		] );

		// Assert.
		$this->assertTrue( $result->get_error_data() instanceof \mysqli_sql_exception );
	}
}

