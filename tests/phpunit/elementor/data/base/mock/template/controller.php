<?php

namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

class Controller extends \Elementor\Data\Base\Controller {
	use BaseTrait;

	function get_type() {
		return 'controller';
	}

	public function register_endpoints() {
		// TODO: Implement register_endpoints() method.
	}

	public function permission_callback( $request ) {
		return true; // Bypass.
	}
}
