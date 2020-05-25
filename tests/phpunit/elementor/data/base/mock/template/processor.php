<?php

namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

use Elementor\Data\Base\Processor\After;

abstract class Processor extends After {
	private $test_access_controller;

	public function __construct( $controller ) {
		parent::__construct( $controller );

		$this->test_access_controller = $controller;
	}

	public function get_conditions( $args, $result ) {
		return true;
	}

	public function apply( $args, $result ) {
		return $result;
	}

	public function test_get_controller() {
		return $this->test_access_controller;
	}
}
