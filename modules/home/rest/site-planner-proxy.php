<?php
namespace Elementor\Modules\Home\Rest;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Planner_Proxy {

	const REST_NAMESPACE = 'elementor/v1';
	const REST_BASE      = 'site-planner';

	public function register_routes(): void {
		register_rest_route(
			self::REST_NAMESPACE,
			self::REST_BASE . '/home-screen',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'get_home_screen' ],
				'permission_callback' => [ $this, 'permissions_check' ],
			]
		);
	}

	public function permissions_check(): bool {
		return current_user_can( 'manage_options' );
	}

	public function get_home_screen(): \WP_REST_Response|\WP_Error {
		$context = $this->get_proxy_context();

		if ( is_wp_error( $context ) ) {
			return $context;
		}

		$response = wp_remote_get(
			$context['api_origin'] . '/website-planner/session/home-screen',
			[
				'headers' => $context['auth_headers'],
				'timeout' => 15,
			]
		);

		return $this->parse_remote_response( $response );
	}

	private function get_proxy_context(): array|\WP_Error {
		$site_builder = Plugin::$instance->app->get_component( 'site-builder' );

		if ( ! $site_builder ) {
			return new \WP_Error( 'no_site_builder', 'Site builder component not available.', [ 'status' => 503 ] );
		}

		$planner_config = $site_builder->get_planner_config();

		if ( ! $planner_config ) {
			return new \WP_Error( 'no_planner_config', 'Site planner is not configured or not connected.', [ 'status' => 503 ] );
		}

		$connect_auth = $planner_config['connectAuth'];
		$api_origin   = defined( 'ELEMENTOR_SITE_PLANNER_API_ORIGIN' )
			? ELEMENTOR_SITE_PLANNER_API_ORIGIN
			: 'https://my.elementor.com/api/v2/ai';

		return [
			'api_origin'   => $api_origin,
			'auth_headers' => [
				'Content-Type'          => 'application/json',
				'x-elementor-signature' => $connect_auth['signature'] ?? '',
				'access-token'          => $connect_auth['accessToken'] ?? '',
				'client-id'             => $connect_auth['clientId'] ?? '',
				'home-url'              => $connect_auth['homeUrl'] ?? '',
				'site-key'              => $connect_auth['siteKey'] ?? '',
				'x-host-site-title'     => (string) get_bloginfo( 'name' ),
				'x-host-site-context'   => (string) get_bloginfo( 'description' ),
			],
		];
	}

	private function parse_remote_response( array|\WP_Error $response ): \WP_REST_Response|\WP_Error {
		if ( is_wp_error( $response ) ) {
			return new \WP_Error( 'proxy_error', $response->get_error_message(), [ 'status' => 502 ] );
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		$body        = wp_remote_retrieve_body( $response );
		$data        = json_decode( $body, true );

		if ( null === $data ) {
			return new \WP_Error( 'invalid_response', 'Invalid JSON from upstream.', [ 'status' => 502 ] );
		}

		return new \WP_REST_Response( $data, $status_code );
	}
}
