<?php

namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

abstract class Base_Route {
	public function __construct() {}

	public function register_route( $name_space, $base_route ): void {
		register_rest_route( $name_space, '/' . $base_route . '/' . $this->get_route(), [
			[
				'methods' => $this->get_method(),
				'callback' => fn( $request ) => $this->callback( $request ),
				'permission_callback' => $this->permission_callback(),
				'args' => $this->get_args(),
			],
		] );
	}

	abstract protected function get_route(): string;

	abstract protected function get_method(): string;

	abstract protected function callback( $request ): \WP_REST_Response;

	protected function permission_callback(): callable {
		return function( $request ) {
			if ( ! current_user_can( 'manage_options' ) ) {
				return false;
			}

			return $this->verify_nonce_from_request( $request );
		};
	}

	private function verify_nonce_from_request( $request ): bool {
		$header_nonce = $request->get_header( 'X-WP-Nonce' );
		if ( ! empty( $header_nonce ) && wp_verify_nonce( $header_nonce, 'wp_rest' ) ) {
			return true;
		}

		$param_nonce = sanitize_text_field( wp_unslash( $_REQUEST['_wpnonce'] ?? $_REQUEST['_nonce'] ?? '' ) );
		if ( empty( $param_nonce ) ) {
			return false;
		}

		if ( wp_verify_nonce( $param_nonce, 'wp_rest' ) ) {
			return true;
		}

		return wp_verify_nonce( $param_nonce, 'elementor_admin' );
	}

	abstract protected function get_args(): array;
}
