<?php

namespace Elementor\Modules\Agents\Components\Discovery;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Feature_Component;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;
use Elementor\Modules\Agents\Module;

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
 * Site-wide when the Agent discovery module is enabled:
 *   Link: </.well-known/api-catalog>; rel="api-catalog"; type="application/json"
 *   Link: </.well-known/auth.md>; rel="service-doc"; type="text/markdown"
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

	const HOMEPAGE_MARKDOWN_PATH = '/index.md';

	/** @var bool Prevents duplicate emission within the same request. */
	private bool $emitted = false;

	private Markdown_Endpoint $markdown_endpoint;

	private Agent_Ready_Settings $settings;

	private Module $module;

	public function __construct( Markdown_Endpoint $markdown_endpoint, Agent_Ready_Settings $settings, Module $module ) {
		$this->markdown_endpoint = $markdown_endpoint;
		$this->settings          = $settings;
		$this->module            = $module;
	}

	public function get_id(): string {
		return 'link_headers';
	}

	public function get_layer(): string {
		return 'discovery';
	}

	public function get_required_modules(): array {
		return [
			Agent_Ready_Settings::MODULE_LLMS_TXT,
			Agent_Ready_Settings::MODULE_AGENT_DISCOVERY,
			Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT,
		];
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
			$post_id = get_queried_object_id();
			$post    = $post_id ? get_post( $post_id ) : null;
			$link    = $this->build_singular_markdown_link( $post );

			if ( null !== $link ) {
				$links[] = $link;
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
	 * @param \WP_HTTP_Response $response Response object.
	 * @param \WP_REST_Server   $server   REST server instance.
	 * @param \WP_REST_Request  $request  REST request object.
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

		$links = [];

		if ( $this->module->should_advertise_llms_txt() ) {
			$links[] = '<' . $home . '/llms.txt>; rel="llms-txt"; type="text/plain"';
		}

		if ( $this->settings->is_agent_discovery_enabled() ) {
			$links[] = '<' . $home . '/.well-known/api-catalog>; rel="api-catalog"; type="application/json"';
			$links[] = '<' . $home . '/.well-known/auth.md>; rel="service-doc"; type="text/markdown"';
		}

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
	 * @param \WP_Post|null $post
	 * @return string|null
	 */
	public function build_singular_markdown_link( $post ): ?string {
		if ( ! ( $post instanceof \WP_Post ) ) {
			return null;
		}

		if ( ! $this->markdown_endpoint->is_markdown_access_allowed( $post ) ) {
			return null;
		}

		$markdown_url = $this->resolve_markdown_url( $post );

		if ( ! $markdown_url ) {
			return null;
		}

		return '<' . esc_url_raw( $markdown_url ) . '>'
			. '; rel="alternate"; type="text/markdown"';
	}

	private function resolve_markdown_url( \WP_Post $post ): ?string {
		if ( $this->is_static_front_page( $post ) ) {
			return untrailingslashit( home_url() ) . self::HOMEPAGE_MARKDOWN_PATH;
		}

		$permalink = get_permalink( $post->ID );

		return $permalink ? untrailingslashit( $permalink ) . '.md' : null;
	}

	private function is_static_front_page( \WP_Post $post ): bool {
		return 'page' === get_option( 'show_on_front' )
			&& (int) get_option( 'page_on_front' ) === $post->ID;
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
		if ( headers_sent() ) {
			return;
		}

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
