<?php

namespace Elementor\Modules\Mcp\Oauth;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Oauth_Dynamic_Registration {

	const QUERY_VAR = 'elementor_mcp_oauth_register';

	const REWRITE_RULE = '^oauth/register$';

	public function register(): void {
		if ( ! Oauth_Integration::is_enabled() ) {
			return;
		}

		add_action( 'init', [ $this, 'register_rewrite_rules' ], 1 );
		add_filter( 'query_vars', [ $this, 'add_query_vars' ] );
		add_action( 'template_redirect', [ $this, 'handle_request' ] );
	}

	public function register_rewrite_rules(): void {
		add_rewrite_rule(
			self::REWRITE_RULE,
			'index.php?' . self::QUERY_VAR . '=1',
			'top'
		);
	}

	public function add_query_vars( array $vars ): array {
		$vars[] = self::QUERY_VAR;

		return $vars;
	}

	public function handle_request(): void {
		if ( '1' !== (string) get_query_var( self::QUERY_VAR, '' ) ) {
			return;
		}

		if ( ! Oauth_Integration::is_enabled() ) {
			status_header( 404 );
			exit;
		}

		$request_method = isset( $_SERVER['REQUEST_METHOD'] )
			? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) )
			: '';

		if ( 'POST' !== $request_method ) {
			status_header( 405 );
			header( 'Allow: POST' );
			exit;
		}

		$body = file_get_contents( 'php://input' );
		$payload = json_decode( (string) $body, true );

		if ( ! is_array( $payload ) ) {
			wp_send_json(
				[
					'error' => 'invalid_request',
					'error_description' => 'Request body must be a JSON object.',
				],
				400
			);
		}

		$auth_method = isset( $payload['token_endpoint_auth_method'] )
			? (string) $payload['token_endpoint_auth_method']
			: 'none';

		if ( '' !== $auth_method && 'none' !== $auth_method ) {
			wp_send_json(
				[
					'error' => 'invalid_client_metadata',
					'error_description' => 'Only public clients are supported.',
				],
				400
			);
		}

		$redirect_uris = $payload['redirect_uris'] ?? [];

		if ( ! is_array( $redirect_uris ) || empty( $redirect_uris ) ) {
			wp_send_json(
				[
					'error' => 'invalid_redirect_uri',
					'error_description' => 'redirect_uris is required.',
				],
				400
			);
		}

		$redirect_uris = array_values(
			array_unique(
				array_filter(
					array_map( 'esc_url_raw', array_map( 'strval', $redirect_uris ) )
				)
			)
		);

		if ( empty( $redirect_uris ) ) {
			wp_send_json(
				[
					'error' => 'invalid_redirect_uri',
					'error_description' => 'redirect_uris must contain at least one valid URI.',
				],
				400
			);
		}

		Oauth_Client_Metadata::preseed_cimd_cache( $redirect_uris );

		$client_name = isset( $payload['client_name'] )
			? sanitize_text_field( (string) $payload['client_name'] )
			: Oauth_Client_Metadata::CLIENT_NAME;

		if ( '' === $client_name ) {
			$client_name = Oauth_Client_Metadata::CLIENT_NAME;
		}

		wp_send_json(
			[
				'client_id' => Oauth_Client_Metadata::get_client_id(),
				'client_id_issued_at' => time(),
				'redirect_uris' => array_values(
					array_unique(
						array_merge( Oauth_Client_Metadata::get_loopback_redirect_uris(), $redirect_uris )
					)
				),
				'token_endpoint_auth_method' => 'none',
				'grant_types' => [ 'authorization_code', 'refresh_token' ],
				'response_types' => [ 'code' ],
				'client_name' => $client_name,
			],
			201
		);
	}
}
