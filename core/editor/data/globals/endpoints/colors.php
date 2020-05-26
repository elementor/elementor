<?php
namespace Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;

class Colors extends Endpoint {
	private static $fake_data = [
		'primary' => 'red',
		'secondary' => 'green',
	];

	public function get_name() {
		return 'colors';
	}

	protected function register() {
		parent::register();

		$this->register_item_route();
	}

	public function get_items( $request ) {
		return self::$fake_data;
	}

	public function get_item( $id, $request ) {
		if ( isset( self::$fake_data[ $id ] ) ) {
			return self::$fake_data[ $id ];
		}

		return false;
	}
}
