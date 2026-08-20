<?php

namespace Elementor\Modules\Agents\Components\Readability\Extractors;

use Elementor\Modules\MarkdownRender\Html_To_Markdown;
use Elementor\Modules\MarkdownRender\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extracts markdown from posts written with the WordPress block editor.
 *
 * Walks the parsed block tree recursively and converts each known core block
 * to its markdown equivalent.  Unrecognised or dynamic blocks are rendered
 * via `render_block()` and then converted through `Html_To_Markdown`.
 *
 * Priority: 20 (runs after Elementor_Extractor).
 */
class Block_Extractor implements Extractor_Interface {

	/**
	 * Return true when the post content contains at least one block.
	 *
	 * @param \WP_Post $post
	 * @return bool
	 */
	public function can_handle( \WP_Post $post ): bool {
		return has_blocks( $post->post_content );
	}

	/**
	 * Parse the block tree and convert it to markdown.
	 *
	 * @param \WP_Post $post
	 * @return string Body markdown, or '' on failure.
	 */
	public function extract( \WP_Post $post ): string {
		try {
			return Module::execute_while_rendering_markdown( function () use ( $post ) {
				$blocks = parse_blocks( $post->post_content );
				$parts  = [];

				foreach ( $blocks as $block ) {
					$md = $this->render_block_to_markdown( $block );

					if ( '' !== trim( $md ) ) {
						$parts[] = trim( $md );
					}
				}

				return implode( "\n\n", $parts );
			} );
		} catch ( \Throwable $e ) {
			return '';
		}
	}

	/**
	 * @return string
	 */
	public function get_id(): string {
		return 'block';
	}

	/**
	 * @return int
	 */
	public function get_priority(): int {
		return 20;
	}

	// -------------------------------------------------------------------------
	// Private helpers
	// -------------------------------------------------------------------------

	/**
	 * Convert a single parsed block (and its inner blocks) to markdown.
	 *
	 * @param array $block Parsed block array from `parse_blocks()`.
	 * @return string
	 */
	private function render_block_to_markdown( array $block ): string {
		$name  = $block['blockName'] ?? '';
		$attrs = $block['attrs'] ?? [];
		$inner = $block['innerHTML'] ?? '';

		switch ( $name ) {
			case 'core/heading':
				$level  = isset( $attrs['level'] ) ? (int) $attrs['level'] : 2;
				$level  = max( 1, min( 6, $level ) );
				$text   = wp_strip_all_tags( $inner );
				$text   = html_entity_decode( trim( $text ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );

				return str_repeat( '#', $level ) . ' ' . $text;

			case 'core/paragraph':
			case 'core/preformatted':
				$text = wp_strip_all_tags( $inner );
				$text = html_entity_decode( trim( $text ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );

				return $text;

			case 'core/quote':
				$text = wp_strip_all_tags( $inner );
				$text = html_entity_decode( trim( $text ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );
				$lines = explode( "\n", $text );

				return implode( "\n", array_map(
					static fn( string $line ) => '> ' . $line,
					$lines
				) );

			case 'core/list':
				return $this->convert_list_html( $inner );

			case 'core/image':
				$src = $attrs['url'] ?? '';
				$alt = $attrs['alt'] ?? '';

				if ( '' === $src ) {
					return '';
				}

				return '![' . $alt . '](' . $src . ')';

			case 'core/code':
				$code = isset( $attrs['content'] )
					? html_entity_decode( $attrs['content'], ENT_QUOTES | ENT_HTML5, 'UTF-8' )
					: wp_strip_all_tags( $inner );
				$code = rtrim( $code, "\n" );

				return "```\n" . $code . "\n```";

			case 'core/separator':
				return '---';

			case 'core/table':
				return $this->convert_table_html( $inner );

			case null:
			case '':
				// Freeform / null block — recurse inner blocks, convert innerHTML.
				$parts = $this->recurse_inner_blocks( $block );

				if ( '' !== trim( $inner ) && empty( $block['innerBlocks'] ) ) {
					$parts[] = Html_To_Markdown::convert( $inner );
				}

				return implode( "\n\n", array_filter( $parts, static fn( $p ) => '' !== trim( $p ) ) );

			default:
				// Unrecognised / dynamic block: render via WordPress then convert.
				$parts = $this->recurse_inner_blocks( $block );

				$rendered = render_block( $block );

				if ( '' !== trim( $rendered ) ) {
					$parts[] = Html_To_Markdown::convert( $rendered );
				}

				return implode( "\n\n", array_filter( $parts, static fn( $p ) => '' !== trim( $p ) ) );
		}
	}

	/**
	 * Recursively convert inner blocks to markdown strings.
	 *
	 * @param array $block
	 * @return string[]
	 */
	private function recurse_inner_blocks( array $block ): array {
		$parts = [];

		foreach ( $block['innerBlocks'] ?? [] as $inner_block ) {
			$md = $this->render_block_to_markdown( $inner_block );

			if ( '' !== trim( $md ) ) {
				$parts[] = trim( $md );
			}
		}

		return $parts;
	}

	/**
	 * Convert a list block's inner HTML to a markdown list.
	 *
	 * Extracts `<li>` text values and prefixes each with `- `.
	 *
	 * @param string $html
	 * @return string
	 */
	private function convert_list_html( string $html ): string {
		if ( '' === $html ) {
			return '';
		}

		preg_match_all( '#<li[^>]*>(.*?)</li>#is', $html, $matches );

		if ( empty( $matches[1] ) ) {
			return Html_To_Markdown::convert( $html );
		}

		$lines = [];

		foreach ( $matches[1] as $item ) {
			$text = wp_strip_all_tags( $item );
			$text = html_entity_decode( trim( $text ), ENT_QUOTES | ENT_HTML5, 'UTF-8' );

			if ( '' !== $text ) {
				$lines[] = '- ' . $text;
			}
		}

		return implode( "\n", $lines );
	}

	/**
	 * Convert a table block's inner HTML to a best-effort plain-text table.
	 *
	 * @param string $html
	 * @return string
	 */
	private function convert_table_html( string $html ): string {
		if ( '' === $html ) {
			return '';
		}

		// Delegate to Html_To_Markdown which already handles <table> → markdown.
		return Html_To_Markdown::convert( $html );
	}
}
