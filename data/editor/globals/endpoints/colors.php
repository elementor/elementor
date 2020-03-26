<?php
namespace Elementor\Data\Editor\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;

class Colors extends Endpoint {
	public function get_name() {
		return 'colors';
	}

	protected function register() {
		parent::register();

		$this->register_get_item_route();
	}

	protected function get_items( $request ) {
		return [
		];
	}

	protected function get_item( $id, $request ) {
		switch ( $id ) {
			case 'primary':
				return 'red';

			case 'secondary':
				return 'green';
		}
	}
}
