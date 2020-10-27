<?php
namespace Elementor\Tests\Phpunit\Data\Base\Endpoint\Index;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Data_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller as ControllerTemplate;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\SubController as SubControllerTemplate;

class Test_SubIndexEndpoint extends Data_Test_Base {
	public function test_get_format() {
		// Arrange.
		$controller = $this->manager->register_controller( new ControllerTemplate() );
		$sub_controller = new SubControllerTemplate( $controller );

		$this->manager->run_server();

		// Act.
		$actual = $sub_controller->index_endpoint->get_format();

		// Assert.
		$this->assertEquals( implode( '/', [
			$controller->get_name(),
			'{id}',
			$sub_controller->get_name(),
			'{sub_id}'
		] ), $actual );
	}

	public function test_get_base_route() {
		// Arrange.
		$controller = $this->manager->register_controller( new ControllerTemplate() );
		$sub_controller = new SubControllerTemplate( $controller );

		$this->manager->run_server();

		// Act.
		$actual = $sub_controller->index_endpoint->get_base_route();

		// Assert.
		$this->assertEquals( implode( '/', [
			'',
			$controller->get_name(),
			'(?P<id>[\w]+)',
			$sub_controller->get_name(),
		] ), $actual );
	}
}
