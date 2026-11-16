<?php

namespace Elementor\Modules\Agents\Components\Readability\Extractors;

use Elementor\Modules\MarkdownRender\Markdown_Renderer;
use Elementor\Modules\MarkdownRender\Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extracts markdown from posts built with the Elementor editor.
 *
 * Uses `Markdown_Renderer::render_elements_data()` wrapped inside
 * `Module::execute_while_rendering_markdown()` so that widget output
 * skips CSS enqueueing and document-cache side effects.
 *
 * Priority: 10 (runs before all other extractors).
 */
class Elementor_Extractor implements Extractor_Interface {

	/**
	 * Return true when the post was built with Elementor.
	 *
	 * @param \WP_Post $post
	 * @return bool
	 */
	public function can_handle( \WP_Post $post ): bool {
		$document = Plugin::$instance->documents->get( $post->ID );

		return $document && $document->is_built_with_elementor();
	}

	/**
	 * Render Elementor element data to markdown.
	 *
	 * @param \WP_Post $post
	 * @return string Body markdown, or '' on failure.
	 */
	public function extract( \WP_Post $post ): string {
		try {
			$document = Plugin::$instance->documents->get( $post->ID );

			if ( ! $document ) {
				return '';
			}

			return Module::execute_while_rendering_markdown(
				fn() => ( new Markdown_Renderer() )->render_elements_data( $document->get_elements_data() )
			);
		} catch ( \Throwable $e ) {
			return '';
		}
	}

	/**
	 * @return string
	 */
	public function get_id(): string {
		return 'elementor';
	}

	/**
	 * @return int
	 */
	public function get_priority(): int {
		return 10;
	}
}
