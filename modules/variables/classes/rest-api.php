<?php

namespace Elementor\Modules\Variables\Classes;

use Exception;
use WP_REST_Response;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Rest_Api {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'variables';

	public function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/list', [
			'methods' => WP_REST_Server::READABLE,
			'callback' => [ $this, 'get_variables' ],
			'permission_callback' => '__return_true',
		] );
	}

	public function get_variables() {
		try {
			return $this->list_of_variables();
		} catch ( Exception $e ) {
			return $this->error_response( $e );
		}
	}

	private function list_of_variables() {
		return new WP_REST_Response( [
			'data' => ( new Variables() )->get_all(),
			'watermark' => time(),
		], 200 );
	}

	private function error_response( Exception $e ) {
		return new WP_REST_Response( [
			'message' => 'Unexpected server error',
			'details' => $e->getMessage(),
		], 500 );
	}
}
