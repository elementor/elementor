<?php
namespace Elementor\Data\Editor\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;

class Test extends Endpoint {

	public function get_name() {
		return 'test';
	}

	protected function get_items( $request ) {
		return [ 'test' => 'is working' ];
	}
}
