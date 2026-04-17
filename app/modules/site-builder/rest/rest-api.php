<?php
namespace Elementor\App\Modules\SiteBuilder\Rest;

use Elementor\Plugin;
use WP_Error;
use WP_REST_Response;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Rest_Api {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE      = 'site-builder';

	public function register_routes(): void {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/home-screen', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => [ $this, 'get_home_screen' ],
			'permission_callback' => fn() => current_user_can( 'manage_options' ),
		] );
	}

	public function get_home_screen() {
		$app = $this->get_connect_app();

		if ( ! $app || ! $app->is_connected() ) {
			return new WP_Error( 'site_builder_unavailable', 'Site builder is not connected.', [ 'status' => 503 ] );
		}

		$data = $app->get_home_screen();

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		return new WP_REST_Response( $data, 200 );
	}

	private function get_connect_app() {
		if ( ! Plugin::$instance->common ) {
			return null;
		}

		$connect = Plugin::$instance->common->get_component( 'connect' );

		if ( ! $connect ) {
			return null;
		}

		return $connect->get_app( 'site-builder' );
	}
}
