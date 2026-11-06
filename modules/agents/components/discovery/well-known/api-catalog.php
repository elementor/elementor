<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

use Elementor\Modules\Agents\Components\Discovery\Mcp_Discovery;
use Elementor\Modules\Agents\Components\Discovery\Openapi_Spec;
use Elementor\Modules\Agents\Module;
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
		$api = [
			'id'          => 'wordpress-rest',
			'title'       => 'WordPress REST API',
			'description' => 'WordPress core and plugin REST endpoints.',
			'url'         => rest_url(),
			'type'        => 'rest',
			'auth'        => [
				'type'          => 'application_password',
				'documentation' => $home . '.well-known/auth.md',
			],
		];

		if ( $this->is_openapi_publishable() ) {
			$api['spec_url'] = $home . 'openapi.json';
		}

		$apis[] = $api;

		// Elementor MCP server — present when active.
		if ( apply_filters( 'elementor/agents/mcp_server/is_active', false ) ) {
			$apis[] = [
				'id'          => Mcp_Discovery::SERVER_SLUG,
				'title'       => Mcp_Discovery::SERVER_TITLE,
				'description' => Mcp_Discovery::SERVER_DESCRIPTION,
				'url'         => Mcp_Discovery::get_server_url(),
				'spec_url'    => Mcp_Discovery::get_server_card_url(),
				'type'        => 'mcp',
				'spec'        => 'mcp-2025-11-25',
				'transport'   => Mcp_Discovery::TRANSPORT,
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

	private function is_openapi_publishable(): bool {
		$module = Plugin::$instance->modules_manager->get_modules( 'agents' );

		if ( ! $module instanceof Module ) {
			return false;
		}

		$component = $module->get_component( 'openapi_spec' );

		if ( ! $component instanceof Openapi_Spec ) {
			return false;
		}

		return $component->is_publishable();
	}
}
