<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * OAuth Authorization Server Metadata — /.well-known/oauth-authorization-server
 * (RFC 8414)
 *
 * Phase 1.1 feature. is_applicable() returns false until the OAuth module
 * provides a real token endpoint, so this URL produces a clean 404 in MVP
 * rather than a misleading stub.
 *
 * When the OAuth module activates:
 *   add_filter( 'elementor/agents/oauth_authorization_server/is_applicable', '__return_true' );
 *   add_filter( 'elementor/agents/oauth_authorization_server/token_endpoint', fn() => '...' );
 *
 * @see https://www.rfc-editor.org/rfc/rfc8414
 */
class Oauth_Authorization_Server extends Abstract_Well_Known_Endpoint {

	public function get_id(): string {
		return 'oauth_authorization_server';
	}

	public function get_well_known_slug(): string {
		return 'oauth-authorization-server';
	}

	/**
	 * Not applicable until the OAuth 2.1 module provides a real token endpoint.
	 */
	public function is_applicable(): bool {
		/**
		 * @param bool $applicable Default false until OAuth module activates.
		 */
		return (bool) apply_filters( 'elementor/agents/oauth_authorization_server/is_applicable', false );
	}

	protected function generate_content(): array {
		$home = trailingslashit( home_url() );

		/**
		 * @param string $url Token endpoint URL. Provided by the OAuth module.
		 */
		$token_endpoint = (string) apply_filters(
			'elementor/agents/oauth_authorization_server/token_endpoint',
			rest_url( 'elementor/agents/oauth/token' )
		);

		/**
		 * @param string $url Authorization endpoint URL.
		 */
		$auth_endpoint = (string) apply_filters(
			'elementor/agents/oauth_authorization_server/authorization_endpoint',
			rest_url( 'elementor/agents/oauth/authorize' )
		);

		$document = [
			'issuer'                                => $home,
			'authorization_endpoint'                => $auth_endpoint,
			'token_endpoint'                        => $token_endpoint,
			'token_endpoint_auth_methods_supported' => [ 'client_secret_basic', 'none' ],
			'grant_types_supported'                 => [ 'authorization_code' ],
			'response_types_supported'              => [ 'code' ],
			'code_challenge_methods_supported'      => [ 'S256' ], // PKCE required (OAuth 2.1)
			'scopes_supported'                      => $this->get_scopes(),
			'service_documentation'                 => $home . '.well-known/auth.md',
			'dpop_signing_alg_values_supported'     => [], // Phase 2+
		];

		/**
		 * @param array  $document The authorization server metadata.
		 * @param string $home     The site home URL.
		 */
		return (array) apply_filters( 'elementor/agents/oauth_authorization_server', $document, $home );
	}

	private function get_scopes(): array {
		$scopes = [ 'elementor_agent_read' ];

		/** @see Oauth_Protected_Resource::get_scopes() — same filter. */
		return (array) apply_filters( 'elementor/agents/oauth/scopes', $scopes );
	}
}
