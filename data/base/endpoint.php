<?php

namespace Elementor\Data\Base;

use WP_REST_Server;

abstract class Endpoint {
	const AVAILABLE_METHODS = [
		WP_REST_Server::READABLE,
		WP_REST_Server::CREATABLE,
		WP_REST_Server::EDITABLE,
		WP_REST_Server::DELETABLE,
		WP_REST_Server::ALLMETHODS,
	];

	/**
	 * @var \Elementor\Data\Base\Controller
	 */
	protected $controller;

	/**
	 * Endpoint constructor.
	 *
	 * @param \Elementor\Data\Base\Controller $controller
	 */
	public function __construct( $controller ) {
		$this->controller = $controller;
		$this->register();
	}

	/**
	 * Get endpoint name.
	 *
	 * @return string
	 */
	abstract protected function get_name();

	protected function register() {
		$this->register_get_items_route();
	}

	public function register_get_item_route( $args = [], $default_args = '/(?P<id>[\w]+)' ) {
		$args = array_merge( [
			'id' => [
				'description' => 'Unique identifier for the object.',
				'type' => 'string',
			],
		], $args );

		$this->register_route( $default_args, WP_REST_Server::READABLE, function ( $request ) {
			return rest_ensure_response( $this->get_item( $request->get_param( 'id' ), $request ) );
		}, $args );
	}

	public function register_get_items_route() {
		$this->register_route( '', WP_REST_Server::READABLE, function ( $request ) {
			return rest_ensure_response( $this->get_items( $request ) );
		} );
	}

	public function register_route( $route = '', $methods = WP_REST_Server::READABLE, $callback = null, $args = [] ) {
		if ( ! in_array( $methods, self::AVAILABLE_METHODS, true ) ) {
			throw new \Exception( 'Invalid method' );
		}

		$endpoint_name = $this->get_name();

		// TODO: Allow this only for internal routes.
		if ( 'index' === $endpoint_name ) {
			$endpoint_name = '';
		}

		$route = '/' . $this->controller->get_rest_base() . '/' . $endpoint_name . $route;

		register_rest_route( $this->controller->get_namespace(), $route, [
			[
				'args' => $args,
				'methods' => $methods,
				'callback' => $callback,
				'permission_callback' => function( $request ) {
					return $this->permission_callback( $request );
				},
			],
		] );
	}

	/**
	 * Retrieves a collection of items.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	protected function get_items( $request ) {
		return $this->controller->get_items( $request );
	}

	/**
	 * Retrieves one item from the collection.
	 *
	 * @param string           $id
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	protected function get_item( $id, $request ) {
		return $this->controller->get_item( $request );
	}

	/**
	 * Retrieves a recursive collection of items.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return array
	 */
	protected function get_items_recursive( $request ) {
		$response = [];

		foreach ( $this->controller->endpoints as $endpoint ) {
			// Skip self.
			if ( $this === $endpoint ) {
				continue;
			}

			$response[ $endpoint->get_name() ] = $endpoint->get_items( $request );
		}

		return $response;
	}

	/**
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return boolean
	 */
	public function permission_callback( $request ) {
		return $this->controller->permission_callback( $request );
	}
}
