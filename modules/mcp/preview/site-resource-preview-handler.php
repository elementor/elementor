<?php

namespace Elementor\Modules\Mcp\Preview;

use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Resource_Preview_Handler {

	private ?int $active_post_id = null;

	public function register(): void {
		add_action( 'parse_request', [ $this, 'maybe_activate' ], 2 );
	}

	public function maybe_activate( \WP $wp ): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$raw_token = isset( $_GET[ Site_Resource_Preview_Token::QUERY_ARG ] )
			? sanitize_text_field( wp_unslash( $_GET[ Site_Resource_Preview_Token::QUERY_ARG ] ) )
			: '';

		if ( '' === $raw_token ) {
			return;
		}

		$claims = Site_Resource_Preview_Token::decode( $raw_token, Site_Resource_Preview_Token::secret() );

		if ( null === $claims ) {
			return;
		}

		if ( Site_Resource_Preview_Token::is_expired( $claims, time() ) ) {
			return;
		}

		if ( ! $this->is_valid_post( $claims['post_id'] ) ) {
			return;
		}

		$this->active_post_id = $claims['post_id'];

		$this->rewrite_main_query( $wp, $claims['post_id'] );
		$this->install_render_filters();
		$this->bypass_template_library_frontend_block();
		$this->allow_framing();
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

		$wp->query_vars = apply_filters( 'elementor/mcp/preview/query_vars', $query_vars, $post );
	}

	private function install_render_filters(): void {
		add_filter( 'posts_results', [ $this, 'filter_posts_results' ], 10, 1 );
		add_filter( 'the_preview', [ $this, 'filter_the_preview' ], 10, 1 );
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

	private function bypass_template_library_frontend_block(): void {
		$source = Plugin::$instance->templates_manager->get_source( 'local' );

		if ( $source instanceof Source_Local ) {
			remove_action( 'template_redirect', [ $source, 'block_template_frontend' ] );
		}
	}

	private function allow_framing(): void {
		add_filter( 'x_frame_options', '__return_false' );
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
