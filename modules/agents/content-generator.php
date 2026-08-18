<?php

namespace Elementor\Modules\Agents;

use Elementor\Modules\MarkdownRender\Markdown_Renderer;
use Elementor\Modules\MarkdownRender\Module as Markdown_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Generates llms.txt and llms-full.txt content entirely from the WordPress
 * database — no AI, no external calls.
 *
 * Both files conform to the llmstxt.org spec:
 *   # Site Name
 *   > intro / summary (blockquote)
 *   ## Section
 *   - [Title](URL): description
 *
 * llms-full.txt additionally inlines the full content of each page/post,
 * size-capped at ~500 KB target / 1 MB hard ceiling.
 */
class Content_Generator {

	/** Target byte size for llms-full.txt before we start dropping content. */
	const LLMS_FULL_TARGET_SIZE = 512000; // 500 KB

	/** Hard byte ceiling for llms-full.txt — we never exceed this. */
	const LLMS_FULL_HARD_CAP = 1048576; // 1 MB

	/**
	 * Maximum number of posts fetched per post type.
	 * Keeps single-site queries bounded on large sites.
	 */
	const MAX_POSTS_PER_TYPE = 500;

	/**
	 * Post-meta key for the per-post inline-content cache (used in llms-full.txt).
	 * Bump INLINE_CACHE_VERSION to silently invalidate all cached entries.
	 */
	const INLINE_META_KEY      = '_elementor_agents_inline_cache';
	const INLINE_CACHE_VERSION = 1;

	/** Post types that should never appear in the output. */
	const EXCLUDED_POST_TYPES = [
		'attachment',
		'revision',
		'nav_menu_item',
		'custom_css',
		'customize_changeset',
		'oembed_cache',
		'user_request',
		'wp_block',
		'wp_template',
		'wp_template_part',
		'wp_global_styles',
		'wp_navigation',
		'elementor_library',
	];

	private Prompt_Injection_Sanitizer $sanitizer;

	public function __construct( Prompt_Injection_Sanitizer $sanitizer ) {
		$this->sanitizer = $sanitizer;
	}

	// -------------------------------------------------------------------------
	// Public API
	// -------------------------------------------------------------------------

	/**
	 * Generate the full llms.txt content.
	 *
	 * @param array{intro?: string, optional?: string} $overrides
	 *   'intro'    – user-supplied intro text (replaces the auto-generated one).
	 *   'optional' – extra section appended after all content sections.
	 * @return string
	 */
	public function generate_llms_txt( array $overrides = [] ): string {
		$lines = $this->build_header( $overrides );

		$sections = $this->get_content_sections();

		foreach ( $sections as $title => $items ) {
			if ( empty( $items ) ) {
				continue;
			}

			$lines[] = '## ' . $title;
			$lines[] = '';

			foreach ( $items as $item ) {
				$lines[] = $this->format_link_line( $item );
			}

			$lines[] = '';
		}

		$this->append_optional_section( $lines, $overrides );

		return implode( "\n", $lines );
	}

	/**
	 * Generate the full llms-full.txt content (links + inlined page/post content).
	 *
	 * WooCommerce products are linked but their content is not inlined.
	 * Total output is capped at LLMS_FULL_HARD_CAP bytes; pages and posts are
	 * prioritised over WooCommerce catalog data.
	 *
	 * @param array{intro?: string, optional?: string} $overrides
	 * @return string
	 */
	public function generate_llms_full_txt( array $overrides = [] ): string {
		$lines = $this->build_header( $overrides );

		$sections = $this->get_content_sections();

		// Separate WooCommerce products from everything else so we can deprioritise them.
		$product_section = $sections['Products'] ?? [];
		unset( $sections['Products'] );

		$content_blocks = []; // [ 'header' => string, 'body' => string ]

		foreach ( $sections as $title => $items ) {
			if ( empty( $items ) ) {
				continue;
			}

			$block_lines = [];
			$block_lines[] = '## ' . $title;
			$block_lines[] = '';

			foreach ( $items as $item ) {
				$block_lines[] = $this->format_link_line( $item );
			}

			$block_lines[] = '';
			$content_blocks[] = [
				'header' => implode( "\n", $block_lines ),
				'items'  => $items,
			];
		}

		// Always append WooCommerce products as links-only at the end.
		if ( ! empty( $product_section ) ) {
			$product_lines   = [];
			$product_lines[] = '## Products';
			$product_lines[] = '';

			foreach ( $product_section as $item ) {
				$product_lines[] = $this->format_link_line( $item );
			}

			$product_lines[] = '';
			$content_blocks[] = [
				'header' => implode( "\n", $product_lines ),
				'items'  => [], // no inline content for products
			];
		}

		// Build output, inlining content and respecting the size cap.
		$header_text = implode( "\n", $lines );
		$output      = $header_text;
		$output_size = strlen( $output );

		foreach ( $content_blocks as $block ) {
			$section_text = $block['header'];

			// Add inline content for each item in this section (if any).
			if ( ! empty( $block['items'] ) ) {
				foreach ( $block['items'] as $item ) {
					if ( empty( $item['id'] ) ) {
						continue;
					}

					$inline = $this->get_inline_content( (int) $item['id'] );

					if ( '' === $inline ) {
						continue;
					}

					// Build the inline block for this document.
					$inline_block = "\n---\n\n" . $inline . "\n";

					// Hard-cap check: if adding this block would exceed 1 MB, stop.
					if ( $output_size + strlen( $section_text ) + strlen( $inline_block ) > self::LLMS_FULL_HARD_CAP ) {
						break 2; // stop processing all further content blocks
					}

					$section_text .= $inline_block;

					// If we've passed the 500 KB target, keep going but note it.
					// The hard cap above will stop us if we truly go over 1 MB.
					$output_size += strlen( $inline_block );
				}
			}

			// Hard-cap check for the section header itself.
			if ( $output_size + strlen( $section_text ) > self::LLMS_FULL_HARD_CAP ) {
				break;
			}

			$output      .= "\n" . $section_text;
			$output_size  = strlen( $output );
		}

		// Append the user-editable optional section to the output directly,
		// since $output was already built from $lines before the content loop.
		if ( ! empty( $overrides['optional'] ) ) {
			$output .= "\n## Optional\n\n" . trim( $overrides['optional'] ) . "\n";
		}

		return $output;
	}

	/**
	 * Return an array of human-readable warnings about missing requirements
	 * that would improve the generated output quality.
	 *
	 * @return string[]
	 */
	public function get_missing_requirements(): array {
		$warnings = [];

		if ( empty( get_bloginfo( 'description' ) ) ) {
			$warnings[] = __( 'Site tagline is empty — add one under Settings → General for a better intro summary.', 'elementor' );
		}

		$show_on_front = get_option( 'show_on_front' );

		if ( 'page' === $show_on_front ) {
			$page_on_front = (int) get_option( 'page_on_front' );

			if ( ! $page_on_front || 'publish' !== get_post_status( $page_on_front ) ) {
				$warnings[] = __( 'A static front page is configured but the page is missing or not published.', 'elementor' );
			}
		}

		$page_count = wp_count_posts( 'page' );

		if ( empty( $page_count->publish ) ) {
			$warnings[] = __( 'No published pages found — add some pages to populate the Pages section.', 'elementor' );
		}

		$post_count = wp_count_posts( 'post' );

		if ( empty( $post_count->publish ) ) {
			$warnings[] = __( 'No published posts found — add some posts to populate the Posts section.', 'elementor' );
		}

		return $warnings;
	}

	// -------------------------------------------------------------------------
	// Header / intro helpers
	// -------------------------------------------------------------------------

	/**
	 * Build the common header lines: site name + blockquote intro.
	 *
	 * @param array{intro?: string} $overrides
	 * @return string[]
	 */
	private function build_header( array $overrides ): array {
		$lines   = [];
		$lines[] = '# ' . get_bloginfo( 'name' );
		$lines[] = '';

		$intro = isset( $overrides['intro'] )
			? trim( $overrides['intro'] )
			: $this->generate_intro();

		if ( '' !== $intro ) {
			foreach ( explode( "\n", $intro ) as $intro_line ) {
				$lines[] = '> ' . $intro_line;
			}

			$lines[] = '';
		}

		return $lines;
	}

	/**
	 * Auto-generate the intro from the site tagline and/or the front-page
	 * description/excerpt.
	 */
	private function generate_intro(): string {
		$show_on_front = get_option( 'show_on_front' );

		if ( 'page' === $show_on_front ) {
			$page_id = (int) get_option( 'page_on_front' );

			if ( $page_id ) {
				$candidate = $this->get_post_description( $page_id );

				if ( '' !== $candidate ) {
					return $candidate;
				}
			}
		}

		$tagline = get_bloginfo( 'description' );

		return '' !== $tagline
			? $this->sanitizer->sanitize( $tagline )
			: '';
	}

	// -------------------------------------------------------------------------
	// Content section builders
	// -------------------------------------------------------------------------

	/**
	 * Build an ordered map of section_title => items for all eligible content.
	 *
	 * @return array<string, array<array{id: int, title: string, url: string, description: string}>>
	 */
	private function get_content_sections(): array {
		$sections = [];

		// 1. Pages — hierarchical order (menu_order ASC, then parent-child).
		$pages = $this->get_posts_for_section( 'page', [
			'orderby'  => 'menu_order',
			'order'    => 'ASC',
		] );

		if ( ! empty( $pages ) ) {
			$sections[ __( 'Pages', 'elementor' ) ] = $pages;
		}

		// 2. Posts — latest first.
		$posts = $this->get_posts_for_section( 'post', [
			'orderby' => 'date',
			'order'   => 'DESC',
		] );

		if ( ! empty( $posts ) ) {
			$sections[ __( 'Posts', 'elementor' ) ] = $posts;
		}

		// 3. Public custom post types (excluding built-ins and WooCommerce products handled separately).
		$cpts = $this->get_public_custom_post_types();

		foreach ( $cpts as $cpt ) {
			$items = $this->get_posts_for_section( $cpt->name, [
				'orderby' => 'date',
				'order'   => 'DESC',
			] );

			if ( ! empty( $items ) ) {
				$sections[ $cpt->labels->name ?? $cpt->name ] = $items;
			}
		}

		// 4. WooCommerce products — links only (content never inlined in llms-full).
		if ( $this->is_woocommerce_active() ) {
			$products = $this->get_posts_for_section( 'product', [
				'orderby' => 'date',
				'order'   => 'DESC',
			] );

			if ( ! empty( $products ) ) {
				$sections[ __( 'Products', 'elementor' ) ] = $products;
			}
		}

		return $sections;
	}

	/**
	 * Fetch published, indexable, public posts of a given type.
	 *
	 * @param string  $post_type
	 * @param array   $query_overrides Additional WP_Query args.
	 * @return array<array{id: int, title: string, url: string, description: string}>
	 */
	private function get_posts_for_section( string $post_type, array $query_overrides = [] ): array {
		$args = array_merge(
			[
				'post_type'              => $post_type,
				'post_status'            => 'publish',
				'posts_per_page'         => self::MAX_POSTS_PER_TYPE,
				'orderby'                => 'date',
				'order'                  => 'DESC',
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
				'has_password'           => false,
			],
			$query_overrides
		);

		$query  = new \WP_Query( $args );
		$result = [];

		foreach ( $query->posts as $post ) {
			if ( ! ( $post instanceof \WP_Post ) ) {
				continue;
			}

			// Skip password-protected content (belt-and-suspenders — has_password handles most).
			if ( post_password_required( $post ) ) {
				continue;
			}

			// Respect noindex signals from SEO plugins.
			if ( $this->is_noindex( $post->ID ) ) {
				continue;
			}

			$permalink = get_permalink( $post->ID );

			if ( ! is_string( $permalink ) || '' === $permalink ) {
				continue;
			}

			$result[] = [
				'id'          => $post->ID,
				'title'       => $this->clean_title( get_the_title( $post->ID ) ),
				'url'         => $permalink,
				'description' => $this->get_post_description( $post->ID ),
			];
		}

		return $result;
	}

	/**
	 * Return all public, non-built-in, non-excluded CPTs except WooCommerce
	 * products (handled separately) and page/post (handled above).
	 *
	 * @return \WP_Post_Type[]
	 */
	private function get_public_custom_post_types(): array {
		$excluded = array_merge( self::EXCLUDED_POST_TYPES, [ 'page', 'post', 'product' ] );

		$all = get_post_types(
			[
				'public'   => true,
				'_builtin' => false,
			],
			'objects'
		);

		return array_filter(
			$all,
			static fn( \WP_Post_Type $pt ) => ! in_array( $pt->name, $excluded, true )
		);
	}

	// -------------------------------------------------------------------------
	// Noindex detection
	// -------------------------------------------------------------------------

	/**
	 * Return true if any active SEO plugin has marked this post as noindex,
	 * or if the page/post is otherwise excluded from public indexing.
	 */
	private function is_noindex( int $post_id ): bool {
		// Yoast SEO.
		if ( '1' === get_post_meta( $post_id, '_yoast_wpseo_meta-robots-noindex', true ) ) {
			return true;
		}

		// RankMath (stores as serialised array or comma-separated string).
		$rm = get_post_meta( $post_id, 'rank_math_robots', true );

		if ( is_array( $rm ) && in_array( 'noindex', $rm, true ) ) {
			return true;
		}

		if ( is_string( $rm ) && false !== strpos( $rm, 'noindex' ) ) {
			return true;
		}

		// All in One SEO.
		if ( '1' === (string) get_post_meta( $post_id, '_aioseo_noindex', true ) ) {
			return true;
		}

		// SEOPress.
		if ( 'yes' === get_post_meta( $post_id, '_seopress_robots_index', true ) ) {
			return true;
		}

		return false;
	}

	// -------------------------------------------------------------------------
	// Description / content helpers
	// -------------------------------------------------------------------------

	/**
	 * Derive a short description for a post.
	 *
	 * Priority: SEO plugin metadesc → manual excerpt → (nothing).
	 * The result is always run through the prompt-injection sanitizer.
	 */
	private function get_post_description( int $post_id ): string {
		$candidates = [
			get_post_meta( $post_id, '_yoast_wpseo_metadesc', true ),
			get_post_meta( $post_id, 'rank_math_description', true ),
			get_post_meta( $post_id, '_aioseo_description', true ),
			get_post_meta( $post_id, '_seopress_titles_desc', true ),
			get_post_field( 'post_excerpt', $post_id ),
		];

		foreach ( $candidates as $candidate ) {
			if ( is_string( $candidate ) && '' !== trim( $candidate ) ) {
				return $this->sanitizer->sanitize( $candidate );
			}
		}

		return '';
	}

	/**
	 * Get the inline content for a post to embed in llms-full.txt.
	 *
	 * For Elementor documents: uses the Markdown_Renderer.
	 * For non-Elementor posts: falls back to the post excerpt then stripped content.
	 *
	 * @param int $post_id
	 * @return string Markdown-formatted content, or '' if unavailable.
	 */
	/**
	 * Get the inline content for a post, serving from the post-meta cache when
	 * available and storing a fresh result there on a miss.
	 *
	 * Cache storage by content type:
	 *   - Posts, pages, singles → post meta (cleared on save/trash via Module hooks)
	 *   - Assembled llms.txt / llms-full.txt → transients (managed by Llms_Cache)
	 *
	 * @param int $post_id
	 * @return string Markdown-formatted content, or '' if unavailable.
	 */
	private function get_inline_content( int $post_id ): string {
		$cached = $this->read_inline_meta_cache( $post_id );

		if ( false !== $cached ) {
			return $cached;
		}

		$content = $this->generate_inline_content( $post_id );

		$this->write_inline_meta_cache( $post_id, $content );

		return $content;
	}

	/**
	 * Delete the cached inline content for a single post.
	 * Called by Module when the post is saved, trashed, or permanently deleted.
	 *
	 * @param int $post_id
	 */
	public function clear_post_cache( int $post_id ): void {
		delete_post_meta( $post_id, self::INLINE_META_KEY );
	}

	/**
	 * Delete the cached inline content for every post at once.
	 * Used when a global invalidation is needed (e.g. theme switch, plugin activation).
	 */
	public function clear_all_post_caches(): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
		$wpdb->delete( $wpdb->postmeta, [ 'meta_key' => self::INLINE_META_KEY ] );
	}

	// -------------------------------------------------------------------------
	// Inline content — generation
	// -------------------------------------------------------------------------

	/**
	 * Generate inline content for a single post (no caching — callers cache).
	 *
	 * For Elementor documents the Markdown_Renderer is used when the
	 * markdown-rendering experiment is active; otherwise we fall back to
	 * excerpt + stripped post_content.
	 */
	private function generate_inline_content( int $post_id ): string {
		$document = Plugin::$instance->documents->get( $post_id );

		if (
			$document &&
			$document->is_built_with_elementor() &&
			class_exists( Markdown_Module::class ) &&
			Plugin::$instance->experiments->is_feature_active( Markdown_Module::EXPERIMENT_NAME )
		) {
			try {
				return Markdown_Module::execute_while_rendering_markdown(
					fn() => ( new Markdown_Renderer() )->render( $document )
				);
			} catch ( \Throwable $e ) {
				// Fall through to plain-text fallback.
			}
		}

		// Fallback: title + excerpt + stripped content.
		$title   = $this->clean_title( get_the_title( $post_id ) );
		$excerpt = get_post_field( 'post_excerpt', $post_id );
		$content = get_post_field( 'post_content', $post_id );
		$content = wp_strip_all_tags( apply_filters( 'the_content', $content ) );

		$parts = array_filter( [ $excerpt, $content ] );
		$body  = implode( "\n\n", $parts );

		if ( '' === trim( $body ) ) {
			return '';
		}

		return "# {$title}\n\n" . $this->sanitizer->sanitize( $body );
	}

	// -------------------------------------------------------------------------
	// Inline content — post-meta cache primitives
	// -------------------------------------------------------------------------

	/**
	 * @return string|false Cached content, or false on miss / version mismatch.
	 */
	private function read_inline_meta_cache( int $post_id ) {
		$meta = get_post_meta( $post_id, self::INLINE_META_KEY, true );

		if ( ! is_array( $meta ) ) {
			return false;
		}

		if ( ( $meta['v'] ?? 0 ) !== self::INLINE_CACHE_VERSION ) {
			return false;
		}

		$content = $meta['content'] ?? false;

		return is_string( $content ) ? $content : false;
	}

	private function write_inline_meta_cache( int $post_id, string $content ): void {
		update_post_meta( $post_id, self::INLINE_META_KEY, [
			'v'       => self::INLINE_CACHE_VERSION,
			'content' => $content,
		] );
	}

	// -------------------------------------------------------------------------
	// Formatting helpers
	// -------------------------------------------------------------------------

	/**
	 * Format a single link line per the llmstxt.org spec.
	 *
	 * @param array{title: string, url: string, description: string} $item
	 */
	private function format_link_line( array $item ): string {
		$line = '- [' . $item['title'] . '](' . esc_url( $item['url'] ) . ')';

		if ( '' !== $item['description'] ) {
			$line .= ': ' . $item['description'];
		}

		return $line;
	}

	/**
	 * Append the user-editable "Optional" section if supplied.
	 *
	 * @param string[] $lines  Passed by reference.
	 * @param array{optional?: string} $overrides
	 */
	private function append_optional_section( array &$lines, array $overrides ): void {
		$optional = trim( $overrides['optional'] ?? '' );

		if ( '' === $optional ) {
			return;
		}

		$lines[] = '## Optional';
		$lines[] = '';
		$lines[] = $optional;
		$lines[] = '';
	}

	/**
	 * Strip HTML entities and tags from a post title.
	 */
	private function clean_title( string $title ): string {
		return html_entity_decode( wp_strip_all_tags( $title ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	// -------------------------------------------------------------------------
	// Plugin detection
	// -------------------------------------------------------------------------

	private function is_woocommerce_active(): bool {
		return class_exists( 'WooCommerce' );
	}
}
