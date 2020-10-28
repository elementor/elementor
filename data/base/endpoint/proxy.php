<?php
namespace Elementor\Data\Base\Endpoint;

use Elementor\Data\Base\EndpointItems;
use Elementor\Data\Base\Interfaces\EndpointItems as EndpointItemsInterface;
use WP_REST_Server;

class Proxy implements EndpointItemsInterface {

	/**
	 * @var \Elementor\Data\Base\Endpoint
	 */
	private $real_endpoint;

	public function __construct( $real_endpoint ) {
		$this->real_endpoint = $real_endpoint;
	}

	private function base_callback( $methods, $request, $is_multi ) {
		$result = $this->real_endpoint->base_callback( $methods, $request, $is_multi );

		return $result->data;
	}

	public function get_items( $request ) {
		return $this->base_callback( WP_REST_Server::READABLE, $request, true );
	}

	public function get_item( $id, $request ) {
		return $this->base_callback( WP_REST_Server::READABLE, $request, false );
	}

	public function create_items( $request ) {
		return $this->base_callback( WP_REST_Server::CREATABLE, $request, true );
	}

	public function create_item( $id, $request ) {
		return $this->base_callback( WP_REST_Server::CREATABLE, $request, false );
	}

	public function update_items( $request ) {
		return $this->base_callback( WP_REST_Server::EDITABLE, $request, true );
	}

	public function update_item( $id, $request ) {
		return $this->base_callback( WP_REST_Server::EDITABLE, $request, false );
	}

	public function delete_items( $request ) {
		return $this->base_callback( WP_REST_Server::DELETABLE, $request, true );
	}

	public function delete_item( $id, $request ) {
		return $this->base_callback( WP_REST_Server::DELETABLE, $request, false );
	}

	public function __call( $method, $arguments ) {
		$real_call_arguments = [
			$this->real_endpoint,
			$method,
		];

		if ( is_callable( $real_call_arguments ) ) {
			return call_user_func_array( $real_call_arguments, $arguments );
		}
	}

	public function __get( $name ) {
		if ( 'controller' === $name ) {
			return $this->real_endpoint->get_controller();
		}

		return $this->real_endpoint->{$name};
	}
}
