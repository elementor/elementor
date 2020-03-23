<?php

namespace Elementor\Data\Base;

use WP_REST_Server;

abstract class Endpoint {
	private $controller;

	/**
	 * Endpoint constructor.
	 *
	 * @param \Elementor\Data\Base\Controller $controller
	 */
	public function __construct( $controller ) {
		$this->controller = $controller;

		$this->register();
	}

	abstract protected function get_name();

	protected function register() {
		register_rest_route( $this->controller->get_namespace(), '/' . $this->controller->get_reset_base() . '/' . $this->get_name(), [
			[
				'methods' => WP_REST_Server::READABLE,
				'callback' => function ( $request ) {
					return rest_ensure_response( $this->get_items( $request ) );
				},
				'args' => [],
			],
		] );
	}

	/**
	 * Retrieves a collection of items.
	 *
	 * @param WP_REST_Request $request Full data about the request.
	 * @return WP_Error|WP_REST_Response Response object on success, or WP_Error object on failure.
	 */
	abstract protected function get_items( $request );

	protected function response( $data ) {
		return [];
	}
}
