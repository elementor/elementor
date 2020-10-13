<?php
namespace Elementor\Data\Base\Endpoint\Internal;

class IndexRecursive extends Index {
	public function get_items( $request ) {
		return $this->controller->get_items_recursive( [ $this ] );
	}
}
