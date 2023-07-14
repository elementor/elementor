<?php
namespace Elementor\App\Modules\Onboarding\Data\Endpoints;

use Elementor\App\Modules\Onboarding\Data\Controller;
use Elementor\Data\V2\Base\Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Update_Site_Name extends Endpoint {

	public function get_name() {
		return 'update-site-name';
	}

	public function get_format() {
		return 'onboarding/update-site-name';
	}

	private function get_endpoint_args(): array {
		return [
			'siteName' => [
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
		$site_name = $request->get_param( 'siteName' );

		/**
		 * Onboarding Site Name
		 *
		 * Filters the new site name passed by the user to update in Elementor's onboarding process.
		 * Elementor runs `esc_html()` on the Site Name passed by the user for security reasons. If a user wants to
		 * include special characters in their site name, they can use this filter to override it.
		 *
		 * @since 3.6.0
		 *
		 * @param string $site_name Escaped new site name
		 */
		$site_name = apply_filters( 'elementor/onboarding/site-name', $site_name );

		update_option( 'blogname', $site_name );

		return [
			'status' => 'success',
			'payload' => [
				'siteNameUpdated' => true,
			],
		];
	}

	public function get_permission_callback( $request ): bool {
		return current_user_can( 'manage_options' );
	}
}
