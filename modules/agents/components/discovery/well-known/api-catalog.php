<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * API catalog — /.well-known/api-catalog (RFC 9727)
 *
 * Lists all machine-readable APIs this site exposes so agents and API clients
 * can discover them without prior configuration.
 *
 * Always applicable — every WordPress site has a REST API to advertise.
 *
 * @see https://www.rfc-editor.org/rfc/rfc9727
 */
class Api_Catalog extends Abstract_Well_Known_Endpoint {

	public function get_id(): string {
		return 'api_catalog';
	}

	public function get_well_known_slug(): string {
		return 'api-catalog';
	}

	protected function generate_content(): array {
		$home = trailingslashit( home_url() );
		$apis = [];

		// WordPress REST API — always present.
		$apis[] = [
			'id'          => 'wordpress-rest',
			'title'       => 'WordPress REST API',
			'description' => 'WordPress core and plugin REST endpoints.',
			'url'         => rest_url(),
			'spec_url'    => rest_url() . '?format=openapi',
			'type'        => 'rest',
			'auth'        => [
				'type'          => 'application_password',
				'documentation' => $home . '.well-known/auth.md',
			],
		];

		// Elementor Agents MCP server — present when active.
		$module = Plugin::$instance->modules_manager->get_modules( 'agents' );
		$mcp    = $module ? $module->get_component( 'agents_mcp_server' ) : null;

		if ( $mcp && $mcp->is_enabled() ) {
			$apis[] = [
				'id'          => 'elementor-agents-mcp',
				'title'       => 'Elementor Agent Ready MCP',
				'description' => 'Model Context Protocol server exposing site content and capabilities to AI agents.',
				'url'         => rest_url( 'elementor/agents-mcp' ),
				'spec_url'    => $home . '.well-known/mcp/server-card.json',
				'type'        => 'mcp',
				'spec'        => 'mcp-2025-11-25',
				'transport'   => 'streamable-http',
				'auth'        => [
					'type'          => 'application_password',
					'documentation' => $home . '.well-known/auth.md',
				],
			];
		}

		$catalog = [
			'schema_version' => '1.0',
			'rfc'            => 'https://www.rfc-editor.org/rfc/rfc9727',
			'publisher'      => [ 'url' => $home ],
			'apis'           => $apis,
		];

		/**
		 * Filter the API catalog before serialisation.
		 * Third-party plugins that expose APIs can append their own entries.
		 *
		 * @param array  $catalog Full catalog document.
		 * @param array  $apis    The apis array before embedding.
		 * @param string $home    The site home URL.
		 */
		return (array) apply_filters( 'elementor/agents/api_catalog', $catalog, $apis, $home );
	}
}
