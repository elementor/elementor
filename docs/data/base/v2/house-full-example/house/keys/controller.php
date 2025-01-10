<?php
namespace House\Keys;

class Controller extends \Elementor\Data\V2\Base\Controller {
	const DATA = [
		[
			'id' => 0,
			'name' => 'key_0',
		],
		[
			'id' => 1,
			'name' => 'key_1',
		],
	];

	public function get_name() {
		return 'keys';
	}

	public function get_parent_name() {
		return 'house';
	}

	public function register_endpoints() {
		$this->index_endpoint->register_item_route();
	}

	public function get_items( $request ) {
		return self::DATA;
	}

	public function get_item( $request ) {
		$id = $request->get_param( 'id' );

		return self::DATA[ $id ];
	}

	public function get_permission_callback( $request ) {
		// Just for the example to work without extra permissions.
		return true;
	}
}
