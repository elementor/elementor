<?php

namespace Elementor\Modules\Mcp\Preview;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Public_Preview_Handler {

	const OVERRIDDEN_META_KEYS = [
		'_elementor_data',
		'_elementor_page_settings',
		'_elementor_css',
		'_elementor_edit_mode',
		'_elementor_template_type',
		'_elementor_version',
		'_elementor_pro_version',
		'_elementor_element_cache',
	];

	private ?int $active_post_id = null;
	private ?int $active_revision_id = null;
	private array $revision_meta_cache = [];

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
		$this->prime_revision_meta_cache( $claims['revision_id'] );

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

		$wp->query_vars = [
			'p' => $post_id,
			'post_type' => $post->post_type,
			'post_status' => [ 'publish', 'draft', 'pending', 'private', 'future', 'auto-draft' ],
		];
	}

	private function install_render_filters(): void {
		add_filter( 'get_post_metadata', [ $this, 'filter_post_metadata' ], 10, 4 );
		add_filter( 'posts_results', [ $this, 'filter_posts_results' ], 10, 1 );
		add_filter( 'the_preview', [ $this, 'filter_the_preview' ], 10, 1 );
	}

	public function filter_post_metadata( $value, $object_id, $meta_key, $single ) {
		if ( (int) $object_id !== $this->active_post_id ) {
			return $value;
		}

		if ( ! in_array( $meta_key, self::OVERRIDDEN_META_KEYS, true ) ) {
			return $value;
		}

		if ( ! array_key_exists( $meta_key, $this->revision_meta_cache ) ) {
			return $value;
		}

		return $this->revision_meta_cache[ $meta_key ];
	}

	private function prime_revision_meta_cache( int $revision_id ): void {
		foreach ( self::OVERRIDDEN_META_KEYS as $meta_key ) {
			$values = get_post_meta( $revision_id, $meta_key, false );

			if ( is_array( $values ) && ! empty( $values ) ) {
				$this->revision_meta_cache[ $meta_key ] = $values;
			}
		}
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
