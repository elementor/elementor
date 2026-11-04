<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

use Elementor\Modules\Agents\Components\Discovery\Mcp_Discovery;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * MCP server card — /.well-known/mcp/server-card.json
 *
 * MCP registry server.json document pointing agents at the site's MCP server.
 *
 * Applicable only while the MCP server is advertised, matching the
 * rel="mcp-server-card" Link header.
 */
class Mcp_Server_Card extends Abstract_Well_Known_Endpoint {

	public function get_id(): string {
		return 'mcp_server_card';
	}

	public function get_well_known_slug(): string {
		return 'mcp/server-card.json';
	}

	public function get_slug_aliases(): array {
		return [ 'mcp/server-card' ];
	}

	public function is_applicable(): bool {
		return (bool) apply_filters( 'elementor/agents/link_headers/emit_mcp_card', false );
	}

	protected function generate_content(): array {
		return Mcp_Discovery::build_server_card();
	}
}
