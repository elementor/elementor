<?php
namespace Elementor\App\Modules\Onboarding\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Activate_Hello_Theme extends Endpoint {

	public function get_name() {
		return 'activate-hello-theme';
	}

	public function get_format() {
		return 'onboarding/activate-hello-theme';
	}

	public function register() {
		$this->register_items_route( \WP_REST_Server::CREATABLE );
	}

	public function create_items( $request ): array {
		switch_theme( 'hello-elementor' );

		return [
			'status' => 'success',
			'payload' => [
				'helloThemeActivated' => true,
			],
		];
	}

	public function get_permission_callback( $request ): bool {
		return current_user_can( 'switch_themes' );
	}
}
