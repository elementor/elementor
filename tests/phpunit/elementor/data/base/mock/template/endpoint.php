<?php

namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

class Endpoint extends \Elementor\Data\Base\Endpoint {
	use BaseTrait;

	function get_type() {
		return 'endpoint';
	}
}
