<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Recursive;

use Elementor\Data\Base\Endpoint;

class Internal_Endpoint extends Endpoint {

	public get_name() {
		return 'index';
	}

	public get_items( $request ) {
		return $this->controller->get_items_recursive( [ $this ] );
	}
}
