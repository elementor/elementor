<?php
namespace Elementor\Data\Base\Endpoint;

use Elementor\Data\Base\Endpoint;

abstract class Internal extends Endpoint {
	public function get_items( $request ) {
		return $this->controller->get_items( $request );
	}
}
