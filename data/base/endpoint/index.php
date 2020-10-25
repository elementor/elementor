<?php
namespace Elementor\Data\Base\Endpoint;

use Elementor\Data\Base\Endpoint;

class Index extends Endpoint {
	public function get_name() {
		return 'index';
	}

	public function get_format() {
		return "{$this->controller->get_full_name()}/{id}";
	}

	public function get_name_public() {
		return '';
	}

	public function get_items( $request ) {
		return $this->controller->get_items( $request );
	}
}
