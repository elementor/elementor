<?php
namespace Elementor\Data\Editor\Document\Endpoints;

use Elementor\Data\Base\Endpoint;

class Elements extends Endpoint {
	public function get_name() {
		return 'elements';
	}

	protected function register() {
		parent::register();

		$this->register_get_item_route();
	}

	protected function get_items( $request ) {
		return [ 'get_items' => 'get_items is working' ];
	}

	protected function get_item( $id, $request ) {
		// TODO: Handle document_id
		return [
			'get_item' => 'get_item is working',
			'id' => $id,
		];
	}
}
