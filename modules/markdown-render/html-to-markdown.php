<?php
namespace Elementor\Modules\MarkdownRender;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Html_To_Markdown {

	public static function convert( string $html ): string {
		if ( empty( $html ) ) {
			return '';
		}

		$html = self::normalize_html( $html );

		$html = self::convert_headings( $html );
		$html = self::convert_bold( $html );
		$html = self::convert_italic( $html );
		$html = self::convert_links( $html );
		$html = self::convert_images( $html );
		$html = self::convert_lists( $html );
		$html = self::convert_blockquotes( $html );
		$html = self::convert_code( $html );
		$html = self::convert_pre( $html );
		$html = self::convert_line_breaks( $html );
		$html = self::convert_paragraphs( $html );
		$html = self::convert_horizontal_rules( $html );

		$html = wp_strip_all_tags( $html );

		$html = html_entity_decode( $html, ENT_QUOTES, 'UTF-8' );

		$html = preg_replace( "/\n{3,}/", "\n\n", $html );

		return trim( $html );
	}

	private static function normalize_html( string $html ): string {
		$html = preg_replace( '/\r\n?/', "\n", $html );
		$html = preg_replace( '#<script(.*?)>(.*?)</script>#is', '', $html );
		$html = preg_replace( '#<style(.*?)>(.*?)</style>#is', '', $html );
		$html = str_replace( "\xE2\x80\x8B", '', $html );

		return $html;
	}

	private static function convert_headings( string $html ): string {
		for ( $i = 6; $i >= 1; $i-- ) {
			$prefix = str_repeat( '#', $i );
			$html = preg_replace_callback(
				"#<h{$i}[^>]*>(.*?)</h{$i}>#is",
				function ( $matches ) use ( $prefix ) {
					return "\n\n{$prefix} " . \Elementor\Utils::html_to_plain_text( $matches[1] ) . "\n\n";
				},
				$html
			);
		}

		return $html;
	}

	private static function convert_bold( string $html ): string {
		$html = preg_replace( '#<(?:strong|b)[^>]*>(.*?)</(?:strong|b)>#is', '**$1**', $html );

		return $html;
	}

	private static function convert_italic( string $html ): string {
		$html = preg_replace( '#<(?:em|i)[^>]*>(.*?)</(?:em|i)>#is', '*$1*', $html );

		return $html;
	}

	private static function convert_links( string $html ): string {
		$html = preg_replace_callback(
			'#<a[^>]+href=["\']([^"\']*)["\'][^>]*>(.*?)</a>#is',
			function ( $matches ) {
				$url = $matches[1];
				$text = $matches[2];

				if ( empty( $url ) || '#' === $url ) {
					return $text;
				}

				return '[' . $text . '](' . $url . ')';
			},
			$html
		);

		return $html;
	}

	private static function convert_images( string $html ): string {
		$html = preg_replace_callback(
			'#<img[^>]+>#is',
			function ( $matches ) {
				$tag = $matches[0];
				$src = '';
				$alt = '';

				if ( preg_match( '/src=["\']([^"\']*)["\']/', $tag, $src_match ) ) {
					$src = $src_match[1];
				}

				if ( preg_match( '/alt=["\']([^"\']*)["\']/', $tag, $alt_match ) ) {
					$alt = $alt_match[1];
				}

				if ( empty( $src ) ) {
					return '';
				}

				return '![' . $alt . '](' . $src . ')';
			},
			$html
		);

		return $html;
	}

	private static function convert_lists( string $html ): string {
		$html = preg_replace_callback(
			'#<ol[^>]*>(.*?)</ol>#is',
			function ( $matches ) {
				$items = [];
				$counter = 1;

				preg_match_all( '#<li[^>]*>(.*?)</li>#is', $matches[1], $li_matches );

				foreach ( $li_matches[1] as $li_content ) {
					$items[] = $counter . '. ' . trim( wp_strip_all_tags( $li_content ) );
					$counter++;
				}

				return "\n\n" . implode( "\n", $items ) . "\n\n";
			},
			$html
		);

		$html = preg_replace_callback(
			'#<ul[^>]*>(.*?)</ul>#is',
			function ( $matches ) {
				$items = [];

				preg_match_all( '#<li[^>]*>(.*?)</li>#is', $matches[1], $li_matches );

				foreach ( $li_matches[1] as $li_content ) {
					$items[] = '- ' . trim( wp_strip_all_tags( $li_content ) );
				}

				return "\n\n" . implode( "\n", $items ) . "\n\n";
			},
			$html
		);

		return $html;
	}

	private static function convert_blockquotes( string $html ): string {
		$html = preg_replace_callback(
			'#<blockquote[^>]*>(.*?)</blockquote>#is',
			function ( $matches ) {
				$content = trim( wp_strip_all_tags( $matches[1] ) );
				$lines = explode( "\n", $content );
				$quoted = array_map( function ( $line ) {
					return '> ' . $line;
				}, $lines );

				return "\n\n" . implode( "\n", $quoted ) . "\n\n";
			},
			$html
		);

		return $html;
	}

	private static function convert_code( string $html ): string {
		$html = preg_replace( '#<code[^>]*>(.*?)</code>#is', '`$1`', $html );

		return $html;
	}

	private static function convert_pre( string $html ): string {
		$html = preg_replace_callback(
			'#<pre[^>]*>(.*?)</pre>#is',
			function ( $matches ) {
				$content = html_entity_decode( wp_strip_all_tags( $matches[1] ), ENT_QUOTES, 'UTF-8' );

				return "\n\n```\n" . $content . "\n```\n\n";
			},
			$html
		);

		return $html;
	}

	private static function convert_line_breaks( string $html ): string {
		$html = preg_replace( '#<br\s*/?\s*>#i', "\n", $html );

		return $html;
	}

	private static function convert_paragraphs( string $html ): string {
		$html = preg_replace( '#<p[^>]*>#i', "\n\n", $html );
		$html = preg_replace( '#</p>#i', "\n\n", $html );

		return $html;
	}

	private static function convert_horizontal_rules( string $html ): string {
		$html = preg_replace( '#<hr\s*/?\s*>#i', "\n\n---\n\n", $html );

		return $html;
	}
}
