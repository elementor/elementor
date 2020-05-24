<?php

namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

use Elementor\Data\Base\Processor\After;

abstract class Processor extends After {
	public function get_conditions( $args, $result ) {
		return true;
	}

	public function apply( $args, $result ) {
		return $result;
	}
}
