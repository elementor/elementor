<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Central router for all /.well-known/ endpoints.
 *
 * Hooks template_redirect at priority 1, consistent with the module's
 * existing llms.txt handler. Endpoints self-register via register_endpoint().
 *
 * The router checks both is_enabled() (user preference seam on Feature_Component)
 * and is_applicable() (hard dependency gate on Abstract_Well_Known_Endpoint)
 * before serving. When neither gate passes, the request falls through to
 * WordPress's normal 404 path — no stub document is ever served for a
 * feature that is not active or not yet applicable.
 *
 * Cache invalidation: listens to elementor/agents/llms_txt/cache_invalidated,
 * which fires on post save, theme switch, plugin activate/deactivate, and
 * Elementor cache clear — covering every scenario that could change a well-known
 * document's content.
 */
class Well_Known_Router {

	const WELL_KNOWN_PREFIX = '/.well-known/';

	/** @var Abstract_Well_Known_Endpoint[] Keyed by well-known slug. */
	private array $endpoints = [];

	/**
	 * Wire the router into WordPress.
	 * Called once by Module after the router is instantiated.
	 */
	public function init(): void {
		add_action( 'template_redirect', [ $this, 'maybe_handle' ], 1 );
		add_action( 'elementor/agents/llms_txt/cache_invalidated', [ $this, 'flush_all_caches' ] );
	}

	/**
	 * Register an endpoint.
	 *
	 * Called for every well-known component in Module's registration pass.
	 * Endpoints that are disabled or not-applicable are still registered so
	 * get_all_endpoints() is always complete (e.g. for a future settings UI).
	 */
	public function register_endpoint( Abstract_Well_Known_Endpoint $endpoint ): void {
		$this->endpoints[ $endpoint->get_well_known_slug() ] = $endpoint;
	}

	/**
	 * template_redirect handler.
	 * Intercepts /.well-known/* requests and dispatches to the matching endpoint.
	 */
	public function maybe_handle(): void {
		$path = $this->get_normalized_path();

		if ( '' === $path || 0 !== strpos( $path, self::WELL_KNOWN_PREFIX ) ) {
			return;
		}

		$slug = substr( $path, strlen( self::WELL_KNOWN_PREFIX ) );
		$slug = rtrim( strtok( $slug, '?' ), '/' );

		if ( '' === $slug || ! isset( $this->endpoints[ $slug ] ) ) {
			return; // Unknown endpoint — let WordPress 404.
		}

		$endpoint = $this->endpoints[ $slug ];

		if ( ! $endpoint->is_enabled() || ! $endpoint->is_applicable() ) {
			return; // Feature off or not applicable — fall through to 404.
		}

		$endpoint->handle_request(); // exits
	}

	/**
	 * Flush cached responses for every registered endpoint.
	 * Hooked into elementor/agents/llms_txt/cache_invalidated.
	 */
	public function flush_all_caches(): void {
		foreach ( $this->endpoints as $endpoint ) {
			$endpoint->flush_cache();
		}
	}

	/**
	 * Return all registered endpoints regardless of enabled/applicable state.
	 *
	 * @return Abstract_Well_Known_Endpoint[]
	 */
	public function get_all_endpoints(): array {
		return $this->endpoints;
	}

	/**
	 * Return only the endpoints that are currently active (enabled AND applicable).
	 * Used by Ard_Manifest to enumerate live capabilities.
	 *
	 * @return Abstract_Well_Known_Endpoint[]
	 */
	public function get_active_endpoints(): array {
		return array_filter(
			$this->endpoints,
			static function ( Abstract_Well_Known_Endpoint $e ): bool {
				return $e->is_enabled() && $e->is_applicable();
			}
		);
	}

	// ------------------------------------------------------------------
	// Internals
	// ------------------------------------------------------------------

	/**
	 * Extract the request path, stripping the home_url() prefix for
	 * subdirectory WordPress installs — the same logic used by Request_Path::matches().
	 */
	private function get_normalized_path(): string {
		$request_uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) )
			: '';

		$path = wp_parse_url( $request_uri, PHP_URL_PATH );

		if ( ! is_string( $path ) ) {
			return '';
		}

		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );

		if ( is_string( $home_path ) && '' !== $home_path && '/' !== $home_path ) {
			$home_path = untrailingslashit( $home_path );

			if ( 0 === strpos( $path, $home_path ) ) {
				$path = substr( $path, strlen( $home_path ) );
			}
		}

		return untrailingslashit( $path );
	}
}
