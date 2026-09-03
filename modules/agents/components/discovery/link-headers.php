<?php

namespace Elementor\Modules\Agents\Components\Discovery;

use Elementor\Modules\Agents\Classes\Feature_Component;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Emits RFC 8288 Link response headers on every front-end and Elementor REST
 * response, making discovery documents findable without guessing URLs.
 *
 * Site-wide (all frontend responses):
 *   Link: </llms.txt>; rel="llms-txt"; type="text/plain"
 *
 * On singular exposed views only:
 *   Link: <{permalink}.md>; rel="alternate"; type="text/markdown"
 *
 * When the MCP server card is active (gated by filter, emitted by the MCP
 * component once it registers its server in Phase 3):
 *   Link: </.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"
 *
 * Relation types that are not registered in the IANA link relation registry
 * (llms-txt, mcp-server-card) are used as-is following emerging convention;
 * they will be replaced with absolute URI forms if IANA registers alternatives.
 *
 * Guards:
 *   - Skips admin, cron, feeds, and login screens.
 *   - Emits at most once per request (idempotency flag).
 *   - Scopes REST emission to /elementor/* namespaces only.
 */
class Link_Headers extends Feature_Component {

	/** @var bool Prevents duplicate emission within the same request. */
	private bool $emitted = false;

	public function get_id(): string {
		return 'link_headers';
	}

	public function get_layer(): string {
		return 'discovery';
	}

	public function register(): void {
		add_action( 'send_headers', [ $this, 'emit_frontend_headers' ] );
		add_filter( 'rest_post_dispatch', [ $this, 'add_rest_headers' ], 10, 3 );
	}

	// -------------------------------------------------------------------------
	// Hooks
	// -------------------------------------------------------------------------

	/**
	 * Emit Link headers on front-end responses.
	 *
	 * Fires during the `send_headers` action, which runs after WordPress has
	 * determined the current query but before the template is loaded.
	 */
	public function emit_frontend_headers(): void {
		if ( $this->emitted || $this->should_skip_frontend() ) {
			return;
		}

		$links = $this->build_site_links();

		if ( is_singular() ) {
			$post_id   = get_queried_object_id();
			$permalink = $post_id ? get_permalink( $post_id ) : false;

			if ( $permalink ) {
				$links[] = '<' . esc_url_raw( untrailingslashit( $permalink ) ) . '.md>'
					. '; rel="alternate"; type="text/markdown"';
			}
		}

		$this->send_link_headers( $links );
		$this->emitted = true;
	}

	/**
	 * Add Link headers to Elementor REST responses.
	 *
	 * Only wires onto /elementor/* routes — skips the WP REST API broadly so
	 * we don't pollute unrelated endpoints.
	 *
	 * @param  \WP_HTTP_Response  $response
	 * @param  \WP_REST_Server    $server
	 * @param  \WP_REST_Request   $request
	 * @return \WP_HTTP_Response
	 */
	public function add_rest_headers( $response, $server, $request ) {
		if ( ! ( $response instanceof \WP_HTTP_Response ) ) {
			return $response;
		}

		if ( ! $this->is_elementor_rest_request( $request ) ) {
			return $response;
		}

		foreach ( $this->build_site_links() as $link ) {
			$response->header( 'Link', $link, false );
		}

		return $response;
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	/**
	 * Build the site-wide Link header values (not singular-specific).
	 *
	 * @return string[]
	 */
	private function build_site_links(): array {
		$home = untrailingslashit( home_url() );

		$links = [
			'<' . $home . '/llms.txt>; rel="llms-txt"; type="text/plain"',
		];

		/**
		 * Fires when the MCP server card is available.
		 *
		 * The MCP component (Phase 3, PR15) hooks this to `true` once the
		 * agents MCP server has been registered and /.well-known/mcp/server-card.json
		 * is reachable. Keeping it off by default prevents pointing at a 404.
		 *
		 * @since 3.30.0
		 */
		if ( apply_filters( 'elementor/agents/link_headers/emit_mcp_card', false ) ) {
			$links[] = '<' . $home . '/.well-known/mcp/server-card.json>'
				. '; rel="mcp-server-card"; type="application/json"';
		}

		return $links;
	}

	/**
	 * Send an array of Link values as individual Link response headers.
	 *
	 * Sends one header() call per relation so the header list remains well-formed
	 * when multiple Link values are present, and passes false as the $replace
	 * argument to avoid overwriting Link headers emitted by other code.
	 *
	 * @param string[] $links
	 */
	private function send_link_headers( array $links ): void {
		foreach ( $links as $link ) {
			header( 'Link: ' . $link, false );
		}
	}

	/**
	 * Return true when front-end Link header emission should be skipped.
	 */
	private function should_skip_frontend(): bool {
		if ( is_admin() ) {
			return true;
		}

		if ( defined( 'DOING_CRON' ) && DOING_CRON ) {
			return true;
		}

		if ( is_feed() ) {
			return true;
		}

		// Skip the login screen (wp-login.php). is_login() landed in WP 6.1;
		// fall back to pagenow for older floors.
		if ( function_exists( 'is_login' ) && is_login() ) {
			return true;
		}

		global $pagenow;
		if ( 'wp-login.php' === ( $pagenow ?? '' ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Return true if the REST request targets an Elementor namespace.
	 *
	 * @param \WP_REST_Request $request
	 */
	private function is_elementor_rest_request( $request ): bool {
		$route = $request->get_route();
		return 0 === strpos( $route, '/elementor/' );
	}
}
