<?php
namespace Elementor\Data\Editor\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;

class Colors extends Endpoint {
	private static $fake_data = [
		'primary' => 'red',
		'secondary' => 'secondary',
	];

	public function get_name() {
		return 'colors';
	}

	protected function register() {
		parent::register();

		$this->register_get_item_route();
	}

	protected function get_items( $request ) {
		return self::$fake_data;
	}

	protected function get_item( $id, $request ) {
		if ( isset( self::$fake_data[ $id ] ) ) {
			return self::$fake_data[ $id ];
		}

		return false;
	}
}
