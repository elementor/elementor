<?php
namespace Elementor\Data\Base\Endpoint\Internal;

use Elementor\Data\Base\Endpoint\Internal;

class Index extends Internal {
	public static function get_format() {
		return '{id}';
	}

	public function get_name() {
		return 'index';
	}
}
