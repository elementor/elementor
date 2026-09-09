<?php

namespace Elementor\Modules\Agents\Components\Readability\Extractors;

use Elementor\Modules\MarkdownRender\Html_To_Markdown;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Slowest-path extractor: captures the fully rendered page template.
 *
 * Disabled by default.  Enable via:
 *   add_filter( 'elementor/agents/markdown/enable_rendered_fallback', '__return_true' );
 *
 * After capturing the template output this extractor strips navigation,
 * header, footer, aside, script, and style elements before converting the
 * remaining HTML to markdown.  This is the most faithful representation of
 * what a visitor sees but is significantly slower than the other extractors.
 *
 * Priority: 40 (runs last).
 */
class Rendered_Extractor implements Extractor_Interface {

	/**
	 * Return true only when the rendered-fallback filter is enabled.
	 *
	 * @param \WP_Post $post
	 * @return bool
	 */
	public function can_handle( \WP_Post $post ): bool {
		return (bool) apply_filters( 'elementor/agents/markdown/enable_rendered_fallback', false );
	}

	/**
	 * Capture the page template output, strip chrome elements, and convert to markdown.
	 *
	 * @param \WP_Post $post
	 * @return string Body markdown, or '' on failure.
	 */
	public function extract( \WP_Post $post ): string {
		try {
			return $this->capture_template( $post );
		} catch ( \Throwable $e ) {
			return '';
		}
	}

	/**
	 * @return string
	 */
	public function get_id(): string {
		return 'rendered';
	}

	/**
	 * @return int
	 */
	public function get_priority(): int {
		return 40;
	}

	// -------------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------------

	/**
	 * Set up the global query for the post, capture template output, and clean it.
	 *
	 * @param \WP_Post $post
	 * @return string
	 */
	private function capture_template( \WP_Post $post ): string {
		global $wp_query, $wp_the_query;

		// Preserve the current global state so we can restore it afterwards.
		$saved_query    = $wp_query;    // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$saved_the_query = $wp_the_query; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited

		// Build a dedicated query for the target post.
		$args = [
			'p'              => $post->ID,
			'post_type'      => $post->post_type,
			'posts_per_page' => 1,
		];

		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$wp_query    = new \WP_Query( $args );
		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$wp_the_query = $wp_query;

		// Run the wp action so theme/plugin hooks that depend on it fire.
		do_action( 'wp' ); // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound

		// Resolve the template file for this post.
		$template = $this->resolve_template( $post );

		$html = '';

		if ( '' !== $template && file_exists( $template ) ) {
			ob_start();
			// phpcs:ignore WPThemeReview.CoreFunctionality.FileInclude.FileIncludeFound
			include $template;
			$html = (string) ob_get_clean();
		} else {
			// No template found — fall back to a simple content render.
			ob_start();
			setup_postdata( $post );

			echo wp_kses_post( apply_filters( 'the_content', $post->post_content ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

			wp_reset_postdata();
			$html = (string) ob_get_clean();
		}

		// Restore global query state.
		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$wp_query     = $saved_query;
		// phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		$wp_the_query = $saved_the_query;

		if ( '' === $html ) {
			return '';
		}

		$html = $this->strip_chrome_elements( $html );

		return Html_To_Markdown::convert( $html );
	}

	/**
	 * Attempt to locate the most specific template file for the post.
	 *
	 * @param \WP_Post $post
	 * @return string Absolute path to the template, or '' when none is found.
	 */
	private function resolve_template( \WP_Post $post ): string {
		$candidates = [
			get_page_template(),
			get_single_template(),
			get_singular_template(),
			get_index_template(),
		];

		foreach ( $candidates as $candidate ) {
			if ( is_string( $candidate ) && '' !== $candidate && file_exists( $candidate ) ) {
				return $candidate;
			}
		}

		return '';
	}

	/**
	 * Remove navigation, header, footer, aside, script, and style elements
	 * from the captured HTML before markdown conversion.
	 *
	 * Uses simple regex removal since we are operating on a full-page capture
	 * where `WP_HTML_Processor` may struggle with deeply nested or malformed
	 * structures.
	 *
	 * @param string $html
	 * @return string
	 */
	private function strip_chrome_elements( string $html ): string {
		$tags = [ 'nav', 'header', 'footer', 'aside', 'script', 'style' ];

		foreach ( $tags as $tag ) {
			$html = preg_replace(
				'#<' . $tag . '(\s[^>]*)?>.*?</' . $tag . '>#is',
				'',
				$html
			);
		}

		return $html;
	}
}
