<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\V2\Base\Exceptions;

use Elementor\Tests\Phpunit\Elementor\Data\V2\Base\Data_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Data\V2\Base\Mock\Template\ControllerGetItemsException;

class Test_Error_500 extends Data_Test_Base {
	public function test() {
		// Arrange.
		$controller = new ControllerGetItemsException();
		$this->manager->run_server();

		$request = new \WP_REST_Request();
		$request->set_param( 'error', 500 );

		// Act
		$result = $controller->get_endpoint_index()->base_callback( \WP_REST_Server::READABLE, $request, true );

		// Assert.
		$this->assertEquals( 500, $result->get_error_data()['status'] );
		$this->assertEquals( 'Something went wrong', $result->get_error_message() );
	}
}
