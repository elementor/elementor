<?php
namespace Elementor\Data\Base\Endpoint;

use Elementor\Data\Base\Endpoint;

class Index extends Endpoint {
	public static function get_format() {
		return '{id}';
	}

	public function get_name() {
		return 'index';
	}

	public function get_items( $request ) {
		return $this->controller->get_items( $request );
	}

}
