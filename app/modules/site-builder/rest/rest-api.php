<?php
namespace Elementor\App\Modules\SiteBuilder\Rest;

use Elementor\App\Modules\SiteBuilder\Services\Connect_Auth_Service;
use Elementor\Plugin;
use WP_Error;
use WP_Http;
use WP_REST_Response;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Rest_Api {
	const API_NAMESPACE = 'elementor/v1';
	const API_BASE = 'site-builder';
	const SNAPSHOT_MAX_KEYS = 20;

	public function register_routes(): void {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/home-screen', [
			'methods' => WP_REST_Server::READABLE,
			'callback' => [ $this, 'get_home_screen' ],
			'permission_callback' => fn() => current_user_can( 'manage_options' ),
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/auth', [
			'methods' => WP_REST_Server::READABLE,
			'callback' => [ $this, 'get_auth_credentials' ],
			'permission_callback' => fn() => current_user_can( 'manage_options' ),
		] );

		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/snapshot', [
			[
				'methods' => WP_REST_Server::READABLE,
				'callback' => [ $this, 'get_snapshot' ],
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
			],
			[
				'methods' => WP_REST_Server::EDITABLE,
				'callback' => [ $this, 'update_snapshot' ],
				'permission_callback' => fn() => current_user_can( 'manage_options' ),
				'args' => [
					'value' => [
						'required' => true,
						'type' => 'object',
						'validate_callback' => fn( $value ) => is_array( $value ),
						'sanitize_callback' => fn( $value ) => is_array( $value ) ? $value : [],
					],
				],
			],
		] );
	}

	public function get_home_screen() {
		$app = $this->get_connect_app();

		if ( ! $app || ! $app->is_connected() ) {
			return new WP_Error( 'site_builder_unavailable', 'Site builder is not connected.', [ 'status' => WP_Http::SERVICE_UNAVAILABLE ] );
		}

		$data = $app->get_home_screen();

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		return new WP_REST_Response( $data, WP_Http::OK );
	}

	public function get_auth_credentials() {
		$connect_auth = ( new Connect_Auth_Service() )->get_connect_auth();

		if ( ! $connect_auth ) {
			return new WP_Error(
				'auth_unavailable',
				'Authentication credentials not available',
				[ 'status' => WP_Http::SERVICE_UNAVAILABLE ]
			);
		}

		$response = new WP_REST_Response( [
			'success' => true,
			'data' => $connect_auth,
		], WP_Http::OK );

		$response->header( 'Cache-Control', 'no-store, private' );

		return $response;
	}

	public function get_snapshot() {
		$snapshot = get_option( 'elementor_site_builder_snapshot', [] );
		return new WP_REST_Response( [
			'success' => true,
			'data' => [ 'value' => $snapshot ],
		], WP_Http::OK );
	}

	public function update_snapshot( $request ) {
		$value = $request->get_param( 'value' );
		$sanitized = is_array( $value ) ? $value : [];

		if ( count( $sanitized ) > self::SNAPSHOT_MAX_KEYS ) {
			return new WP_REST_Response( [
				'success' => false,
				'data' => [ 'message' => 'Snapshot exceeds maximum allowed size.' ],
			], WP_Http::BAD_REQUEST );
		}

		$success = update_option( 'elementor_site_builder_snapshot', $sanitized, false );

		if ( $success || get_option( 'elementor_site_builder_snapshot' ) === $sanitized ) {
			return new WP_REST_Response( [
				'success' => true,
				'data' => [ 'message' => 'Snapshot updated successfully.' ],
			], WP_Http::OK );
		}

		return new WP_REST_Response( [
			'success' => false,
			'data' => [ 'message' => 'Failed to update snapshot.' ],
		], WP_Http::INTERNAL_SERVER_ERROR );
	}

	protected function get_connect_app() {
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
