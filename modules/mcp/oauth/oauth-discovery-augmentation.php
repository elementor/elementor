<?php

namespace Elementor\Modules\Mcp\Oauth;

use WPMedia\MCP\OAuth\Auth\Discovery\Endpoints as DiscoveryEndpoints;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Oauth_Discovery_Augmentation {

	public function register(): void {
		if ( ! Oauth_Integration::is_enabled() ) {
			return;
		}

		add_action( 'template_redirect', [ $this, 'handle_request' ], 9 );
	}

	public function handle_request(): void {
		if ( 'authorization-server' !== (string) get_query_var( DiscoveryEndpoints::QUERY_VAR, '' ) ) {
			return;
		}

		$base_url = home_url();

		wp_send_json(
			[
				'issuer' => $base_url,
				'authorization_endpoint' => $base_url . '/oauth/authorize',
				'token_endpoint' => $base_url . '/oauth/token',
				'revocation_endpoint' => $base_url . '/oauth/revoke',
				'registration_endpoint' => home_url( '/oauth/register' ),
				'response_types_supported' => [ 'code' ],
				'grant_types_supported' => [ 'authorization_code', 'refresh_token' ],
				'code_challenge_methods_supported' => [ 'S256' ],
				'scopes_supported' => [ 'mcp' ],
				'token_endpoint_auth_methods_supported' => [ 'none' ],
				'client_id_metadata_document_supported' => true,
			]
		);
	}
}
