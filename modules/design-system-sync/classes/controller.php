<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use WP_REST_Server;
use WP_REST_Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Controller {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'design-system-sync';

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
		$stylesheet = new Stylesheet_Manager();
		$result = $stylesheet->generate();

		return new WP_REST_Response( [
			'success' => true,
			'data' => $result,
		] );
	}

	public function has_permission(): bool {
		return current_user_can( 'edit_posts' );
	}
}
