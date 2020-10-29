<?php
namespace Elementor\Data\Base\Endpoint;

use Elementor\Data\Base\Interfaces\Endpoint;
use Elementor\Data\Base\SubEndpoint;
use WP_REST_Server;

class Proxy implements Endpoint {
	/**
	 * @var \Elementor\Data\Base\Endpoint
	 */
	protected $real_endpoint;

	private $instance_types = [];

	public function __construct( $real_endpoint ) {
		$this->real_endpoint = $real_endpoint;

		if ( $real_endpoint instanceof Index ) {
			$this->instance_types [] = Index::class;
		}
	}

	public function __get( $name ) {
		if ( 'controller' === $name ) {
			return $this->get_controller();
		}

		return $this->real_endpoint->{$name};
	}

	public function __call( $method, $arguments ) {
		$real_call_arguments = [
			$this->real_endpoint,
			$method,
		];

		if ( is_callable( $real_call_arguments ) ) {
			return call_user_func_array( $real_call_arguments, $arguments );
		}

		return null;
	}

	private function proxy_base_callback( $methods, $request, $is_multi ) {
		$result = $this->real_endpoint->base_callback( $methods, $request, $is_multi );

		return $result->data;
	}

	public function is_index_instance() {
		return in_array( Index::class, $this->instance_types );
	}

	public function get_items( $request ) {
		return $this->proxy_base_callback( WP_REST_Server::READABLE, $request, true );
	}

	public function get_item( $id, $request ) {
		return $this->proxy_base_callback( WP_REST_Server::READABLE, $request, false );
	}

	public function create_items( $request ) {
		return $this->proxy_base_callback( WP_REST_Server::CREATABLE, $request, true );
	}

	public function create_item( $id, $request ) {
		return $this->proxy_base_callback( WP_REST_Server::CREATABLE, $request, false );
	}

	public function update_items( $request ) {
		return $this->proxy_base_callback( WP_REST_Server::EDITABLE, $request, true );
	}

	public function update_item( $id, $request ) {
		return $this->proxy_base_callback( WP_REST_Server::EDITABLE, $request, false );
	}

	public function delete_items( $request ) {
		return $this->proxy_base_callback( WP_REST_Server::DELETABLE, $request, true );
	}

	public function delete_item( $id, $request ) {
		return $this->proxy_base_callback( WP_REST_Server::DELETABLE, $request, false );
	}

	public function register_item_route( $methods = WP_REST_Server::READABLE, $args = [], $route = '/' ) {
		$this->real_endpoint->register_item_route( $methods, $args, $route );
	}

	public function register_items_route( $methods = WP_REST_Server::READABLE ) {
		$this->real_endpoint->register_items_route( $methods );
	}

	public function base_callback( $methods, $request, $is_multi = false ) {
		return $this->real_endpoint->base_callback( $methods, $request, $is_multi );
	}

	public function get_name() {
		return $this->real_endpoint->get_name();
	}

	public function get_format() {
		return $this->real_endpoint->get_format();
	}

	public function get_controller() {
		return $this->real_endpoint->get_controller();
	}

	public function get_base_route() {
		return $this->real_endpoint->get_base_route();
	}

	public function get_public_name() {
		return $this->real_endpoint->get_public_name();
	}

	public function get_full_command() {
		return $this->real_endpoint->get_full_command();
	}

	public function get_permission_callback( $request ) {
		return $this->real_endpoint->get_permission_callback( $request );
	}

	public function register_route( $route = '', $methods = WP_REST_Server::READABLE, $callback = null, $args = [] ) {
		return $this->real_endpoint->register_route( $route, $methods, $callback, $args );
	}

	public function register_sub_endpoint( SubEndpoint $endpoint ) {
		return $this->real_endpoint->register_sub_endpoint( $endpoint );
	}
}
