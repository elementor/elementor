<?php

namespace House\Rooms\Doors;

class Controller extends \Elementor\Data\V2\Base\Controller {
	public function get_name() {
		return 'doors';
	}

	public function get_parent_name() {
		return 'rooms';
	}

	public function register_endpoints() {
		$this->index_endpoint->register_item_route( \WP_REST_Server::READABLE, [
			'id_arg_name' => 'door_id',
		] );
	}

	public function get_items( $request ) {
		$room_id = $request->get_param( 'id' );

		return \House\Rooms\Controller::DATA[ $room_id ]['doors'];
	}

	public function get_item( $request ) {
		$room_id = $request->get_param( 'id' );
		$door_id = $request->get_param( 'door_id' );

		return \House\Rooms\Controller::DATA[ $room_id ]['doors'][ $door_id ];
	}

	public function get_permission_callback( $request ) {
		// Just for the example to work without extra permissions.
		return true;
	}
}
