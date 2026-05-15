<?php
namespace Elementor\Modules\MarkdownRender;

use WP_HTML_Processor;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Html_To_Markdown {

	const SAFE_URL_SCHEMES = [ 'http', 'https', 'mailto', 'tel', 'ftp', 'ftps' ];

	const SAFE_DATA_PREFIXES = [ 'data:image/png', 'data:image/jpeg', 'data:image/jpg', 'data:image/gif', 'data:image/webp', 'data:image/svg+xml' ];

	const ESCAPABLE_MARKDOWN_CHARS = [ '\\', '`', '*', '_', '[', ']' ];

	const VOID_TAGS = [ 'br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr' ];

	private $output = '';

	private $inline_buffer = '';

	private $list_stack = [];

	private $blockquote_depth = 0;

	private $in_pre = false;

	private $pre_buffer = '';

	private $pre_language = '';

	private $in_code = false;

	private $in_link = false;

	private $link_href = '';

	private $link_buffer = '';

	private $in_table = false;

	private $table_headers = [];

	private $table_rows = [];

	private $current_row = [];

	private $current_cell = '';

	private $in_table_head = false;

	private $row_is_header = false;

	private $heading_level = 0;

	public static function convert( string $html ): string {
		if ( '' === $html ) {
			return '';
		}

		$instance = new self();

		return $instance->run( $html );
	}

	private function run( string $html ): string {
		$html = $this->normalize_html( $html );

		$processor = WP_HTML_Processor::create_full_parser( $html );

		if ( null === $processor ) {
			return $this->fallback( $html );
		}

		try {
			$this->walk( $processor );
		} catch ( \Exception $e ) {
			return $this->fallback( $html );
		}

		$this->flush_inline();

		$output = $this->output;
		$output = preg_replace( "/[ \t]+\n/", "\n", $output );
		$output = preg_replace( "/\n{3,}/", "\n\n", $output );

		return trim( $output );
	}

	private function fallback( string $html ): string {
		$text = wp_strip_all_tags( $html );
		$text = html_entity_decode( $text, ENT_QUOTES, 'UTF-8' );

		return trim( preg_replace( "/\n{3,}/", "\n\n", $text ) );
	}

	private function normalize_html( string $html ): string {
		$html = preg_replace( '/\r\n?/', "\n", $html );
		$html = preg_replace( '#<script\b[^>]*>.*?</script>#is', '', $html );
		$html = preg_replace( '#<style\b[^>]*>.*?</style>#is', '', $html );
		$html = str_replace( "\xE2\x80\x8B", '', $html );

		return $html;
	}

	private function walk( WP_HTML_Processor $p ): void {
		while ( $p->next_token() ) {
			$type = $p->get_token_type();

			if ( '#text' === $type ) {
				$this->handle_text( $p->get_modifiable_text() );
				continue;
			}

			if ( '#tag' !== $type ) {
				continue;
			}

			$tag = strtolower( (string) $p->get_tag() );
			$is_closer = $p->is_tag_closer();
			$is_void = in_array( $tag, self::VOID_TAGS, true );

			if ( $is_closer ) {
				$this->handle_close( $tag );
				continue;
			}

			$this->handle_open( $tag, $p );

			if ( $is_void ) {
				$this->handle_close( $tag );
			}
		}
	}

	private function handle_text( string $text ): void {
		if ( '' === $text ) {
			return;
		}

		if ( $this->in_pre ) {
			$this->pre_buffer .= $text;
			return;
		}

		if ( $this->in_table ) {
			$this->current_cell .= $this->escape_text( $text, false );
			return;
		}

		$collapsed = preg_replace( '/[ \t\n]+/', ' ', $text );
		$escaped = $this->escape_text( $collapsed, $this->in_code );

		if ( $this->in_link ) {
			$this->link_buffer .= $escaped;
			return;
		}

		$this->inline_buffer .= $escaped;
	}

	private function handle_open( string $tag, WP_HTML_Processor $p ): void {
		switch ( $tag ) {
			case 'p':
			case 'div':
			case 'section':
			case 'article':
			case 'header':
			case 'footer':
			case 'main':
			case 'aside':
			case 'figure':
				$this->flush_inline();
				return;

			case 'h1':
			case 'h2':
			case 'h3':
			case 'h4':
			case 'h5':
			case 'h6':
				$this->flush_inline();
				$this->heading_level = (int) $tag[1];
				$this->inline_buffer = str_repeat( '#', $this->heading_level ) . ' ';
				return;

			case 'br':
				if ( $this->in_table ) {
					$this->current_cell .= ' ';
					return;
				}
				if ( $this->heading_level > 0 ) {
					$this->inline_buffer .= ' ';
					return;
				}
				$this->inline_buffer .= "\n";
				return;

			case 'hr':
				$this->flush_inline();
				$this->output .= "\n\n---\n\n";
				return;

			case 'strong':
			case 'b':
				$this->append_inline( '**' );
				return;

			case 'em':
			case 'i':
				$this->append_inline( '*' );
				return;

			case 'del':
			case 's':
			case 'strike':
				$this->append_inline( '~~' );
				return;

			case 'code':
				if ( $this->in_pre ) {
					$lang = (string) $p->get_attribute( 'class' );
					if ( preg_match( '/language-([A-Za-z0-9_+\-]+)/', $lang, $m ) ) {
						$this->pre_language = $m[1];
					}
					return;
				}
				$this->in_code = true;
				$this->append_inline( '`CODE_OPEN`' );
				return;

			case 'pre':
				$this->flush_inline();
				$this->in_pre = true;
				$this->pre_buffer = '';
				$this->pre_language = '';
				return;

			case 'a':
				$href = (string) $p->get_attribute( 'href' );
				$this->in_link = true;
				$this->link_href = $href;
				$this->link_buffer = '';
				return;

			case 'img':
				$this->emit_image( $p );
				return;

			case 'ul':
			case 'ol':
				if ( ! empty( $this->list_stack ) && '' !== trim( $this->inline_buffer ) ) {
					$this->emit_list_item();
				} else {
					$this->flush_inline();
				}
				$this->list_stack[] = [
					'type' => $tag,
					'index' => 1,
				];
				return;

			case 'li':
				$this->flush_inline();
				return;

			case 'blockquote':
				$this->flush_inline();
				$this->blockquote_depth++;
				return;

			case 'table':
				$this->flush_inline();
				$this->in_table = true;
				$this->table_headers = [];
				$this->table_rows = [];
				return;

			case 'thead':
				$this->in_table_head = true;
				return;

			case 'tr':
				if ( ! $this->in_table ) {
					return;
				}
				$this->current_row = [];
				$this->row_is_header = $this->in_table_head;
				return;

			case 'th':
				$this->row_is_header = true;
				$this->current_cell = '';
				return;

			case 'td':
				$this->current_cell = '';
				return;
		}
	}

	private function handle_close( string $tag ): void {
		switch ( $tag ) {
			case 'p':
			case 'div':
			case 'section':
			case 'article':
			case 'header':
			case 'footer':
			case 'main':
			case 'aside':
			case 'figure':
				$this->flush_inline();
				return;

			case 'h1':
			case 'h2':
			case 'h3':
			case 'h4':
			case 'h5':
			case 'h6':
				$this->inline_buffer = preg_replace( '/[ \t]+/', ' ', $this->inline_buffer );
				$this->flush_inline();
				$this->heading_level = 0;
				return;

			case 'strong':
			case 'b':
				$this->append_inline( '**' );
				return;

			case 'em':
			case 'i':
				$this->append_inline( '*' );
				return;

			case 'del':
			case 's':
			case 'strike':
				$this->append_inline( '~~' );
				return;

			case 'code':
				if ( $this->in_pre ) {
					return;
				}
				$this->append_inline( '`CODE_CLOSE`' );
				$this->in_code = false;
				return;

			case 'pre':
				$this->emit_pre();
				$this->in_pre = false;
				$this->pre_buffer = '';
				$this->pre_language = '';
				return;

			case 'a':
				$this->emit_link();
				$this->in_link = false;
				$this->link_href = '';
				$this->link_buffer = '';
				return;

			case 'ul':
			case 'ol':
				$this->flush_inline();
				array_pop( $this->list_stack );
				if ( empty( $this->list_stack ) ) {
					$this->output .= "\n\n";
				}
				return;

			case 'li':
				$this->emit_list_item();
				return;

			case 'blockquote':
				$this->flush_inline();
				$this->blockquote_depth = max( 0, $this->blockquote_depth - 1 );
				if ( 0 === $this->blockquote_depth ) {
					$this->output .= "\n";
				}
				return;

			case 'table':
				$this->emit_table();
				$this->in_table = false;
				$this->table_headers = [];
				$this->table_rows = [];
				return;

			case 'thead':
				$this->in_table_head = false;
				return;

			case 'tr':
				if ( ! $this->in_table ) {
					return;
				}
				if ( $this->row_is_header && empty( $this->table_headers ) ) {
					$this->table_headers = $this->current_row;
				} else {
					$this->table_rows[] = $this->current_row;
				}
				$this->current_row = [];
				$this->row_is_header = false;
				return;

			case 'th':
			case 'td':
				$this->current_row[] = trim( preg_replace( '/\s+/', ' ', $this->current_cell ) );
				$this->current_cell = '';
				return;
		}
	}

	private function append_inline( string $marker ): void {
		if ( $this->in_link ) {
			$this->link_buffer .= $marker;
			return;
		}

		$this->inline_buffer .= $marker;
	}

	private function emit_link(): void {
		$text = $this->link_buffer;
		$href = $this->link_href;

		if ( '' === $href || '#' === $href ) {
			$this->inline_buffer .= $text;
			return;
		}

		if ( ! $this->is_safe_url( $href ) ) {
			$this->inline_buffer .= $text;
			return;
		}

		$href = $this->escape_url_for_markdown( $href );

		$this->inline_buffer .= '[' . $text . '](' . $href . ')';
	}

	private function emit_image( WP_HTML_Processor $p ): void {
		$src = (string) $p->get_attribute( 'src' );
		$alt = (string) $p->get_attribute( 'alt' );

		if ( '' === $src ) {
			return;
		}

		if ( ! $this->is_safe_url( $src ) ) {
			return;
		}

		$alt = $this->escape_text( $alt, false );
		$src = $this->escape_url_for_markdown( $src );

		$this->inline_buffer .= '![' . $alt . '](' . $src . ')';
	}

	private function emit_pre(): void {
		$content = html_entity_decode( $this->pre_buffer, ENT_QUOTES, 'UTF-8' );
		$content = rtrim( $content, "\n" );

		$this->output .= "\n\n```" . $this->pre_language . "\n" . $content . "\n```\n\n";
	}

	private function emit_list_item(): void {
		$content = trim( $this->inline_buffer );
		$this->inline_buffer = '';

		if ( '' === $content ) {
			return;
		}

		$top = end( $this->list_stack );

		if ( false === $top ) {
			$this->output .= $content . "\n";
			return;
		}

		$depth = count( $this->list_stack ) - 1;
		$indent = str_repeat( '  ', $depth );

		if ( 'ol' === $top['type'] ) {
			$marker = $top['index'] . '. ';
			$this->list_stack[ array_key_last( $this->list_stack ) ]['index']++;
		} else {
			$marker = '- ';
		}

		$lines = explode( "\n", $content );
		$first = array_shift( $lines );
		$rendered = $indent . $marker . $first;

		foreach ( $lines as $line ) {
			$rendered .= "\n" . $indent . '  ' . $line;
		}

		$this->output .= $this->prefix_blockquote( $rendered ) . "\n";
	}

	private function emit_table(): void {
		if ( empty( $this->table_headers ) && empty( $this->table_rows ) ) {
			return;
		}

		if ( empty( $this->table_headers ) && ! empty( $this->table_rows ) ) {
			$this->table_headers = array_fill( 0, count( $this->table_rows[0] ), '' );
		}

		$column_count = count( $this->table_headers );
		$lines = [];
		$lines[] = '| ' . implode( ' | ', array_map( [ $this, 'escape_table_cell' ], $this->table_headers ) ) . ' |';
		$lines[] = '|' . str_repeat( ' --- |', $column_count );

		foreach ( $this->table_rows as $row ) {
			$row = array_pad( $row, $column_count, '' );
			$row = array_slice( $row, 0, $column_count );
			$lines[] = '| ' . implode( ' | ', array_map( [ $this, 'escape_table_cell' ], $row ) ) . ' |';
		}

		$this->output .= "\n\n" . implode( "\n", $lines ) . "\n\n";
	}

	private function escape_table_cell( string $value ): string {
		return str_replace( [ '|', "\n" ], [ '\\|', ' ' ], $value );
	}

	private function flush_inline(): void {
		if ( '' === $this->inline_buffer ) {
			return;
		}

		$content = $this->finalize_inline( $this->inline_buffer );
		$this->inline_buffer = '';

		$content = trim( $content );

		if ( '' === $content ) {
			return;
		}

		if ( ! empty( $this->list_stack ) ) {
			$this->inline_buffer = $content;
			return;
		}

		$content = $this->prefix_blockquote( $content );

		$this->output .= "\n\n" . $content . "\n\n";
	}

	private function finalize_inline( string $buffer ): string {
		return preg_replace_callback(
			'/`CODE_OPEN`(.*?)`CODE_CLOSE`/s',
			function ( $matches ) {
				return $this->render_inline_code( $matches[1] );
			},
			$buffer
		);
	}

	private function render_inline_code( string $content ): string {
		$content = preg_replace( '/\s+/', ' ', $content );

		preg_match_all( '/`+/', $content, $runs );
		$max = 0;

		foreach ( $runs[0] as $run ) {
			$max = max( $max, strlen( $run ) );
		}

		$fence = str_repeat( '`', $max + 1 );
		$pad = ( '' !== $content && ( '`' === $content[0] || '`' === substr( $content, -1 ) ) ) ? ' ' : '';

		return $fence . $pad . $content . $pad . $fence;
	}

	private function prefix_blockquote( string $content ): string {
		if ( 0 === $this->blockquote_depth ) {
			return $content;
		}

		$prefix = str_repeat( '> ', $this->blockquote_depth );
		$lines = explode( "\n", $content );

		return implode( "\n", array_map(
			function ( $line ) use ( $prefix ) {
				return $prefix . $line;
			},
			$lines
		) );
	}

	private function escape_text( string $text, bool $in_code ): string {
		$text = html_entity_decode( $text, ENT_QUOTES, 'UTF-8' );

		if ( $in_code ) {
			return $text;
		}

		$replacements = [];

		foreach ( self::ESCAPABLE_MARKDOWN_CHARS as $char ) {
			$replacements[ $char ] = '\\' . $char;
		}

		return strtr( $text, $replacements );
	}

	private function escape_url_for_markdown( string $url ): string {
		return strtr( $url, [
			' ' => '%20',
			'(' => '%28',
			')' => '%29',
			'<' => '%3C',
			'>' => '%3E',
		] );
	}

	private function is_safe_url( string $url ): bool {
		$url = trim( $url );

		if ( '' === $url ) {
			return false;
		}

		if ( '#' === $url[0] || '/' === $url[0] || '?' === $url[0] ) {
			return true;
		}

		$lower = strtolower( $url );

		foreach ( self::SAFE_DATA_PREFIXES as $prefix ) {
			if ( 0 === strpos( $lower, $prefix ) ) {
				return true;
			}
		}

		if ( ! preg_match( '#^([a-z][a-z0-9+.\-]*):#i', $url, $m ) ) {
			return true;
		}

		return in_array( strtolower( $m[1] ), self::SAFE_URL_SCHEMES, true );
	}
}
