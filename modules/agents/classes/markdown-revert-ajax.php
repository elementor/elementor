<?php

namespace Elementor\Modules\Agents\Classes;

use Elementor\Core\Utils\Exceptions;
use Elementor\Modules\Agents\Markdown_Manual_Content;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Markdown_Revert_Ajax {

	const ACTION = 'agents_ready_revert_markdown_content';

	private Markdown_Manual_Content $manual_content;

	public function __construct( Markdown_Manual_Content $manual_content ) {
		$this->manual_content = $manual_content;
	}

	/**
	 * @param array $data Ajax request data: { postId: int }.
	 * @return array{isOverridden: bool}
	 * @throws \Exception When the user can't manage options or the post doesn't exist.
	 */
	public function handle( array $data ): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( esc_html__( 'Permission denied.', 'elementor' ), Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$post = get_post( isset( $data['postId'] ) ? absint( $data['postId'] ) : 0 );

		if ( ! ( $post instanceof \WP_Post ) ) {
			throw new \Exception( esc_html__( 'This content is not available.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$this->manual_content->delete( $post->ID );

		return [
			'isOverridden' => false,
		];
	}
}
