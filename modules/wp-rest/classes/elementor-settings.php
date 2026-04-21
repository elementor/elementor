<?php

namespace Elementor\Modules\WpRest\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Settings {

	private function get_writable_options_schema(): array {
		return [
			'elementor_active_kit' => [
				'type' => 'integer',
				'sanitize' => 'absint',
			],
			'elementor_pro_theme_builder_conditions' => [
				'type' => 'array',
				'sanitize' => function ( $val ) {
					return is_array( $val ) ? $val : [];
				},
			],
		];
	}

	private function is_option_writable( string $key ): bool {
		$schema = $this->get_writable_options_schema();
		return isset( $schema[ $key ] );
	}

	private function sanitize_option_value( string $key, $value ) {
		$schema = $this->get_writable_options_schema();

		if ( ! isset( $schema[ $key ] ) ) {
			return $value;
		}

		$option_schema = $schema[ $key ];

		if ( isset( $option_schema['sanitize'] ) && is_callable( $option_schema['sanitize'] ) ) {
			return call_user_func( $option_schema['sanitize'], $value );
		}

		return $value;
	}

	public function register(): void {
		register_rest_route('elementor/v1', '/settings/(?P<key>[\w_-]+)', [
			[
				'methods' => \WP_REST_Server::READABLE,
				'permission_callback' => function (): bool {
					return current_user_can( 'manage_options' );
				},
				'sanitize_callback' => function ( string $param ): string {
					return esc_attr( $param );
				},
				'validate_callback' => function ( \WP_REST_Request $request ): bool {
					$params = $request->get_params();

					return 0 === strpos( $params['key'], 'elementor' );
				},
				'callback' => function ( $request ): \WP_REST_Response {
					try {
						$key = $request->get_param( 'key' );
						$current_value = get_option( $key );

						return new \WP_REST_Response([
							'success' => true,
							// Nest in order to allow extending the response with more details.
							'data' => [
								'value' => $current_value,
							],
						], 200);
					} catch ( \Exception $e ) {
						return new \WP_REST_Response([
							'success' => false,
							'data' => [
								'message' => $e->getMessage(),
							],
						], 500);
					}
				},
			],
		]);

		register_rest_route('elementor/v1', '/settings/(?P<key>[\w_-]+)', [
			[
				'methods' => \WP_REST_Server::EDITABLE,
				'permission_callback' => function (): bool {
					return current_user_can( 'manage_options' );
				},
				'sanitize_callback' => function ( string $param ): string {
					return esc_attr( $param );
				},
				'validate_callback' => function ( \WP_REST_Request $request ): bool {
					$params = $request->get_params();
					if ( 0 !== strpos( $params['key'], 'elementor' ) || ! isset( $params['value'] ) ) {
						return false;
					}
					return $this->is_option_writable( $params['key'] );
				},
				'callback' => function ( \WP_REST_Request $request ): \WP_REST_Response {
					$key = $request->get_param( 'key' );
					$new_value = $request->get_param( 'value' );

					if ( ! $this->is_option_writable( $key ) ) {
						return new \WP_REST_Response([
							'success' => false,
							'data' => [
								'message' => 'This option is not writable via the REST API.',
							],
						], 403);
					}

					$sanitized_value = $this->sanitize_option_value( $key, $new_value );
					$current_value = get_option( $key );

					if ( $sanitized_value === $current_value ) {
						return new \WP_REST_Response([
							'success' => true,
						], 200);
					}

					$success = update_option( $key, $sanitized_value );
					if ( $success ) {
						return new \WP_REST_Response([
							'success' => true,
							'data' => [
								'message' => 'Setting updated successfully.',
							],
						], 200);
					} else {
						return new \WP_REST_Response([
							'success' => false,
							'data' => [
								'message' => 'Failed to update setting.',
							],
						], 500);
					}
				},
			],
		]);
	}
}
