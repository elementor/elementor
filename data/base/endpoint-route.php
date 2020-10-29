<?php
namespace Elementor\Data\Base;

use WP_REST_Server;

abstract class EndpointRoute implements Interfaces\EndpointRoute {
	const AVAILABLE_METHODS = [
		WP_REST_Server::READABLE,
		WP_REST_Server::CREATABLE,
		WP_REST_Server::EDITABLE,
		WP_REST_Server::DELETABLE,
		WP_REST_Server::ALLMETHODS,
	];

	/**
	 * Controller of current endpoint.
	 *
	 * @var \Elementor\Data\Base\Controller
	 */
	protected $controller;

	public function get_permission_callback( $request ) {
		return $this->controller->get_permission_callback( $request );
	}

	public function get_items( $request ) {
		return $this->controller->get_items( $request );
	}

	public function get_item( $id, $request ) {
		return $this->controller->get_item( $request );
	}

	public function create_items( $request ) {
		return new \WP_Error( 'invalid-method', sprintf( "Method '%s' not implemented. Must be overridden in subclass.", __METHOD__ ), array( 'status' => 405 ) );
	}

	public function create_item( $id, $request ) {
		return $this->controller->create_item( $request );
	}

	public function update_items( $request ) {
		return new \WP_Error( 'invalid-method', sprintf( "Method '%s' not implemented. Must be overridden in subclass.", __METHOD__ ), array( 'status' => 405 ) );
	}

	public function update_item( $id, $request ) {
		return $this->controller->update_item( $request );
	}

	public function delete_items( $request ) {
		return new \WP_Error( 'invalid-method', sprintf( "Method '%s' not implemented. Must be overridden in subclass.", __METHOD__ ), array( 'status' => 405 ) );
	}

	public function delete_item( $id, $request ) {
		return $this->controller->update_item( $request );
	}

	/**
	 * Register the endpoint.
	 *
	 * By default: register get items route.
	 */
	protected function register() {
		$this->register_items_route();
	}

	protected function register_route( $route = '', $methods = WP_REST_Server::READABLE, $callback = null, $args = [] ) {
		if ( ! in_array( $methods, self::AVAILABLE_METHODS, true ) ) {
			trigger_error( 'Invalid method.', E_USER_ERROR );
		}

		$route = $this->get_base_route() . $route;

		return register_rest_route( $this->controller->get_namespace(), $route, [
			[
				'args' => $args,
				'methods' => $methods,
				'callback' => $callback,
				'permission_callback' => function ( $request ) {
					return $this->get_permission_callback( $request );
				},
			],
		] );
	}

	public function register_items_route( $methods = WP_REST_Server::READABLE ) {
		$this->register_route( '', $methods, function ( $request ) use ( $methods ) {
			return $this->base_callback( $methods, $request, true );
		} );
	}

	public function register_item_route( $methods = WP_REST_Server::READABLE, $args = [], $route = '/' ) {
		$id_arg_name = 'id';

		if ( ! empty( $args['id_arg_name'] ) ) {
			$id_arg_name = $args['id_arg_name'];

			unset( $args['id_arg_name'] );
		}

		$args = array_merge( [
			$id_arg_name => [
				'description' => 'Unique identifier for the object.',
				'type' => 'string',
			],
		], $args );

		$route .= '(?P<' . $id_arg_name . '>[\w]+)';

		$this->register_route( $route, $methods, function ( $request ) use ( $methods ) {
			return $this->base_callback( $methods, $request );
		}, $args );
	}

	public function base_callback( $methods, $request, $is_multi = false ) {
		if ( $request ) {
			$json_params = $request->get_json_params();

			if ( $json_params ) {
				$request->set_body_params( $json_params );
			}
		}

		$result = [];

		if ( $this->get_permission_callback( $request ) ) {
			switch ( $methods ) {
				case WP_REST_Server::READABLE:
					$result = $is_multi ? $this->get_items( $request ) : $this->get_item( $request->get_param( 'id' ), $request );
					break;

				case WP_REST_Server::CREATABLE:
					$result = $is_multi ? $this->create_items( $request ) : $this->create_item( $request->get_param( 'id' ), $request );
					break;

				case WP_REST_Server::EDITABLE:
					$result = $is_multi ? $this->update_items( $request ) : $this->update_item( $request->get_param( 'id' ), $request );
					break;

				case WP_REST_Server::DELETABLE:
					$result = $is_multi ? $this->delete_items( $request ) : $this->delete_item( $request->get_param( 'id' ), $request );
					break;
			}
		}

		return rest_ensure_response( $result );
	}
}
