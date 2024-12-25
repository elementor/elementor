<?php

namespace Elementor\Modules\WpRest\Classes;

use Exception;
use WP_REST_Request;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

class ElementorSettings {

	public function register(): void {
		register_rest_route('elementor/v1', '/settings/(?P<key>[\w_-]+)', [
			[
				'methods' => WP_REST_Server::READABLE,
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'sanitize_callback' => function ( $param ) {
					return esc_attr( $param );
				},
				'validate_callback' => function ( $request ) {
					/** @var WP_REST_Request $request */
					$params = $request->get_params();

					return 0 === strpos( $params['key'], 'elementor' );
				},
				'callback' => function ( $request ) {
					try {
						$key = $request->get_param( 'key' );
						$current_value = get_option( $key );

						wp_send_json_success([
							// Nest in order to allow extending the response with more details
							'value' => $current_value,
						]);
					} catch ( Exception $e ) {
						wp_send_json_error([
							'message' => $e->getMessage(),
						]);
					}
				},
			],
		]);

		register_rest_route('elementor/v1', '/settings/(?P<key>[\w_-]+)', [
			[
				'methods' => WP_REST_Server::EDITABLE,
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'sanitize_callback' => function ( $param ) {
					return esc_attr( $param );
				},
				'validate_callback' => function ( $request ) {
					/** @var WP_REST_Request $request */
					$params = $request->get_params();
					return 0 === strpos( $params['key'], 'elementor' ) && isset( $params['value'] );
				},
				'callback' => function ( $request ) {
					$key = $request->get_param( 'key' );
					$new_value = $request->get_param( 'value' );
					$current_value = get_option( $key );

					if ( $new_value === $current_value ) {
						wp_send_json_success();
					}

					$success = update_option( $key, $new_value );
					if ( $success ) {
						wp_send_json_success([
							'message' => 'Setting updated successfully.',
						]);
					} else {
						wp_send_json_error([
							'message' => 'Failed to update setting.',
						]);
					}
				},
			],
		]);
	}
}
