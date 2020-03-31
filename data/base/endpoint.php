<?php

namespace Elementor\Data\Base;

use WP_REST_Server;

abstract class Endpoint {

	/**
	 * @var \Elementor\Data\Base\Controller
	 */
	protected $controller;

	/**
	 * @var string
	 */
	protected $context;

	/**
	 * Endpoint constructor.
	 *
	 * @param \Elementor\Data\Base\Controller $controller
	 * @param string $context
	 */
	public function __construct( $controller, $context ) {
		$this->controller = $controller;
		$this->context = $context;

		$this->register();
	}

	abstract protected function get_name();

	protected function register() {
		$this->register_get_items_route();
	}

	public function register_get_item_route( $args = [], $default_args = '/(?P<id>[\w]+)' ) {
		$args = array_merge( [
			'id' => [
				'description' => __( 'Unique identifier for the object.' ),
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
		$endpoint_name = $this->get_name();

		// TODO: Allow this only for internal routes.
		if ( 'index' === $this->context ) {
			$endpoint_name = '';
		}

		$route = '/' . $this->controller->get_reset_base() . '/' . $endpoint_name . $route;

		register_rest_route( $this->controller->get_namespace(), $route, [
			[
				'args' => $args,
				'methods' => $methods,
				'callback' => $callback,
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
			if ( 'index' === $endpoint->context ) {
				continue;
			}

			$response [ $endpoint->get_name() ] = $endpoint->get_items( $request );
		}

		return $response;
	}
}
