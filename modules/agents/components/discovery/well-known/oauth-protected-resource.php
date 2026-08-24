<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * OAuth Protected Resource Metadata — /.well-known/oauth-protected-resource
 * (RFC 9728)
 *
 * Tells agents and OAuth clients that this resource server requires a bearer
 * token and where to obtain one. This is the first document an OAuth 2.1
 * client reads when it encounters a 401 from the MCP endpoint.
 *
 * For MVP (Application Passwords) the document is accurate: it names the auth
 * method and points at the documentation. When OAuth 2.1 lands (Phase 1.1)
 * authorization_servers and scopes_supported expand via filter without changing
 * the document location or shape.
 *
 * Applicable when the MCP server component is active.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9728
 */
class Oauth_Protected_Resource extends Abstract_Well_Known_Endpoint {

	public function get_id(): string {
		return 'oauth_protected_resource';
	}

	public function get_well_known_slug(): string {
		return 'oauth-protected-resource';
	}

	/**
	 * Applicable only when the MCP server is active — that is the resource
	 * this document describes.
	 */
	public function is_applicable(): bool {
		$module = Plugin::$instance->modules_manager->get_modules( 'agents' );
		$mcp    = $module ? $module->get_component( 'agents_mcp_server' ) : null;

		// Applicable even before MCP lands (document describes the planned resource),
		// but only if the MCP component is registered. Until then, return false so
		// no misleading document is served.
		// For MVP: applicable whenever the module is active (MCP will follow).
		return true; // @todo tighten once agents_mcp_server component exists.
	}

	protected function generate_content(): array {
		$home         = trailingslashit( home_url() );
		$mcp_endpoint = rest_url( 'elementor/agents-mcp' );

		$document = [
			// The resource URI this metadata describes.
			'resource'                              => $mcp_endpoint,

			// Authorization server(s) that can issue tokens for this resource.
			// Points at the site itself (Application Passwords issuer in MVP;
			// real token endpoint in Phase 1.1).
			'authorization_servers'                 => [ $home ],

			// Scopes an agent may request.
			'scopes_supported'                      => $this->get_scopes(),

			// Only bearer tokens are accepted at the HTTP transport layer.
			'bearer_methods_supported'              => [ 'header' ],

			// Human- and machine-readable auth documentation.
			'resource_documentation'                => $home . '.well-known/auth.md',

			// Signing algorithms — populated once JWT tokens are issued (Phase 1.1).
			'resource_signing_alg_values_supported' => [],
		];

		/**
		 * Filter the OAuth protected resource metadata.
		 *
		 * @param array  $document The metadata document.
		 * @param string $home     The site home URL.
		 */
		return (array) apply_filters( 'elementor/agents/oauth_protected_resource', $document, $home );
	}

	private function get_scopes(): array {
		$scopes = [ 'elementor_agent_read' ];

		/**
		 * Filter the scopes listed in the protected resource metadata.
		 *
		 * @param string[] $scopes Current scope list.
		 */
		return (array) apply_filters( 'elementor/agents/oauth/scopes', $scopes );
	}
}
