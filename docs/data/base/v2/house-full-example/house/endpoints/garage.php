<?php
namespace House\Endpoints;

require 'sub-endpoints/items.php';

class Garage extends \Elementor\Data\V2\Base\Endpoint {

	public function get_name() {
		return 'garage';
	}

	public function get_format() {
		return 'house/garage';
	}

	protected function register() {
		parent::register();

		$this->register_sub_endpoint( new SubEndpoints\Items( $this ) );
	}

	protected function get_items( $request ) {
		return [
			'status' => 'garage available',
		];
	}
}
