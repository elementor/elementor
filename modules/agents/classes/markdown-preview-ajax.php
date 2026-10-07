<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Preview_Ajax {

	const ACTION = 'agents_ready_preview_markdown';

	private Markdown_Endpoint $endpoint;

	public function __construct( Markdown_Endpoint $endpoint ) {
		$this->endpoint = $endpoint;
	}

	/**
	 * @param array $data Ajax request data: { postId: int }.
	 * @return array{content: string}
	 * @throws \Exception When the user can't manage options or the post is not included.
	 */
	public function handle( array $data ): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( esc_html__( 'Permission denied.', 'elementor' ), Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$post_id = isset( $data['postId'] ) ? absint( $data['postId'] ) : 0;
		$post    = get_post( $post_id );

		if ( ! ( $post instanceof \WP_Post ) ) {
			throw new \Exception( esc_html__( 'This content is not available.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( ! $this->endpoint->is_included_by_settings( $post ) ) {
			throw new \Exception( esc_html__( 'This content type is not included.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( ! $this->endpoint->is_markdown_access_allowed( $post ) ) {
			throw new \Exception( esc_html__( 'This content is not available.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return [
			'content' => $this->endpoint->build_markdown( $post ),
		];
	}
}
