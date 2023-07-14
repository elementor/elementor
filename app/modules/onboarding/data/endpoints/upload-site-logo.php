<?php
namespace Elementor\App\Modules\Onboarding\Data\Endpoints;

use Elementor\Core\Files\Uploads_Manager;
use Elementor\Data\V2\Base\Endpoint;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Upload_Site_Logo extends Endpoint {

	public function get_name() {
		return 'upload-site-logo';
	}

	public function get_format() {
		return 'onboarding/upload-site-logo';
	}

	private function get_endpoint_args(): array {
		return [];
	}

	public function register() {
		$args = $this->get_endpoint_args();

		$this->register_items_route( \WP_REST_Server::CREATABLE, $args );
	}

	public function create_items( $request ): array {
		$files = $request->get_file_params();

		$file_to_upload = $files['fileToUpload'];
		$error_message = esc_html__( 'There was a problem uploading your file', 'elementor' );

		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( ! is_array( $file_to_upload ) || empty( $file_to_upload['type'] ) ) {
			return [
				'status' => 'error',
				'payload' => [
					'error_message' => $error_message,
				],
			];
		}

		// If the user has allowed it, set the Request's state as an "Elementor Upload" request, in order to add
		// support for non-standard file uploads.
		if ( 'image/svg+xml' === $file_to_upload['type'] ) {
			if ( Uploads_Manager::are_unfiltered_uploads_enabled() ) {
				Plugin::$instance->uploads_manager->set_elementor_upload_state( true );
			} else {
				wp_send_json_error( 'To upload SVG files, you must allow uploading unfiltered files.' );
			}
		}

		// If the image is an SVG file, sanitation is performed during the import (upload) process.
		$image_attachment = Plugin::$instance->templates_manager->get_import_images_instance()->import( $file_to_upload );

		if ( 'image/svg+xml' === $file_to_upload['type'] && Uploads_Manager::are_unfiltered_uploads_enabled() ) {
			// Reset Upload state.
			Plugin::$instance->uploads_manager->set_elementor_upload_state( false );
		}

		if ( $image_attachment && ! is_wp_error( $image_attachment ) ) {
			$result = [
				'status' => 'success',
				'payload' => [
					'imageAttachment' => $image_attachment,
				],
			];
		} else {
			$result = [
				'status' => 'error',
				'payload' => [
					'error_message' => $error_message,
				],
			];
		}

		return $result;
	}

	public function get_permission_callback( $request ): bool {
		$files = $request->get_file_params();

		$file_to_upload = $files['fileToUpload'];

		return current_user_can( 'edit_theme_options' ) && is_array( $file_to_upload ) && ! empty( $file_to_upload['type'] );

	}
}
