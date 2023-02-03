<?php
namespace House\Endpoints\SubEndpoints;

class Items extends \Elementor\Data\V2\Base\Endpoint {

	public function get_name() {
		return 'items';
	}

	public function get_format() {
		return 'house/garage/items';
	}

	protected function get_items( $request ) {
		return [
			'item0',
			'item1',
		];
	}
}
