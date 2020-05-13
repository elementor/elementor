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
	 * Controller of current endpoint.
	 *
	 * @var \Elementor\Data\Base\Controller
	 */
	protected $controller;

	/**
	 * Loaded sub endpoint(s).
	 *
	 * @var \Elementor\Data\Base\SubEndpoint[]
	 */
	private $sub_endpoints = [];

	/**
	 * Endpoint constructor.
	 *
	 * run `$this->>register()`.
	 *
	 * @param \Elementor\Data\Base\Controller $controller
	 *
	 * @throws \Exception
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

	/**
	 * Get base route.
	 *
	 * Removing 'index' from endpoint.
	 *
	 * @return string
	 */
	protected function get_base_route() {
		$endpoint_name = $this->get_name();

		// TODO: Allow this only for internal routes.
		if ( 'index' === $endpoint_name ) {
			$endpoint_name = '';
		}

		return '/' . $this->controller->get_rest_base() . '/' . $endpoint_name;
	}

	/**
	 * Register the endpoint.
	 *
	 * By default: register get items route.
	 *
	 * @throws \Exception
	 */
	protected function register() {
		$this->register_items_route();
	}

	/**
	 * Register sub endpoint.
	 *
	 * @param string $route
	 * @param string $endpoint_class
	 *
	 * @throws \Exception
	 */
	protected function register_sub_endpoint( $route, $endpoint_class ) {
		$endpoint_instance = new $endpoint_class( $route, $this );

		if ( ! ( $endpoint_instance instanceof SubEndpoint ) ) {
			throw new \Exception( 'Invalid endpoint instance.' );
		}

		$endpoint_route = $route . '/' . $endpoint_instance->get_name();

		$this->sub_endpoints[ $endpoint_route ] = $endpoint_instance;
	}

	/**
	 * Register item route.
	 *
	 * @param array  $args
	 * @param string $route
	 * @param string $methods
	 *
	 * @throws \Exception
	 */
	public function register_item_route( $args = [], $route = '/', $methods = WP_REST_Server::READABLE ) {
		$args = array_merge( [
			'id' => [
				'description' => 'Unique identifier for the object.',
				'type' => 'string',
			],
		], $args );

		if ( isset( $args['id'] ) && $args['id'] ) {
			$route .= '(?P<id>[\w]+)/';
		}

		$this->register_route( $route, $methods, function ( $request ) {
			return rest_ensure_response( $this->get_item( $request->get_param( 'id' ), $request ) );
		}, $args );
	}

	/**
	 * Register items route.
	 *
	 * @param string $methods
	 *
	 * @throws \Exception
	 */
	public function register_items_route( $methods = WP_REST_Server::READABLE ) {
		// TODO: Handle permission callback.

		$this->register_route( '', $methods, function ( $request ) use ( $methods ) {
			switch ( $methods ) {
				case WP_REST_Server::READABLE:
					return rest_ensure_response( $this->get_items( $request ) );

				case WP_REST_Server::CREATABLE:
					return rest_ensure_response( $this->create_items( $request ) );

				default:
					throw new \Exception( 'Invalid method.' );
			}
		} );
	}

	/**
	 * Register route.
	 *
	 * @param string $route
	 * @param string $methods
	 * @param null   $callback
	 * @param array  $args
	 *
	 * @throws \Exception
	 *
	 * @return bool
	 */
	public function register_route( $route = '', $methods = WP_REST_Server::READABLE, $callback = null, $args = [] ) {
		if ( ! in_array( $methods, self::AVAILABLE_METHODS, true ) ) {
			throw new \Exception( 'Invalid method.' );
		}

		$route = $this->get_base_route() . $route;

		return register_rest_route( $this->controller->get_namespace(), $route, [
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

	protected function create_item( $id, $request ) {
		return $this->controller->create_item( $request );
	}

	protected function create_items( $request ) {
		return new \WP_Error( 'invalid-method', sprintf( __( "Method '%s' not implemented. Must be overridden in subclass." ), __METHOD__ ), array( 'status' => 405 ) );
	}

	/**
	 * Permission callback.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return boolean
	 */
	public function permission_callback( $request ) {
		return $this->controller->permission_callback( $request );
	}
}
