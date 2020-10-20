<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;

class Format extends Endpoint {
	public function get_type() {
		return 'endpoint-format';
	}

	public static function get_format() {
		return '{arg_id}';
	}
}
