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
	const API_BASE = 'site-builder';
	const SNAPSHOT_MAX_KEYS = 20;

	public function register_routes(): void {
		register_rest_route( self::API_NAMESPACE, '/' . self::API_BASE . '/home-screen', [
			'methods' => WP_REST_Server::READABLE,
			'callback' => [ $this, 'get_home_screen' ],
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
			return new WP_Error( 'site_builder_unavailable', 'Site builder is not connected.', [ 'status' => 503 ] );
		}

		$data = $app->get_home_screen();

		if ( is_wp_error( $data ) ) {
			return $data;
		}

		return new WP_REST_Response( $data, 200 );
	}

	public function get_snapshot() {
		$snapshot = get_option( 'elementor_site_builder_snapshot', [] );
		return new WP_REST_Response( [
			'success' => true,
			'data' => [ 'value' => $snapshot ],
		], 200 );
	}

	public function update_snapshot( $request ) {
		$value = $request->get_param( 'value' );
		$sanitized = is_array( $value ) ? $value : [];

		if ( count( $sanitized ) > self::SNAPSHOT_MAX_KEYS ) {
			return new WP_REST_Response( [
				'success' => false,
				'data' => [ 'message' => 'Snapshot exceeds maximum allowed size.' ],
			], 400 );
		}

		$success = update_option( 'elementor_site_builder_snapshot', $sanitized, false );

		if ( $success || get_option( 'elementor_site_builder_snapshot' ) === $sanitized ) {
			return new WP_REST_Response( [
				'success' => true,
				'data' => [ 'message' => 'Snapshot updated successfully.' ],
			], 200 );
		}

		return new WP_REST_Response( [
			'success' => false,
			'data' => [ 'message' => 'Failed to update snapshot.' ],
		], 500 );
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
