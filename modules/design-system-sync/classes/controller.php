<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Exception;
use WP_REST_Server;
use WP_REST_Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Controller {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'design-system-sync';
	const HTTP_CREATED = 201;
	const HTTP_INTERNAL_SERVER_ERROR = 500;

	public function register_hooks() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
	}

	public function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/stylesheet' , [
			'methods' => WP_REST_Server::CREATABLE,
			'callback' => [ $this, 'generate' ],
			'permission_callback' => [ $this, 'has_permission' ],
		] );
	}

	public function generate(): WP_REST_Response {
		try {
			$stylesheet = new Stylesheet_Manager();
			$result = $stylesheet->generate();

			return new WP_REST_Response( $result, self::HTTP_CREATED );
		} catch ( Exception $e ) {
			return new WP_REST_Response(
				[ 'message' => $e->getMessage() ],
				self::HTTP_INTERNAL_SERVER_ERROR
			);
		}
	}

	public function has_permission(): bool {
		return current_user_can( 'edit_posts' );
	}
}
