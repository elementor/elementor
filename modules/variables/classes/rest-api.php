<?php

namespace Elementor\Modules\Variables\Classes;

use Exception;
use WP_REST_Response;
use WP_REST_Server;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Rest_Api {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'variables';

	private const HTTP_OK = 200;
	private const HTTP_ERROR = 500;

	private const GENERIC_ERROR_MESSAGE = 'Unexpected server error';

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

	public function update_variable( string $id, array $payload ) {
		try {
			$should_clear_cache = $this->should_reload_cache( $id, $payload );

			$this->get_repository()->update( $id, $payload );

			if ( $should_clear_cache ) {
				Plugin::$instance->files_manager->clear_cache();
			}

			return new WP_REST_Response( [
				'message' => 'Variable updated successfully',
				'id' => $id,
			], self::HTTP_OK );
		} catch ( Exception $e ) {
			return $this->error_response( $e );
		}
	}

	private function should_reload_cache( string $id, array $payload ): bool {
		$variable = $this->get_repository()->find_by_id( $id );

		return $variable['label'] !== $payload['label'];
	}

	private function get_repository() {
		return new Variables_Repository( Plugin::$instance->kits_manager->get_active_kit() );
	}

	private function list_of_variables() {
		return new WP_REST_Response( [
			'data' => ( new Variables() )->get_all(),
			'watermark' => time(),
		], self::HTTP_OK );
	}

	private function error_response( Exception $e ) {
		return new WP_REST_Response( [
			'message' => self::GENERIC_ERROR_MESSAGE,
			'details' => $e->getMessage(),
		], self::HTTP_ERROR );
	}
}
