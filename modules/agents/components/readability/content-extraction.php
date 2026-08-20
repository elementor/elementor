<?php

namespace Elementor\Modules\Agents\Components\Readability;

use Elementor\Modules\Agents\Components\Readability\Extractors\Block_Extractor;
use Elementor\Modules\Agents\Components\Readability\Extractors\Classic_Extractor;
use Elementor\Modules\Agents\Components\Readability\Extractors\Elementor_Extractor;
use Elementor\Modules\Agents\Components\Readability\Extractors\Extractor_Interface;
use Elementor\Modules\Agents\Components\Readability\Extractors\Rendered_Extractor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Orchestrates the content-extractor chain.
 *
 * Extractors are walked in ascending priority order.  The first extractor
 * whose `can_handle()` returns true AND whose result contains at least
 * {@see Content_Extractor::MIN_CONTENT_CHARS} non-whitespace characters is
 * used.  Extraction falls through to the next extractor on an empty or
 * below-threshold result.
 *
 * Third-party extractors may be injected via the
 * `elementor/agents/markdown/extractors` filter.
 *
 * Scope can be narrowed to Elementor-built content only via the
 * `elementor/agents/markdown/coverage` filter (values: `all`, `elementor_only`).
 */
class Content_Extractor {

	/**
	 * Minimum number of non-whitespace characters an extraction must contain
	 * before it is accepted as a valid result.
	 */
	const MIN_CONTENT_CHARS = 20;

	/**
	 * @var Extractor_Interface[]
	 */
	private array $extractors = [];

	/**
	 * Constructor — registers the built-in extractors and applies the
	 * third-party injection filter.
	 */
	public function __construct() {
		$defaults = [
			new Elementor_Extractor(),
			new Block_Extractor(),
			new Classic_Extractor(),
			new Rendered_Extractor(),
		];

		/**
		 * Filter the list of content extractors.
		 *
		 * Third-party code may add, remove, or reorder extractors.
		 * Each entry must implement Extractor_Interface.
		 *
		 * @param Extractor_Interface[] $extractors
		 */
		$extractors = apply_filters( 'elementor/agents/markdown/extractors', $defaults );

		// Sort by priority (ascending) and store.
		usort( $extractors, static fn( Extractor_Interface $a, Extractor_Interface $b ) => $a->get_priority() <=> $b->get_priority() );

		$this->extractors = $extractors;
	}

	/**
	 * Extract body markdown from a post using the extractor chain.
	 *
	 * Returns only body content — no frontmatter.
	 *
	 * @param \WP_Post $post
	 * @return string Body markdown, or '' when no extractor produces content.
	 */
	public function extract( \WP_Post $post ): string {
		foreach ( $this->get_active_extractors( $post ) as $extractor ) {
			if ( ! $extractor->can_handle( $post ) ) {
				continue;
			}

			$result = $extractor->extract( $post );

			if ( $this->is_sufficient( $result ) ) {
				return $result;
			}
		}

		return '';
	}

	/**
	 * Return the ID of the extractor that would produce content for the post.
	 *
	 * Useful for recording cache provenance without extracting twice — the
	 * caller should call `extract()` separately when the actual content is needed.
	 *
	 * @param \WP_Post $post
	 * @return string Extractor ID, or '' when no extractor produces content.
	 */
	public function get_extractor_id( \WP_Post $post ): string {
		foreach ( $this->get_active_extractors( $post ) as $extractor ) {
			if ( ! $extractor->can_handle( $post ) ) {
				continue;
			}

			$result = $extractor->extract( $post );

			if ( $this->is_sufficient( $result ) ) {
				return $extractor->get_id();
			}
		}

		return '';
	}

	// -------------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------------

	/**
	 * Return the list of extractors filtered by the coverage setting.
	 *
	 * When the `elementor/agents/markdown/coverage` filter returns
	 * `elementor_only`, only the Elementor_Extractor is included.
	 *
	 * @param \WP_Post $post
	 * @return Extractor_Interface[]
	 */
	private function get_active_extractors( \WP_Post $post ): array {
		/**
		 * Filter the extraction coverage mode.
		 *
		 * Accepted values:
		 *   'all'            – use the full extractor chain (default).
		 *   'elementor_only' – skip non-Elementor extractors.
		 *
		 * @param string   $coverage
		 * @param \WP_Post $post
		 */
		$coverage = (string) apply_filters( 'elementor/agents/markdown/coverage', 'all', $post );

		if ( 'elementor_only' === $coverage ) {
			return array_filter(
				$this->extractors,
				static fn( Extractor_Interface $e ) => 'elementor' === $e->get_id()
			);
		}

		return $this->extractors;
	}

	/**
	 * Return true when the extracted string is non-empty and meets the minimum
	 * non-whitespace character threshold.
	 *
	 * @param string $result
	 * @return bool
	 */
	private function is_sufficient( string $result ): bool {
		if ( '' === $result ) {
			return false;
		}

		return strlen( preg_replace( '/\s+/', '', $result ) ) >= self::MIN_CONTENT_CHARS;
	}
}
