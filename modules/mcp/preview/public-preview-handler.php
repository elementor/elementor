<?php

namespace Elementor\Modules\Mcp\Preview;

use Elementor\Core\Documents_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Public_Preview_Handler {

	private ?int $active_post_id = null;
	private ?int $active_revision_id = null;

	public function register(): void {
		add_action( 'parse_request', [ $this, 'maybe_activate' ], 1 );
	}

	public function maybe_activate( \WP $wp ): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$raw_token = isset( $_GET[ Preview_Token::QUERY_ARG ] ) ? sanitize_text_field( wp_unslash( $_GET[ Preview_Token::QUERY_ARG ] ) ) : '';

		if ( '' === $raw_token ) {
			return;
		}

		$claims = Preview_Token::decode( $raw_token, Preview_Token::secret() );

		if ( null === $claims ) {
			return;
		}

		if ( Preview_Token::is_expired( $claims, time() ) ) {
			return;
		}

		if ( ! $this->is_valid_post( $claims['post_id'] ) ) {
			return;
		}

		if ( ! $this->is_valid_revision( $claims['post_id'], $claims['revision_id'] ) ) {
			return;
		}

		$this->active_post_id = $claims['post_id'];
		$this->active_revision_id = $claims['revision_id'];

		/**
		 * Fires when a public preview request is accepted, before its main query is set.
		 *
		 * @param \WP_Post $post The previewed post.
		 */
		do_action( 'elementor/mcp/preview/activated', get_post( $claims['post_id'] ) );

		$this->rewrite_main_query( $wp, $claims['post_id'] );
		$this->install_render_filters();
		$this->send_privacy_headers();
	}

	private function is_valid_post( int $post_id ): bool {
		if ( $post_id <= 0 ) {
			return false;
		}

		$post = get_post( $post_id );

		if ( ! $post || 'revision' === $post->post_type ) {
			return false;
		}

		$document = Plugin::$instance->documents->get( $post_id );

		return $document && $document->is_built_with_elementor();
	}

	private function is_valid_revision( int $post_id, int $revision_id ): bool {
		$revision = get_post( $revision_id );

		if ( ! $revision || 'revision' !== $revision->post_type ) {
			return false;
		}

		return (int) $revision->post_parent === $post_id;
	}

	private function rewrite_main_query( \WP $wp, int $post_id ): void {
		$post = get_post( $post_id );

		if ( ! $post ) {
			return;
		}

		$query_vars = [
			'p' => $post_id,
			'post_type' => $post->post_type,
			'post_status' => [ 'publish', 'draft', 'pending', 'private', 'future', 'auto-draft' ],
		];

		/**
		 * Filters the main query of a public preview request.
		 *
		 * Documents that are not rendered on their own URL, such as site parts, can render
		 * inside another page instead. The previewed document still reads its snapshot meta.
		 *
		 * @param array    $query_vars Main query vars for the previewed post.
		 * @param \WP_Post $post       The previewed post.
		 */
		$wp->query_vars = apply_filters( 'elementor/mcp/preview/query_vars', $query_vars, $post );
	}

	private function install_render_filters(): void {
		add_filter( Documents_Manager::FRONTEND_DOCUMENT_ID_FILTER, [ $this, 'filter_frontend_document_id' ] );
		add_filter( 'posts_results', [ $this, 'filter_posts_results' ], 10, 1 );
		add_filter( 'the_preview', [ $this, 'filter_the_preview' ], 10, 1 );
	}

	public function filter_frontend_document_id( $post_id ) {
		return (int) $post_id === $this->active_post_id ? $this->active_revision_id : $post_id;
	}

	public function filter_posts_results( $posts ) {
		if ( ! is_array( $posts ) || null === $this->active_post_id ) {
			return $posts;
		}

		foreach ( $posts as $post ) {
			if ( isset( $post->ID ) && (int) $post->ID === $this->active_post_id ) {
				$post->post_status = 'publish';
			}
		}

		return $posts;
	}

	public function filter_the_preview( $post ) {
		if ( isset( $post->ID ) && (int) $post->ID === $this->active_post_id ) {
			$post->post_status = 'publish';
		}

		return $post;
	}

	private function send_privacy_headers(): void {
		if ( headers_sent() ) {
			return;
		}

		header( 'X-Robots-Tag: noindex, nofollow, noarchive' );
		header( 'Cache-Control: private, no-store, max-age=0' );
		header( 'Referrer-Policy: no-referrer' );
	}
}
