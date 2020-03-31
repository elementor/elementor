<?php
namespace Elementor\Data\Editor\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;

class Index extends Endpoint {
	public function get_name() {
		return 'index';
	}

	protected function get_items( $request ) {
		return $this->get_items_recursive( $request );
	}
}
