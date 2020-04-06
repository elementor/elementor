<?php

namespace Elementor\Data\Base;

use WP_REST_Controller;
use WP_REST_Server;

abstract class Controller extends WP_REST_Controller {

	const ROOT_NAMESPACE = 'elementor';

	const REST_BASE = '';

	const VERSION = '1';

	public $endpoints = [];

	/**
	 * Controller constructor.
	 */
	public function __construct() {
		$this->namespace = self::ROOT_NAMESPACE . '/v' . static::VERSION;
		$this->rest_base = static::REST_BASE . $this->get_name();

		add_action( 'rest_api_init', function () {
			$this->register_internal_endpoints();
			$this->register_endpoints();
		} );
	}

	/**
	 * Get controller name.
	 *
	 * @return string
	 */
	abstract protected function get_name();

	/**
	 * Get controller namespace.
	 * @return string
	 */
	public function get_namespace() {
		return $this->namespace;
	}

	/**
	 * Get controller reset base.
	 *
	 * @return string
	 */
	public function get_rest_base() {
		return $this->rest_base;
	}

	/**
	 * Get controller route.
	 *
	 * @return string
	 */
	public function get_controller_route() {
		return $this->get_namespace() . '/' . $this->get_rest_base();
	}

	/**
	 * Retrieves the index for a controller.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_controller_index() {
		$server = rest_get_server();
		$routes = $server->get_routes();

		$endpoints = array_intersect_key( $server->get_routes(), $routes );

		$controller_route = $this->get_controller_route();

		array_walk( $endpoints, function ( &$item, $endpoint ) use ( &$endpoints, $controller_route ) {
			if ( ! strstr( $endpoint, $controller_route ) ) {
				unset( $endpoints[ $endpoint ] );
			}
		} );

		$data = [
			'namespace' => $this->get_namespace(),
			'controller' => $controller_route,
			'routes' => $server->get_data_for_routes( $endpoints ),
		];

		$response = rest_ensure_response( $data );

		// Link to the root index.
		$response->add_link( 'up', rest_url( '/' ) );

		return $response;
	}

	abstract public function register_endpoints();

	protected function register_internal_endpoints() {
		register_rest_route( $this->get_namespace(), '/' . $this->get_rest_base(), [
			[
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_items' ),
				'args' => [],
				'permission_callback' => function( $request ) {
					return $this->permission_callback( $request );
				},
			],
		] );
	}

	protected function register_endpoint( $class ) {
		$endpoint_instance = new $class( $this );
		$endpoint_route = $this->get_name() . '/' . $endpoint_instance->get_name();

		$this->endpoints[ $endpoint_route ] = $endpoint_instance;
	}

	public function get_items( $request ) {
		return $this->get_controller_index( $request );
	}

	public function permission_callback( $request ) {
		switch ( $request->get_method() ) {
			case 'GET':
			case 'POST':
			case 'UPDATE':
			case 'PUT':
			case 'DELETE':
				// TODO: Handle all the situations.
				return current_user_can( 'edit_posts' );
		}

		return false;
	}
}
