<?php

namespace Elementor\Data\Base;

use WP_REST_Controller;
use WP_REST_Server;

abstract class Controller extends WP_REST_Controller {
	const DEFAULT_ROOT_NAMESPACE = 'elementor';

	private $manager;

	public $endpoints;

	public function __construct( $manager, $version = '1' ) {
		$this->manager = $manager;

		$this->namespace = self::DEFAULT_ROOT_NAMESPACE . '/v' . $version;
		$this->rest_base = $this->get_name();

		add_action( 'rest_api_init', function() {
			$this->register_internal_endpoints();
			$this->register_endpoints();
		} );
	}

	abstract protected function get_name();

	public function get_namespace() {
		return $this->namespace;
	}

	public function get_reset_base() {
		return $this->rest_base;
	}

	public function get_controller_base() {
		return $this->get_namespace() . '/' . $this->get_reset_base();
	}

	public function get_namespace_index( $request ) {
		$server = rest_get_server();
		$routes = $server->get_routes();

		$endpoints = array_intersect_key( $server->get_routes(), $routes );

		$controller_base = $this->get_controller_base();

		array_walk( $endpoints, function ( &$item, $key ) use ( & $endpoints, $controller_base ) {
			if ( ! strstr( $key, $controller_base ) ) {
				unset( $endpoints[ $key ] );
			}
		} );

		$data = [
			'namespace' => $this->get_namespace(),
			'controller' => $controller_base,
			'routes' => $server->get_data_for_routes( $endpoints ),
		];

		$response = rest_ensure_response( $data );

		// Link to the root index.
		$response->add_link( 'up', rest_url( '/' ) );

		return $response;
	}

	abstract public function register_endpoints();

	protected function register_internal_endpoints() {
		register_rest_route( $this->get_namespace(), '/' . $this->get_reset_base(), [
			[
				'methods' => WP_REST_Server::READABLE,
				'callback' => array( $this, 'get_items' ),
				'args' => [],
			],
		] );
	}

	protected function register_endpoint( $class, $context = '' ) {
		$endpoint_instance = new $class( $this, $context );
		$endpoint_route = $this->get_name() . '/' . $endpoint_instance->get_name();

		$this->endpoints[ $endpoint_route ] = $endpoint_instance;
	}

	public function get_items( $request ) {
		return $this->get_namespace_index( $request );
	}
}
