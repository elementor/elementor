<?php

namespace Elementor\Modules\AtomicConverters;

use Elementor\Modules\AtomicConverters\Css\Converter_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Rest_Api {
	private Converter_Registry $registry;

	public function __construct( Converter_Registry $registry ) {
		$this->registry = $registry;
	}

	public function register_routes() {
		register_rest_route( 'elementor/v1', '/css-to-atomic', [
			'methods' => 'POST',
			'callback' => [ $this, 'handle_css_to_atomic_request' ],
			'permission_callback' => function() {
				return current_user_can( 'edit_posts' );
			},
			'args' => [
				'cssString' => [
					'type' => 'string',
					'required' => true,
				],
			],
		] );
	}

	public function handle_css_to_atomic_request( \WP_REST_Request $request ) {
		$params = $request->get_json_params();

		$service = new Css_Converter( $this->registry );
		$result = $service->convert( $params );

		return rest_ensure_response( $result );
	}
}

