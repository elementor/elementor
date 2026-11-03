<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;
use Elementor\Modules\Agents\Markdown_Manual_Content;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Content_Ajax {

	const ACTION = 'agents_ready_save_markdown_content';

	private Markdown_Endpoint $endpoint;
	private Markdown_Manual_Content $manual_content;

	public function __construct( Markdown_Endpoint $endpoint, Markdown_Manual_Content $manual_content ) {
		$this->endpoint       = $endpoint;
		$this->manual_content = $manual_content;
	}

	/**
	 * @param array $data Ajax request data: { postId: int, content: string }.
	 * @return array{isOverridden: bool}
	 * @throws \Exception When the user can't manage options, the post is not available, or the content is invalid.
	 */
	public function handle( array $data ): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( esc_html__( 'Permission denied.', 'elementor' ), Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$post = $this->get_available_post( $data );

		$content = is_string( $data['content'] ?? null ) ? $data['content'] : '';

		$this->manual_content->save( $post->ID, $content );

		return [
			'isOverridden' => true,
		];
	}

	private function get_available_post( array $data ): \WP_Post {
		$post = get_post( isset( $data['postId'] ) ? absint( $data['postId'] ) : 0 );

		if ( ! ( $post instanceof \WP_Post ) || ! $this->endpoint->is_markdown_access_allowed( $post ) ) {
			throw new \Exception( esc_html__( 'This content is not available.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return $post;
	}
}
