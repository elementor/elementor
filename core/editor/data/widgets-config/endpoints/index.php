<?php
namespace Elementor\Core\Editor\Data\WidgetsConfig\Endpoints;

use Elementor\Data\Base\Endpoint;

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
			[
				'exclude' => [
					'description' => 'ids of widgets that should be excluded',
					'type' => 'array',
					'default' => [],
					'items' => [
						'type' => 'string',
					],
				],
			]
		);

		$this->register_route(
			'(?P<id>[\w]+)/',
			\WP_REST_Server::READABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::READABLE, $request );
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
