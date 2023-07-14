<?php
namespace Elementor\App\Modules\Onboarding\Data\Endpoints;

use Elementor\App\Modules\Onboarding\Data\Controller;
use Elementor\Data\V2\Base\Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Update_Site_Logo extends Endpoint {

	public function get_name() {
		return 'update-site-logo';
	}

	public function get_format() {
		return 'onboarding/update-site-logo';
	}

	private function get_endpoint_args(): array {
		return [
			'attachmentId' => [
				'type' => 'string',
				'required' => true,
				'sanitize_callback' => function ( $value ) {
					return Controller::sanitize_input( $value );
				},
			],
		];
	}

	public function register() {
		$args = $this->get_endpoint_args();

		$this->register_items_route( \WP_REST_Server::CREATABLE, $args );
	}

	public function create_items( $request ): array {
		$absint_attachment_id = absint( $request->get_param( 'attachmentId' ) );

		set_theme_mod( 'custom_logo', $absint_attachment_id );

		return [
			'status' => 'success',
			'payload' => [
				'siteLogoUpdated' => true,
			],
		];
	}

	public function get_permission_callback( $request ): bool {
		if ( ! current_user_can( 'edit_theme_options' ) ) {
			return false;
		}

		$attachment_id = $request->get_param( 'attachmentId' );
		$absint_attachment_id = absint( $attachment_id );

		if ( 0 === $absint_attachment_id ) {
			return false;
		}

		$attachment_url = wp_get_attachment_url( $attachment_id );

		// Check if the attachment exists. If it does not, exit here.
		if ( ! $attachment_url ) {
			return false;
		}

		return true;
	}
}
