<?php

namespace Elementor\App\Modules\Onboarding\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Install_Plugin extends Endpoint_Base {

	const ALLOWED_PLUGINS = [ 'cookiez' ];

	public function get_name(): string {
		return 'install-plugin';
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
		$plugin_slug = $params['plugin_slug'] ?? '';

		if ( empty( $plugin_slug ) || ! in_array( $plugin_slug, self::ALLOWED_PLUGINS, true ) ) {
			return new \WP_Error(
				'invalid_plugin',
				__( 'Invalid or unsupported plugin.', 'elementor' ),
				[ 'status' => 400 ]
			);
		}

		if ( ! current_user_can( 'install_plugins' ) || ! current_user_can( 'activate_plugins' ) ) {
			return new \WP_Error(
				'insufficient_permissions',
				__( 'You do not have permission to install plugins.', 'elementor' ),
				[ 'status' => 403 ]
			);
		}

		if ( ! function_exists( 'get_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$installed_plugin_file = $this->find_installed_plugin_file( $plugin_slug );

		if ( null === $installed_plugin_file ) {
			$installed_plugin_file = $this->install_plugin( $plugin_slug );

			if ( is_wp_error( $installed_plugin_file ) ) {
				return $installed_plugin_file;
			}
		}

		if ( is_plugin_active( $installed_plugin_file ) ) {
			return [
				'data' => [
					'success' => true,
					'message' => 'already_active',
				],
			];
		}

		$activated = activate_plugin( $installed_plugin_file );

		if ( is_wp_error( $activated ) ) {
			return new \WP_Error(
				'plugin_activation_failed',
				$activated->get_error_message(),
				[ 'status' => 500 ]
			);
		}

		return [
			'data' => [
				'success' => true,
				'message' => 'plugin_installed',
			],
		];
	}

	private function find_installed_plugin_file( string $plugin_slug ): ?string {
		$plugins = get_plugins();

		foreach ( $plugins as $plugin_file => $plugin_data ) {
			if ( 0 === strpos( $plugin_file, $plugin_slug . '/' ) ) {
				return $plugin_file;
			}
		}

		return null;
	}

	private function install_plugin( string $plugin_slug ) {
		if ( ! function_exists( 'plugins_api' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin-install.php';
		}

		if ( ! function_exists( 'request_filesystem_credentials' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		if ( ! class_exists( '\Plugin_Upgrader' ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		}

		if ( ! class_exists( '\WP_Ajax_Upgrader_Skin' ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-ajax-upgrader-skin.php';
		}

		$api = plugins_api( 'plugin_information', [
			'slug' => $plugin_slug,
			'fields' => [ 'sections' => false ],
		] );

		if ( is_wp_error( $api ) ) {
			return new \WP_Error(
				'plugin_info_failed',
				$api->get_error_message(),
				[ 'status' => 500 ]
			);
		}

		$skin = new \WP_Ajax_Upgrader_Skin();
		$upgrader = new \Plugin_Upgrader( $skin );
		$result = $upgrader->install( $api->download_link );

		if ( is_wp_error( $result ) || ! $result ) {
			return new \WP_Error(
				'plugin_install_failed',
				__( 'Failed to install the plugin.', 'elementor' ),
				[ 'status' => 500 ]
			);
		}

		$plugin_file = $this->find_installed_plugin_file( $plugin_slug );

		if ( null === $plugin_file ) {
			return new \WP_Error(
				'plugin_not_found_after_install',
				__( 'Plugin not found after install.', 'elementor' ),
				[ 'status' => 500 ]
			);
		}

		return $plugin_file;
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
