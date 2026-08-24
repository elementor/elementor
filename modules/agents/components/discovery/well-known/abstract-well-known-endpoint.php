<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

use Elementor\Modules\Agents\Classes\Feature_Component;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Abstract base class for all /.well-known/ endpoints.
 *
 * Subclasses declare:
 *   - get_well_known_slug()  — the path segment after /.well-known/
 *   - generate_content()     — returns array (JSON-encoded) or string (sent as-is)
 *   - is_applicable()        — hard dependency gate (default: true)
 *
 * Routing, HTTP caching, and response emission are handled here.
 * Registration is centralised in Well_Known_Router — subclasses do not
 * hook template_redirect themselves; register() is a no-op.
 */
abstract class Abstract_Well_Known_Endpoint extends Feature_Component {

	/** Default cache TTL — 15 minutes. Short enough to propagate config changes quickly. */
	const CACHE_TTL = 900;

	/** Transient key prefix. */
	const TRANSIENT_PREFIX = 'elementor_agents_wk_';

	// ------------------------------------------------------------------
	// Subclass interface
	// ------------------------------------------------------------------

	/**
	 * Path segment after /.well-known/.
	 * Examples: 'agent.json', 'api-catalog', 'oauth-protected-resource'
	 */
	abstract public function get_well_known_slug(): string;

	/**
	 * Generate the endpoint payload.
	 *
	 * Return array/object → JSON-encoded and served as application/json.
	 * Return string       → served as-is (use get_content_type() to set MIME).
	 *
	 * User-controlled strings (site title, description) must pass through
	 * $this->sanitize() before being included.
	 *
	 * @return array|string
	 */
	abstract protected function generate_content();

	/**
	 * MIME type for the response. Override for text/markdown or text/plain.
	 */
	public function get_content_type(): string {
		return 'application/json';
	}

	/**
	 * Hard dependency gate — is this endpoint meaningful for this site right now?
	 *
	 * Return false when the feature the endpoint describes does not yet exist
	 * (e.g. WebMCP manifest before the WebMCP module is installed).
	 * The router skips inactive endpoints and lets WordPress produce a 404.
	 */
	public function is_applicable(): bool {
		return true;
	}

	// ------------------------------------------------------------------
	// Feature_Component contract
	// ------------------------------------------------------------------

	public function get_layer(): string {
		return 'discovery';
	}

	/**
	 * Registration is handled by Well_Known_Router.
	 * Individual endpoints do not wire their own hooks.
	 */
	public function register(): void {}

	// ------------------------------------------------------------------
	// Cache
	// ------------------------------------------------------------------

	/**
	 * Transient key for this endpoint's cached response.
	 */
	public function get_transient_key(): string {
		return self::TRANSIENT_PREFIX . preg_replace( '/[^a-z0-9]/', '_', $this->get_well_known_slug() );
	}

	/**
	 * Delete the cached response. Called by the router on global cache invalidation.
	 */
	public function flush_cache(): void {
		delete_transient( $this->get_transient_key() );
	}

	// ------------------------------------------------------------------
	// Request handling (called by Well_Known_Router)
	// ------------------------------------------------------------------

	/**
	 * Serve the response. Must exit — never returns.
	 */
	final public function handle_request(): void {
		$key    = $this->get_transient_key();
		$cached = get_transient( $key );

		// --- Cache hit ---
		if ( is_array( $cached ) ) {
			$this->send_response( $cached['body'], $cached['etag'], $cached['last_modified'] );
		}

		// --- Generate ---
		$raw = $this->generate_content();

		if ( is_array( $raw ) || is_object( $raw ) ) {
			$body = wp_json_encode( $raw, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		} else {
			$body = (string) $raw;
		}

		$etag          = '"' . md5( $body ) . '"';
		$last_modified = gmdate( 'D, d M Y H:i:s' ) . ' GMT';

		set_transient( $key, [
			'body'          => $body,
			'etag'          => $etag,
			'last_modified' => $last_modified,
		], self::CACHE_TTL );

		$this->send_response( $body, $etag, $last_modified );
	}

	// ------------------------------------------------------------------
	// Helpers for subclasses
	// ------------------------------------------------------------------

	/**
	 * Sanitize a metadata string before embedding in the response.
	 * Strips HTML and neutralises prompt-injection patterns.
	 */
	protected function sanitize( string $text ): string {
		return ( new Prompt_Injection_Sanitizer() )->sanitize( $text );
	}

	// ------------------------------------------------------------------
	// Internals
	// ------------------------------------------------------------------

	/**
	 * Check whether the client's cached copy is still fresh (ETag / Last-Modified).
	 * Returns true when a 304 was sent (and already exited).
	 */
	private function maybe_send_304( string $etag, string $last_modified ): void {
		$if_none_match = isset( $_SERVER['HTTP_IF_NONE_MATCH'] )
			? trim( sanitize_text_field( wp_unslash( $_SERVER['HTTP_IF_NONE_MATCH'] ) ) )
			: '';

		if ( '' !== $if_none_match ) {
			foreach ( explode( ',', $if_none_match ) as $candidate ) {
				$candidate = trim( $candidate );
				if ( '*' === $candidate || $candidate === $etag ) {
					status_header( 304 );
					exit;
				}
			}
			return;
		}

		$if_modified_since = isset( $_SERVER['HTTP_IF_MODIFIED_SINCE'] )
			? trim( sanitize_text_field( wp_unslash( $_SERVER['HTTP_IF_MODIFIED_SINCE'] ) ) )
			: '';

		if ( '' === $if_modified_since ) {
			return;
		}

		$client_ts = strtotime( $if_modified_since );
		$server_ts = strtotime( $last_modified );

		if ( false !== $client_ts && false !== $server_ts && $client_ts >= $server_ts ) {
			status_header( 304 );
			exit;
		}
	}

	private function send_response( string $body, string $etag, string $last_modified ): void {
		$this->maybe_send_304( $etag, $last_modified );

		$max_age = (int) apply_filters( 'elementor/agents/well_known/cache_max_age', self::CACHE_TTL );

		status_header( 200 );
		header( 'Content-Type: ' . $this->get_content_type() . '; charset=utf-8' );
		header( 'X-Content-Type-Options: nosniff' );
		header( 'Cache-Control: public, max-age=' . max( 0, $max_age ) );
		header( 'ETag: ' . $etag );
		header( 'Last-Modified: ' . $last_modified );

		Utils::print_unescaped_internal_string( $body );
		exit;
	}
}
