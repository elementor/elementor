<?php

namespace Elementor\Modules\Mcp\Super_Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Super_Admin_Access {

	protected function forbidden_error(): ?\WP_Error {
		if ( Super_Admin_Settings::current_user_can_use() ) {
			return null;
		}

		return $this->error( 'rest_forbidden', __( 'Sorry, you are not allowed to do that.', 'elementor' ), \WP_Http::FORBIDDEN );
	}

	protected function error( string $code, string $message, int $status ): \WP_Error {
		return new \WP_Error( $code, $message, [ 'status' => $status ] );
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	public function is_exposed_in_rest(): bool {
		return false;
	}
}
