<?php

namespace Elementor\Modules\Agents\Components\Readability\Extractors;

use Elementor\Modules\MarkdownRender\Html_To_Markdown;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Last-resort extractor for any post with `post_content`.
 *
 * Applies the standard `the_content` filter pipeline to the raw post content
 * (which expands shortcodes, oEmbeds, etc.) and then converts the resulting
 * HTML to markdown via `Html_To_Markdown`.
 *
 * Priority: 30 (runs after Block_Extractor).
 */
class Classic_Extractor implements Extractor_Interface {

	/**
	 * Always returns true — this extractor handles any post type.
	 *
	 * @param \WP_Post $post
	 * @return bool
	 */
	public function can_handle( \WP_Post $post ): bool {
		return true;
	}

	/**
	 * Apply `the_content` filters and convert the resulting HTML to markdown.
	 *
	 * @param \WP_Post $post
	 * @return string Body markdown, or '' on failure.
	 */
	public function extract( \WP_Post $post ): string {
		try {
			$html = apply_filters( 'the_content', $post->post_content );

			if ( '' === trim( $html ) ) {
				return '';
			}

			return Html_To_Markdown::convert( $html );
		} catch ( \Throwable $e ) {
			return '';
		}
	}

	/**
	 * @return string
	 */
	public function get_id(): string {
		return 'classic';
	}

	/**
	 * @return int
	 */
	public function get_priority(): int {
		return 30;
	}
}
