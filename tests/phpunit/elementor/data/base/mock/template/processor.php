<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

use Elementor\Data\Base\Processor\After;

class Processor extends After {

	private $test_access_controller;

	public __construct( $controller ) {
		parent::__construct( $controller );

		$this->test_access_controller = $controller;
	}

	public get_command() {
		return $this->test_access_controller->get_name();
	}

	public get_conditions( $args, $result ) {
		return true;
	}

	public apply( $args, $result ) {
		if ( is_array( $result ) ) {
			$result[ 'from_processor'] = true;
		}
		return $result;
	}
}
