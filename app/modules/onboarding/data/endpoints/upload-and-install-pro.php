<?php
namespace Elementor\App\Modules\Onboarding\Data\Endpoints;

use Automatic_Upgrader_Skin;
use Elementor\Data\V2\Base\Endpoint;
use Plugin_Upgrader;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Upload_And_Install_Pro extends Endpoint {

	public function get_name() {
		return 'upload-and-install-pro';
	}

	public function get_format() {
		return 'onboarding/upload-and-install-pro';
	}

	public function register() {
		$this->register_items_route( \WP_REST_Server::CREATABLE );
	}

	public function create_items( $request ): array {
		$files = $request->get_file_params();

		$file = $files['fileToUpload'];

		$result = [];

		if ( ! class_exists( 'Automatic_Upgrader_Skin' ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		}

		$skin = new Automatic_Upgrader_Skin();
		$upgrader = new Plugin_Upgrader( $skin );
		$upload_result = $upgrader->install( $file['tmp_name'], [ 'overwrite_package' => false ] );

		$error_message = esc_html__( 'There was a problem uploading your file', 'elementor' );

		if ( ! $upload_result || is_wp_error( $upload_result ) ) {
			$result = [
				'status' => 'error',
				'payload' => [
					'error_message' => $error_message,
				],
			];
		} else {
			$activated = activate_plugin( WP_PLUGIN_DIR . '/elementor-pro/elementor-pro.php', false, false, true );

			if ( ! is_wp_error( $activated ) ) {
				$result = [
					'status' => 'success',
					'payload' => [
						'elementorProInstalled' => true,
					],
				];
			} else {
				$result = [
					'status' => 'error',
					'payload' => [
						'error_message' => $error_message,
						'elementorProInstalled' => false,
					],
				];
			}
		}

		return $result;
	}

	public function get_permission_callback( $request ): bool {
		$files = $request->get_file_params();

		$file = $files['fileToUpload'];

		if ( ! is_array( $file ) || empty( $file['type'] ) ) {
			return false;
		}

		return current_user_can( 'install_plugins' ) && current_user_can( 'activate_plugins' );
	}
}
