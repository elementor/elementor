<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WebMCP Manifest — /.well-known/webmcp.json
 *
 * Describes the in-browser tool layer for browser-based agents such as
 * Claude in Chrome. Phase 1.1 feature — is_applicable() returns false until
 * the WebMCP module activates via filter. The router produces a clean 404
 * rather than an empty stub.
 *
 * When the WebMCP module activates:
 *   add_filter( 'elementor/agents/webmcp/is_applicable', '__return_true' );
 *   add_filter( 'elementor/agents/webmcp_manifest', function( $manifest ) {
 *       $manifest['tools'][] = [ 'id' => 'my-tool', ... ];
 *       return $manifest;
 *   } );
 */
class Webmcp_Manifest extends Abstract_Well_Known_Endpoint {

	public function get_id(): string {
		return 'webmcp_manifest';
	}

	public function get_well_known_slug(): string {
		return 'webmcp.json';
	}

	/**
	 * Not applicable until the WebMCP module activates.
	 */
	public function is_applicable(): bool {
		/**
		 * @param bool $applicable Default false (Phase 1.1 feature).
		 */
		return (bool) apply_filters( 'elementor/agents/webmcp/is_applicable', false );
	}

	protected function generate_content(): array {
		$home = trailingslashit( home_url() );

		$manifest = [
			'schema_version' => '1.0',
			'name'           => $this->sanitize( get_bloginfo( 'name' ) ),
			'url'            => $home,
			'tools'          => [], // Populated by the WebMCP module via filter.
		];

		/**
		 * Filter the WebMCP manifest.
		 * The WebMCP module appends its tool descriptors here.
		 *
		 * @param array  $manifest The manifest document.
		 * @param string $home     The site home URL.
		 */
		return (array) apply_filters( 'elementor/agents/webmcp_manifest', $manifest, $home );
	}
}
