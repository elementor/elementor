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

	public function get_content_type(): string {
		return 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';
	}

	protected function generate_content(): array {
		$home = trailingslashit( home_url() );
		$linkset = [];

		// Catalog-level entry with item bookmarks (RFC 9727 Appendix A.2).
		$catalog_items = [
			[ 'href' => rest_url() ],
		];

		if ( apply_filters( 'elementor/agents/mcp_server/is_active', false ) ) {
			$catalog_items[] = [ 'href' => Mcp_Discovery::get_server_url() ];
		}

		$linkset[] = [
			'anchor' => $home . '.well-known/api-catalog',
			'item'   => $catalog_items,
		];

		// WordPress REST API — always present.
		$rest_link = [
			'anchor'      => rest_url(),
			'service-doc' => [
				[
					'href' => $home . '.well-known/auth.md',
					'type' => 'text/markdown',
				],
			],
		];

		if ( $this->is_openapi_publishable() ) {
			$rest_link['service-desc'] = [
				[
					'href' => $home . 'openapi.json',
					'type' => 'application/json',
				],
			];
		}

		$linkset[] = $rest_link;

		// Elementor MCP server — present when active.
		if ( apply_filters( 'elementor/agents/mcp_server/is_active', false ) ) {
			$linkset[] = [
				'anchor'      => Mcp_Discovery::get_server_url(),
				'service-desc' => [
					[
						'href' => Mcp_Discovery::get_server_card_url(),
						'type' => 'application/json',
					],
				],
				'service-doc' => [
					[
						'href' => $home . '.well-known/auth.md',
						'type' => 'text/markdown',
					],
				],
			];
		}

		/**
		 * Filter the API catalog document before serialisation.
		 *
		 * Third-party plugins that expose APIs can modify the catalog document or inspect
		 * the built-in entries. The catalog follows RFC 9727 linkset format.
		 *
		 * Now passes RFC 9727 linkset document instead of custom format.
		 * Arguments changed: ($catalog, $entries, $home) instead of ($catalog, $apis, $home).
		 *
		 * @param array  $catalog The complete RFC 9727 linkset document to be returned, as
		 *                        `['linkset' => [...]]`. Third-party code can append entries
		 *                        to `$catalog['linkset']` or replace the entire structure.
		 * @param array  $entries Read-only reference: the built-in linkset entries before filtering.
		 *                        First entry is always the catalog anchor with 'item' bookmarks (RFC 9727
		 *                        Appendix A.2). Subsequent entries follow RFC 9264 format with 'anchor'
		 *                        and relation arrays (service-desc, service-doc, etc.).
		 * @param string $home    The site home URL with trailing slash.
		 */
		$catalog = [ 'linkset' => $linkset ];
		$catalog = (array) apply_filters( 'elementor/agents/api_catalog', $catalog, $linkset, $home );

		return $catalog;
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
