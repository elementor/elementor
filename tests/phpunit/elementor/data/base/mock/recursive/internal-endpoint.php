<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Recursive;

use Elementor\Data\Base\Endpoint;

class Internal_Endpoint extends Endpoint {

	public function get_name() {
		return 'index';
	}

	public function get_items( $request ) {
		return $this->controller->get_items_recursive( [ $this ] );
	}
}
