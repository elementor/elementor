<?php

namespace Elementor\Modules\Ai\SitePlannerConnect;

defined( 'ABSPATH' ) || exit;

/**
 * Just a simple rest api to validate new Site Planner Connect feature is exist.
 */
class WpRestApi {

	public function register(): void {
		register_rest_route('elementor-ai/v1', 'permissions', [
			[
				'methods' => \WP_REST_Server::READABLE,
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'callback' => function ( $request ) {
					try {
						wp_send_json_success( [
							'SitePlannerConnect' => true,
						] );
					} catch ( \Exception $e ) {
						wp_send_json_error( [
							'message' => $e->getMessage(),
						] );
					}
				},
			],
		] );
	}
}
