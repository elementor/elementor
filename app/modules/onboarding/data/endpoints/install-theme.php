<?php

namespace Elementor\App\Modules\Onboarding\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Install_Theme extends Endpoint_Base {

	const ALLOWED_THEMES = [ 'hello-elementor', 'hello-biz' ];

	public function get_name(): string {
		return 'install-theme';
	}

	public function get_format(): string {
		return 'onboarding';
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

		if ( empty( $theme_slug ) || ! in_array( $theme_slug, self::ALLOWED_THEMES, true ) ) {
			return new \WP_Error(
				'invalid_theme',
				__( 'Invalid or unsupported theme.', 'elementor' ),
				[ 'status' => 400 ]
			);
		}

		if ( ! current_user_can( 'install_themes' ) || ! current_user_can( 'switch_themes' ) ) {
			return new \WP_Error(
				'insufficient_permissions',
				__( 'You do not have permission to install themes.', 'elementor' ),
				[ 'status' => 403 ]
			);
		}

		$theme = wp_get_theme( $theme_slug );

		if ( ! $theme->exists() ) {
			if ( ! function_exists( 'request_filesystem_credentials' ) ) {
				require_once ABSPATH . 'wp-admin/includes/file.php';
			}

			if ( ! class_exists( '\Theme_Upgrader' ) ) {
				require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
			}

			if ( ! class_exists( '\WP_Ajax_Upgrader_Skin' ) ) {
				require_once ABSPATH . 'wp-admin/includes/class-wp-ajax-upgrader-skin.php';
			}

			$skin = new \WP_Ajax_Upgrader_Skin();
			$upgrader = new \Theme_Upgrader( $skin );
			$result = $upgrader->install( "https://downloads.wordpress.org/theme/{$theme_slug}.latest-stable.zip" );

			if ( is_wp_error( $result ) || ! $result ) {
				return new \WP_Error(
					'theme_install_failed',
					__( 'Failed to install the theme.', 'elementor' ),
					[ 'status' => 500 ]
				);
			}
		}

		switch_theme( $theme_slug );

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
				__( 'Sorry, you are not allowed to access onboarding data.', 'elementor' ),
				[ 'status' => 403 ]
			);
		}
		return true;
	}
}
