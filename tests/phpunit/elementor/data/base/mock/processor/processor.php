<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Processor;

class Processor extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Processor {

	public function get_command() {
		$controller = $this->test_get_controller();

		return $controller->get_name();
	}
}

