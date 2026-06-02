<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders a resolved v4 element tree as an indented ASCII outline.
 *
 * Consumed by dry-run responses so agents can visually sanity-check the structure
 * before saving. Operates on the post-normalize / pre-css-transform shape (the
 * verbose v4 form with $$type envelopes), and stays text-only — no markup, no
 * styling, no IO.
 */
class Element_Tree_Preview {

	private const TEXT_LIMIT = 60;
	private const URL_LIMIT = 40;
	private const ALT_LIMIT = 30;

	public static function render( array $elements ): string {
		if ( empty( $elements ) ) {
			return '(empty)';
		}

		$lines = [];
		$count = count( $elements );
		$index = 0;
		foreach ( $elements as $element ) {
			if ( is_array( $element ) ) {
				self::render_node( $element, '', $index === $count - 1, $lines, true );
			}
			$index++;
		}

		return implode( "\n", $lines );
	}

	private static function render_node( array $node, string $prefix, bool $is_last, array &$lines, bool $is_root ): void {
		$branch = $is_root ? '' : ( $is_last ? '└─ ' : '├─ ' );
		$lines[] = $prefix . $branch . self::summarize( $node );

		$children = isset( $node['elements'] ) && is_array( $node['elements'] ) ? $node['elements'] : [];
		if ( empty( $children ) ) {
			return;
		}

		$child_prefix = $prefix . ( $is_root ? '' : ( $is_last ? '   ' : '│  ' ) );
		$count = count( $children );
		$index = 0;
		foreach ( $children as $child ) {
			if ( is_array( $child ) ) {
				self::render_node( $child, $child_prefix, $index === $count - 1, $lines, false );
			}
			$index++;
		}
	}

	private static function summarize( array $node ): string {
		$type = self::type_label( $node );
		$settings = isset( $node['settings'] ) && is_array( $node['settings'] ) ? $node['settings'] : [];
		$parts = [ $type ];

		switch ( $type ) {
			case 'e-heading':
				$tag = self::scalar( $settings['tag'] ?? null );
				if ( '' !== $tag ) {
					$parts[] = $tag;
				}
				$title = self::html_v3_text( $settings['title'] ?? null );
				if ( '' !== $title ) {
					$parts[] = self::quote( $title );
				}
				break;

			case 'e-paragraph':
				$text = self::html_v3_text( $settings['paragraph'] ?? null );
				if ( '' !== $text ) {
					$parts[] = self::quote( $text );
				}
				break;

			case 'e-button':
				$text = self::html_v3_text( $settings['text'] ?? null );
				if ( '' !== $text ) {
					$parts[] = self::quote( $text );
				}
				$url = self::link_destination( $settings['link'] ?? null );
				if ( '' !== $url ) {
					$parts[] = '→ ' . self::truncate( $url, self::URL_LIMIT );
				}
				break;

			case 'e-image':
				$parts[] = self::image_summary( $settings['image'] ?? null );
				$url = self::link_destination( $settings['link'] ?? null );
				if ( '' !== $url ) {
					$parts[] = '→ ' . self::truncate( $url, self::URL_LIMIT );
				}
				break;

			case 'e-svg':
				$parts[] = self::svg_summary( $settings['svg'] ?? null );
				$url = self::link_destination( $settings['link'] ?? null );
				if ( '' !== $url ) {
					$parts[] = '→ ' . self::truncate( $url, self::URL_LIMIT );
				}
				break;
		}

		$classes = self::classes_summary( $settings['classes'] ?? null );
		if ( '' !== $classes ) {
			$parts[] = '(cls: ' . $classes . ')';
		}

		return implode( ' ', $parts );
	}

	private static function type_label( array $node ): string {
		if ( isset( $node['widgetType'] ) && is_string( $node['widgetType'] ) && '' !== $node['widgetType'] ) {
			return $node['widgetType'];
		}
		if ( isset( $node['elType'] ) && is_string( $node['elType'] ) && '' !== $node['elType'] ) {
			return $node['elType'];
		}
		return '?';
	}

	private static function scalar( $envelope ): string {
		if ( is_array( $envelope ) && isset( $envelope['value'] ) ) {
			$value = $envelope['value'];
			if ( is_string( $value ) || is_numeric( $value ) ) {
				return (string) $value;
			}
		}
		return '';
	}

	private static function html_v3_text( $envelope ): string {
		if ( ! is_array( $envelope ) || ! isset( $envelope['value'] ) ) {
			return '';
		}
		$value = $envelope['value'];
		$content = $value['content']['value'] ?? null;
		if ( ! is_string( $content ) ) {
			return '';
		}
		return self::truncate( trim( wp_strip_all_tags( $content ) ), self::TEXT_LIMIT );
	}

	private static function link_destination( $envelope ): string {
		if ( ! is_array( $envelope ) || ! isset( $envelope['value'] ) ) {
			return '';
		}
		$destination = $envelope['value']['destination']['value'] ?? null;
		return is_string( $destination ) ? $destination : '';
	}

	private static function image_summary( $envelope ): string {
		if ( ! is_array( $envelope ) || ! isset( $envelope['value'] ) ) {
			return '(no src)';
		}

		$value = $envelope['value'];
		$src_value = $value['src']['value'] ?? null;
		$size = self::scalar( $value['size'] ?? null );
		$bits = [];

		if ( is_array( $src_value ) ) {
			$id_value = $src_value['id']['value'] ?? null;
			if ( is_numeric( $id_value ) && (int) $id_value > 0 ) {
				$bits[] = '#' . (int) $id_value;
			} else {
				$url_value = $src_value['url']['value'] ?? null;
				if ( is_string( $url_value ) && '' !== $url_value ) {
					$bits[] = self::truncate( $url_value, self::URL_LIMIT );
				}
			}

			$alt_value = $src_value['alt']['value'] ?? null;
			if ( is_string( $alt_value ) && '' !== $alt_value ) {
				$bits[] = 'alt=' . self::quote( self::truncate( $alt_value, self::ALT_LIMIT ) );
			}
		}

		if ( '' !== $size ) {
			$bits[] = 'size=' . $size;
		}

		return empty( $bits ) ? '(no src)' : implode( ' ', $bits );
	}

	private static function svg_summary( $envelope ): string {
		if ( ! is_array( $envelope ) || ! isset( $envelope['value'] ) ) {
			return '(no src)';
		}

		$value = $envelope['value'];
		$id_value = $value['id']['value'] ?? null;
		if ( is_numeric( $id_value ) && (int) $id_value > 0 ) {
			return '#' . (int) $id_value;
		}

		$url_value = $value['url']['value'] ?? null;
		if ( is_string( $url_value ) && '' !== $url_value ) {
			return self::truncate( $url_value, self::URL_LIMIT );
		}

		return '(no src)';
	}

	private static function classes_summary( $envelope ): string {
		if ( ! is_array( $envelope ) || ! isset( $envelope['value'] ) ) {
			return '';
		}
		$classes = $envelope['value'];
		if ( ! is_array( $classes ) ) {
			return '';
		}
		$classes = array_values( array_filter( $classes, 'is_string' ) );
		return empty( $classes ) ? '' : implode( ', ', $classes );
	}

	private static function quote( string $text ): string {
		return '"' . $text . '"';
	}

	private static function truncate( string $text, int $limit ): string {
		if ( $limit <= 1 || strlen( $text ) <= $limit ) {
			return $text;
		}
		return substr( $text, 0, $limit - 1 ) . '…';
	}
}
