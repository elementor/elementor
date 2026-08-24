<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * ARD (Agentic Resource Discovery) manifest — /.well-known/agent.json
 *
 * Top-level capability index for AI agents. Advertises every agent-facing
 * surface this site exposes: MCP server, llms.txt, API catalog, skills index,
 * and auth endpoints.
 *
 * An agent that fetches /.well-known/agent.json learns everything it needs to
 * discover and use the site without manual configuration — this is the document
 * it should fetch first.
 *
 * Always applicable — if any agent feature is active, this document is useful.
 */
class Ard_Manifest extends Abstract_Well_Known_Endpoint {

	public function get_id(): string {
		return 'ard_manifest';
	}

	public function get_well_known_slug(): string {
		return 'agent.json';
	}

	protected function generate_content(): array {
		$home = trailingslashit( home_url() );

		$manifest = [
			'schema_version' => '1.0',
			'name'           => $this->sanitize( get_bloginfo( 'name' ) ),
			'description'    => $this->sanitize( get_bloginfo( 'description' ) ),
			'url'            => $home,
			'language'       => get_bloginfo( 'language' ),
			'capabilities'   => $this->build_capabilities( $home ),
			'generated_at'   => gmdate( 'c' ),
		];

		/**
		 * Filter the ARD manifest before serialisation.
		 *
		 * @param array  $manifest The manifest array.
		 * @param string $home     The site home URL.
		 */
		return (array) apply_filters( 'elementor/agents/ard_manifest', $manifest, $home );
	}

	// ------------------------------------------------------------------
	// Internals
	// ------------------------------------------------------------------

	private function build_capabilities( string $home ): array {
		$caps = [];

		// llms.txt — always present when the agent_ready experiment is active.
		$caps['llms_txt'] = [
			'url'      => $home . 'llms.txt',
			'full_url' => $home . 'llms-full.txt',
		];

		// REST API — always present on any WordPress site.
		$caps['rest_api'] = [
			'url'     => rest_url(),
			'catalog' => $home . '.well-known/api-catalog',
		];

		// Auth documentation — always present when this module is active.
		$caps['auth'] = [
			'protected_resource' => $home . '.well-known/oauth-protected-resource',
			'documentation'      => $home . '.well-known/auth.md',
		];

		// MCP server — added when the agents MCP component is registered and active.
		$caps = $this->maybe_add_mcp( $caps, $home );

		// Optional endpoints — added only when their component is active.
		$caps = $this->maybe_add_optional( $caps, $home );

		return $caps;
	}

	private function maybe_add_mcp( array $caps, string $home ): array {
		// The MCP server component will be registered in a later PR.
		// Check for its presence defensively so this document works today
		// and automatically enriches itself when MCP lands.
		$module = Plugin::$instance->modules_manager->get_modules( 'agents' );
		$mcp    = $module ? $module->get_component( 'agents_mcp_server' ) : null;

		if ( $mcp && $mcp->is_enabled() ) {
			$caps['mcp'] = [
				'transport'   => 'streamable-http',
				'url'         => rest_url( 'elementor/agents-mcp' ),
				'spec'        => 'mcp-2025-11-25',
				'server_card' => $home . '.well-known/mcp/server-card.json',
			];
		}

		return $caps;
	}

	private function maybe_add_optional( array $caps, string $home ): array {
		$module = Plugin::$instance->modules_manager->get_modules( 'agents' );
		$router = $module ? $module->get_component( 'well_known_router' ) : null;

		if ( ! $router instanceof Well_Known_Router ) {
			return $caps;
		}

		$active = $router->get_active_endpoints();

		if ( isset( $active['agent-skills'] ) ) {
			$caps['agent_skills'] = [ 'url' => $home . '.well-known/agent-skills' ];
		}

		if ( isset( $active['webmcp.json'] ) ) {
			$caps['webmcp'] = [ 'url' => $home . '.well-known/webmcp.json' ];
		}

		if ( isset( $active['oauth-authorization-server'] ) ) {
			$caps['auth']['authorization_server'] = $home . '.well-known/oauth-authorization-server';
		}

		return $caps;
	}
}
