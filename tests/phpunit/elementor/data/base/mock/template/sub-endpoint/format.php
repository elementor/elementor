<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\SubEndpoint;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\SubEndpoint;

class Format extends SubEndpoint {
	public function get_format() {
		return '{sub_arg_id}';
	}

	public function get_type() {
		return 'sub-endpoint-format';
	}
}
