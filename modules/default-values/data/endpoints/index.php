<?php
namespace Elementor\Modules\DefaultValues\Data\Endpoints;

use Elementor\Data\Base\Endpoint;

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
			'(?P<type>[\w]+)/',
			\WP_REST_Server::CREATABLE,
			function ( $request ) {
				return $this->base_callback( \WP_REST_Server::CREATABLE, $request, false );
			},
			[
				'type' => [
					'description' => 'Unique identifier for the object.',
					'required' => true,
					'type' => 'string',
				],
			]
		);
	}
}
