<?php

namespace Elementor\Modules\Agents;

use Elementor\Core\Utils\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The markdown version of a single post that an admin edited by hand.
 *
 * Stored as post meta so the override follows the post: it survives slug
 * changes and is removed by WordPress when the post is deleted.
 */
class Markdown_Manual_Content {

	const META_KEY = '_elementor_agent_ready_markdown_content';

	private Content_Generator $generator;

	public function __construct( Content_Generator $generator ) {
		$this->generator = $generator;
	}

	public function has_override( int $post_id ): bool {
		return '' !== $this->get_content( $post_id );
	}

	public function get_content( int $post_id ): string {
		$content = $this->get_stored( $post_id )['content'] ?? '';

		return is_string( $content ) ? $content : '';
	}

	/**
	 * @throws \InvalidArgumentException When the content is empty or exceeds the size cap.
	 */
	public function save( int $post_id, string $content ): void {
		$clean = $this->generator->prepare_markdown_override_text( $content );

		if ( '' === trim( $clean ) ) {
			throw new \InvalidArgumentException( esc_html__( 'The markdown content cannot be empty.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		if ( strlen( $clean ) > Content_Generator::LLMS_FULL_HARD_CAP ) {
			throw new \InvalidArgumentException( esc_html__( 'The markdown content is too large.', 'elementor' ), Exceptions::BAD_REQUEST ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		update_post_meta( $post_id, self::META_KEY, wp_slash( [
			'content'     => $clean,
			'modified_at' => time(),
		] ) );
	}

	public function delete( int $post_id ): void {
		delete_post_meta( $post_id, self::META_KEY );
	}

	private function get_stored( int $post_id ): array {
		$stored = get_post_meta( $post_id, self::META_KEY, true );

		return is_array( $stored ) ? $stored : [];
	}
}
