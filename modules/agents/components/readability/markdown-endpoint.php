<?php

namespace Elementor\Modules\Agents\Components\Readability;

use Elementor\Modules\Agents\Classes\Feature_Component;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles the `.md` path endpoint for the Agents module.
 *
 * Intercepts requests of the form `/{slug}.md`, `/{post-type}/{slug}.md`,
 * and `/index.md`, resolves the target post, and serves a markdown response
 * composed of YAML front matter followed by extracted body content.
 *
 * Also serves as a fallback for `?format=markdown` / `Accept: text/markdown`
 * requests that the markdown-render module bailed on (non-Elementor pages),
 * and adds missing response headers to pages served by markdown-render.
 */
class Markdown_Endpoint extends Feature_Component {

	/**
	 * Stable string identifier for this component.
	 */
	public function get_id(): string {
		return 'markdown_endpoint';
	}

	/**
	 * Layer this component belongs to.
	 */
	public function get_layer(): string {
		return 'readability';
	}

	/** @var int|null Post ID resolved from a `.md` path request. */
	private ?int $md_post_id = null;

	/** @var bool Whether a `.md` path was detected on this request. */
	private bool $serving_md = false;

	// -------------------------------------------------------------------------
	// Registration
	// -------------------------------------------------------------------------

	/**
	 * Wire all hooks.
	 *
	 * Called by the component architecture once it is ready. Not invoked
	 * automatically — a follow-up PR will call this from module.php.
	 */
	public function register(): void {
		add_action( 'parse_request', [ $this, 'on_parse_request' ], 1 );
		add_action( 'template_redirect', [ $this, 'on_md_path_redirect' ], 1 );
		add_action( 'template_redirect', [ $this, 'on_markdown_request_fallback' ], 2 );
		add_action( 'elementor/markdown/headers', [ $this, 'on_markdown_headers' ] );
	}

	// -------------------------------------------------------------------------
	// Hooks
	// -------------------------------------------------------------------------

	/**
	 * Detect a `.md` suffix in the request path, resolve the matching post,
	 * and store it for the `template_redirect` handler.
	 *
	 * Fires at `parse_request` priority 1 — before WordPress has committed to
	 * a 404 response for an unknown path.
	 *
	 * @param \WP $wp Current WordPress environment instance.
	 */
	public function on_parse_request( \WP $wp ): void {
		$request_uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) )
			: '';

		$path = wp_parse_url( $request_uri, PHP_URL_PATH );

		if ( ! is_string( $path ) ) {
			return;
		}

		// Strip the home-URL path prefix (handles subdirectory installs).
		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );

		if ( is_string( $home_path ) && '' !== $home_path && '/' !== $home_path ) {
			$home_path = untrailingslashit( $home_path );

			if ( 0 === strpos( $path, $home_path ) ) {
				$path = substr( $path, strlen( $home_path ) );
			}
		}

		// Must end with `.md` and not be a known special file like `llms.txt`.
		if ( '.md' !== substr( $path, -3 ) ) {
			return;
		}

		// Strip the `.md` suffix to get the plain path.
		$plain_path = substr( $path, 0, -3 );

		// Resolve to a post ID.
		$post_id = url_to_postid( home_url( $plain_path ) );

		if ( ! $post_id ) {
			return;
		}

		$post = get_post( $post_id );

		if ( ! ( $post instanceof \WP_Post ) ) {
			return;
		}

		$this->md_post_id = $post_id;
		$this->serving_md = true;
	}

	/**
	 * If a `.md` path was resolved, serve the markdown response and exit.
	 *
	 * Fires at `template_redirect` priority 1 — before markdown-render's own
	 * `template_redirect` at priority 1 runs for the same request (WordPress
	 * calls multiple callbacks at the same priority in registration order, but
	 * this class is registered after markdown-render so we need priority 1 here
	 * to run in the same slot; in practice the `.md` path won't satisfy
	 * markdown-render's `is_singular()` check, so there is no conflict).
	 */
	public function on_md_path_redirect(): void {
		if ( ! $this->serving_md || null === $this->md_post_id ) {
			return;
		}

		$post = get_post( $this->md_post_id );

		if ( ! ( $post instanceof \WP_Post ) ) {
			return;
		}

		$this->serve_markdown( $post );
	}

	/**
	 * Fallback handler for `?format=markdown` or `Accept: text/markdown`
	 * requests on non-Elementor pages.
	 *
	 * The markdown-render module fires at `template_redirect` priority 1 and
	 * bails (returns without exiting) when the page is not built with Elementor.
	 * This handler runs at priority 2 to catch those cases.
	 *
	 * Fires at `template_redirect` priority 2.
	 */
	public function on_markdown_request_fallback(): void {
		// Already handled by the `.md` path flow.
		if ( $this->serving_md ) {
			return;
		}

		if ( ! $this->is_markdown_request() ) {
			return;
		}

		if ( ! is_singular() ) {
			return;
		}

		$post_id = get_the_ID();
		$post    = get_post( $post_id );

		if ( ! ( $post instanceof \WP_Post ) ) {
			return;
		}

		// Only handle pages not built with Elementor — those are already
		// handled (or intentionally skipped) by markdown-render.
		if ( class_exists( '\Elementor\Plugin' ) ) {
			$document = \Elementor\Plugin::$instance->documents->get( $post_id );

			if ( $document && $document->is_built_with_elementor() ) {
				return;
			}
		}

		$this->serve_markdown( $post );
	}

	/**
	 * Add the three response headers that markdown-render does not emit but
	 * that agents and crawlers expect on `.md` / markdown responses.
	 *
	 * Fires on the `elementor/markdown/headers` action, which is triggered by
	 * markdown-render just before it sends its own headers.
	 *
	 * @param int $post_id The post being served.
	 */
	public function on_markdown_headers( int $post_id ): void {
		header( 'Vary: Accept' );
		header( 'Link: <' . esc_url( get_permalink( $post_id ) ) . '>; rel="canonical"' );
		header( 'X-Robots-Tag: noindex' );
	}

	// -------------------------------------------------------------------------
	// Core serving logic
	// -------------------------------------------------------------------------

	/**
	 * Build and emit a complete markdown response for the given post, then exit.
	 *
	 * Performs a basic content-scope check (published, publicly viewable, not
	 * password-protected) before generating output. A dedicated `Content_Scope`
	 * class will replace this inline check in a later PR.
	 *
	 * @param \WP_Post $post The post to serve.
	 */
	public function serve_markdown( \WP_Post $post ): void {
		// Basic content-scope check (full Content_Scope class comes in a later PR).
		if ( 'publish' !== $post->post_status ) {
			return;
		}

		if ( post_password_required( $post ) ) {
			return;
		}

		if ( ! is_post_publicly_viewable( $post ) ) {
			return;
		}

		$extractor_id = Content_Extractor::get_extractor_id( $post );
		$body         = Content_Extractor::extract( $post );
		$frontmatter  = Frontmatter_Builder::build( $post, $extractor_id );

		$output = $frontmatter . "\n\n" . $body;

		$this->send_headers( $post->ID );
		status_header( 200 );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $output;
		exit;
	}

	/**
	 * Emit all required response headers for a markdown document.
	 *
	 * @param int $post_id The post ID whose canonical URL is included in the
	 *                     Link header.
	 */
	public function send_headers( int $post_id ): void {
		header( 'Content-Type: text/markdown; charset=utf-8' );
		header( 'X-Content-Type-Options: nosniff' );
		header( 'Vary: Accept' );
		header( 'Link: <' . esc_url( get_permalink( $post_id ) ) . '>; rel="canonical"' );
		header( 'X-Robots-Tag: noindex' );
	}

	// -------------------------------------------------------------------------
	// Internal helpers
	// -------------------------------------------------------------------------

	/**
	 * Return true if the current request signals a markdown response is desired,
	 * either via the `?format=markdown` query parameter or the `Accept` header.
	 *
	 * Mirrors the same logic used in the markdown-render module so the two
	 * modules agree on what constitutes a markdown request.
	 */
	private function is_markdown_request(): bool {
		if ( isset( $_GET['format'] ) && 'markdown' === $_GET['format'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return true;
		}

		$accept = isset( $_SERVER['HTTP_ACCEPT'] )
			? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ACCEPT'] ) )
			: '';

		return false !== strpos( $accept, 'text/markdown' );
	}
}
