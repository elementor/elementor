<?php

namespace Elementor\Modules\Agents\Components\Readability\Extractors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Contract for all content extractors in the readability chain.
 *
 * Each extractor is responsible for a single content source (Elementor,
 * block editor, classic editor, or full rendered template).  The chain
 * walks extractors in ascending priority order and uses the first one
 * whose `can_handle()` returns true and whose `extract()` result
 * contains enough non-whitespace characters.
 */
interface Extractor_Interface {

	/**
	 * Return true when this extractor is capable of handling the given post.
	 *
	 * @param \WP_Post $post
	 * @return bool
	 */
	public function can_handle( \WP_Post $post ): bool;

	/**
	 * Extract body markdown from the post.
	 *
	 * Returns only the body content — no frontmatter, no YAML delimiters.
	 * Returns an empty string when extraction fails or produces no content.
	 *
	 * @param \WP_Post $post
	 * @return string Body markdown.
	 */
	public function extract( \WP_Post $post ): string;

	/**
	 * Return a short machine-readable identifier for this extractor.
	 *
	 * Used for cache-provenance recording via Frontmatter_Builder::build().
	 *
	 * @return string
	 */
	public function get_id(): string;

	/**
	 * Return the priority used to order extractors in the chain.
	 *
	 * Lower numbers run first.
	 *
	 * @return int
	 */
	public function get_priority(): int;
}
