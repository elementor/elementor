<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Data\Base\Mock\Recursive;

class Internal_Endpoint extends \Elementor\Data\Base\Endpoint {

	public function get_name() {
		return 'index';
	}

	public function get_items( $request ) {
		return $this->get_items_recursive( $request );
	}
}
