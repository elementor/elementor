<?php
namespace Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;

// TODO: Create base class for index endpoints, and move this function to there.
class Index extends Endpoint {
	public function get_name() {
		return 'index'; // TODO: Replace with BaseIndex class.
	}

	public function get_items( $request ) {
		return $this->controller->get_items_recursive( [ $this ] ); // TODO: Replace with BaseIndex class.
	}
}
