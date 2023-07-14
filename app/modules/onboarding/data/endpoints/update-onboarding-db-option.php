<?php
namespace Elementor\App\Modules\Onboarding\Data\Endpoints;

use Elementor\App\Modules\Onboarding\Module;
use Elementor\Data\V2\Base\Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Update_Onboarding_DB_Option extends Endpoint {

	public function get_name() {
		return 'update-onboarding-db-option';
	}

	public function get_format() {
		return 'onboarding/update-onboarding-db-option';
	}

	public function register() {
		$this->register_items_route( \WP_REST_Server::CREATABLE );
	}

	public function create_items( $request ): array {
		$db_option = get_option( Module::ONBOARDING_OPTION );

		if ( ! $db_option ) {
			update_option( Module::ONBOARDING_OPTION, true );
		}

		return [
			'status' => 'success',
			'payload' => 'onboarding DB',
		];
	}

	public function get_permission_callback( $request ): bool {
		return current_user_can( 'manage_options' );
	}
}
