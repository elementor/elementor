<?php

namespace Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\App\Modules\E_Onboarding\Storage\Onboarding_Progress_Manager;
use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Install_Theme extends Endpoint_Base {

	public function get_name(): string {
		return 'install-theme';
	}

	public function get_format(): string {
		return 'e-onboarding';
	}

	protected function register(): void {
		parent::register();

		$this->register_items_route( WP_REST_Server::CREATABLE );
	}

	public function create_items( $request ) {
		$permission = $this->check_permission();
		if ( is_wp_error( $permission ) ) {
			return $permission;
		}

		$params = $request->get_json_params();
		$theme_slug = $params['theme_slug'] ?? '';

		if ( empty( $theme_slug ) ) {
			return new \WP_Error(
				'missing_theme_slug',
				__( 'Theme slug is required.', 'elementor' ),
				[ 'status' => 400 ]
			);
		}

		$manager = Onboarding_Progress_Manager::instance();
		$success = $manager->install_and_activate_theme( $theme_slug );

		if ( ! $success ) {
			return new \WP_Error(
				'theme_install_failed',
				__( 'Failed to install or activate the theme.', 'elementor' ),
				[ 'status' => 500 ]
			);
		}

		return [
			'data' => [
				'success' => true,
				'message' => 'theme_installed',
			],
		];
	}

	private function check_permission() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'Sorry, you are not allowed to access e-onboarding data.', 'elementor' ),
				[ 'status' => 403 ]
			);
		}
		return true;
	}
}
