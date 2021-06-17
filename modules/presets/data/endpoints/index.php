<?php
namespace Elementor\Modules\Presets\Data\Endpoints;

use ElementorPro\Data\Base\Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Index extends Endpoint {
	public function get_name() {
		return 'index';
	}

	protected function register() {
		$this->register_route(
			'',
			\WP_REST_Server::READABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::READABLE, $request, true );
			},
			[]
		);

		$this->register_route(
			'',
			\WP_REST_Server::CREATABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::READABLE, $request, true );
			},
			[]
		);

		$this->register_route(
			'(?P<id>[\d]+)/',
			\WP_REST_Server::EDITABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::DELETABLE, $request );
			},
			[
				'id' => [
					'description' => 'Unique identifier for the object.',
					'type' => 'string',
					'required' => true,
				],
			]
		);

		$this->register_route(
			'(?P<id>[\d]+)/',
			\WP_REST_Server::DELETABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::DELETABLE, $request );
			},
			[
				'id' => [
					'description' => 'Unique identifier for the object.',
					'type' => 'string',
					'required' => true,
				],
			]
		);
	}
}
