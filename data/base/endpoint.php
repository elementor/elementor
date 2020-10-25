<?php

namespace Elementor\Data\Base;

use Elementor\Data\Base\Endpoint\Index;
use Elementor\Data\Manager;
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
	protected $sub_endpoints = [];

	/**
	 * Endpoint constructor.
	 *
	 * run `$this->>register()`.
	 *
	 * @param \Elementor\Data\Base\Controller $controller
	 */
	public function __construct( Controller $controller ) {
		$this->controller = $controller;
		$this->register();
	}

	/**
	 * Get endpoint name.
	 *
	 * @return string
	 */
	abstract public function get_name();

	/**
	 * Get format.
	 *
	 * @note The formats that generated using this function,
	 * will be used only be `Data\Manager::run()`.
	 *
	 * @return string
	 */
	public function get_format() {
		return '';
	}

	/**
	 * Get base route.
	 *
	 * @note This method should always return the base route starts with '/' and end without '/'.
	 *
	 * @return string
	 */
	public function get_base_route() {
		$endpoint_public_name = $this->get_name_public();

		return rtrim( '/' . $this->controller->get_rest_base() . '/' . $endpoint_public_name, '/' );
	}

	/**
	 * Get command public, name ( empty '' for index endpoint ).
	 *
	 * @return string
	 */
	public function get_name_public() {
		return $this->get_name();
	}

	/**
	 * Convert endpoint to full command name ( including index ).
	 */
	public function get_full_command() {
		return $this->controller->get_full_name() . '/' . $this->get_name();
	}

	/**
	 * Register the endpoint.
	 *
	 * By default: register get items route.
	 */
	protected function register() {
		$this->register_items_route();
	}

	/**
	 * Register sub endpoint.
	 *
	 * @param \Elementor\Data\Base\SubEndpoint $endpoint
	 *
	 * @return \Elementor\Data\Base\SubEndpoint
	 */
	public function register_sub_endpoint( SubEndpoint $endpoint ) {
		$command = $endpoint->get_full_command();
		$format = $endpoint->get_format();

		$this->sub_endpoints[ $command ] = $endpoint;

		Manager::instance()->register_endpoint_format( $command, $format );

		return $endpoint;
	}

	/**
	 * Base callback.
	 *
	 * All reset requests from the client should pass this function.
	 *
	 * @param string $methods
	 * @param \WP_REST_Request $request
	 * @param bool $is_multi
	 *
	 * @return mixed|\WP_Error|\WP_HTTP_Response|\WP_REST_Response
	 * @throws \Exception
	 */
	public function base_callback( $methods, $request, $is_multi = false ) {
		// TODO: Find better solution.
		$json_params = $request->get_json_params();

		if ( $json_params ) {
			$request->set_body_params( $json_params );
		}

		// TODO: Handle permission callback.
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

			default:
				throw new \Exception( 'Invalid method.' );
		}

		return rest_ensure_response( $result );
	}

	/**
	 * Retrieves a collection of items.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_items( $request ) {
		return $this->controller->get_items( $request );
	}

	/**
	 * Retrieves one item from the collection.
	 *
	 * @param string $id
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function get_item( $id, $request ) {
		return $this->controller->get_item( $request );
	}

	/**
	 * Get permission callback.
	 *
	 * By default get permission callback from the controller.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return boolean
	 */
	public function get_permission_callback( $request ) {
		return $this->controller->get_permission_callback( $request );
	}

	/**
	 * Creates one item.
	 *
	 * @param string $id id of request item.
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function create_item( $id, $request ) {
		return $this->controller->create_item( $request );
	}

	/**
	 * Creates multiple items.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function create_items( $request ) {
		return new \WP_Error( 'invalid-method', sprintf( "Method '%s' not implemented. Must be overridden in subclass.", __METHOD__ ), array( 'status' => 405 ) );
	}

	/**
	 * Updates one item.
	 *
	 * @param string $id id of request item.
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function update_item( $id, $request ) {
		return $this->controller->update_item( $request );
	}

	/**
	 * Updates multiple items.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function update_items( $request ) {
		return new \WP_Error( 'invalid-method', sprintf( "Method '%s' not implemented. Must be overridden in subclass.", __METHOD__ ), array( 'status' => 405 ) );
	}

	/**
	 * Delete one item.
	 *
	 * @param string $id id of request item.
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function delete_item( $id, $request ) {
		return $this->controller->update_item( $request );
	}

	/**
	 * Delete multiple items.
	 *
	 * @param \WP_REST_Request $request Full data about the request.
	 *
	 * @return \WP_Error|\WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	public function delete_items( $request ) {
		return new \WP_Error( 'invalid-method', sprintf( "Method '%s' not implemented. Must be overridden in subclass.", __METHOD__ ), array( 'status' => 405 ) );
	}

	/**
	 * Register item route.
	 *
	 * @param string $route
	 * @param array $args
	 * @param string $methods
	 */
	public function register_item_route( $methods = WP_REST_Server::READABLE, $args = [], $route = '/' ) {
		$id_arg_name = 'id';

		if ( isset( $args['id_arg_name'] ) && $args['id_arg_name'] ) {
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

	/**
	 * Register items route.
	 *
	 * @param string $methods
	 */
	public function register_items_route( $methods = WP_REST_Server::READABLE ) {
		$this->register_route( '', $methods, function ( $request ) use ( $methods ) {
			return $this->base_callback( $methods, $request, true );
		} );
	}

	/**
	 * Register route.
	 *
	 * @param string $route
	 * @param string $methods
	 * @param null $callback
	 * @param array $args
	 *
	 * @return bool
	 */
	public function register_route( $route = '', $methods = WP_REST_Server::READABLE, $callback = null, $args = [] ) {
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
}
