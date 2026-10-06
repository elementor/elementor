<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Preview_Ajax {

	const ACTION = 'agents_ready_preview_markdown';

	private Agent_Ready_Settings $settings;

	private Markdown_Endpoint $endpoint;

	public function __construct( Agent_Ready_Settings $settings, Markdown_Endpoint $endpoint ) {
		$this->settings = $settings;
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

		if ( ! ( $post instanceof \WP_Post ) || ! $this->endpoint->is_markdown_access_allowed( $post ) ) {
			throw new \Exception( esc_html__( 'This content is not available.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( ! $this->settings->is_markdown_enabled() || ! in_array( $post->post_type, $this->settings->get_markdown_post_types(), true ) ) {
			throw new \Exception( esc_html__( 'This content type is not included.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return [
			'content' => $this->endpoint->build_markdown( $post ),
		];
	}
}
