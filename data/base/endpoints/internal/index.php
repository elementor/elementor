<?php
namespace Elementor\Data\Base\Endpoints\Internal;

use Elementor\Data\Base\Endpoint;

class Index extends Endpoint {
	public function get_name() {
		return 'index';
	}

	public function get_items( $request ) {
		return $this->controller->get_items( $request );
	}

	public function get_item( $id, $request ) {
		return $this->controller->get_item( $request );
	}

	protected function register() {
		parent::register();

		$this->register_item_route();
	}
}
