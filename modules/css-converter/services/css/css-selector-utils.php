<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Selector_Utils {
	const HTML_ELEMENTS = [
		'div',
		'span',
		'p',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'a',
		'img',
		'ul',
		'ol',
		'li',
		'nav',
		'header',
		'footer',
		'section',
		'article',
		'aside',
		'main',
		'button',
		'input',
		'form',
		'table',
		'tr',
		'td',
		'th',
		'tbody',
		'thead',
		'strong',
		'em',
		'b',
		'i',
		'small',
		'code',
		'pre',
	];

	public static function is_element_tag( string $part ): bool {
		$part = trim( $part );

		if ( 0 === strpos( $part, '.' ) || 0 === strpos( $part, '#' ) ) {
			return false;
		}

		if ( preg_match( '/^([a-z][a-z0-9]*)$/i', $part, $matches ) ) {
			$element = strtolower( $matches[1] );
			return in_array( $element, self::HTML_ELEMENTS, true );
		}

		return false;
	}

	public static function extract_class_name( string $selector ): ?string {
		$trimmed = trim( $selector );
		if ( preg_match( '/^\.([a-zA-Z0-9_-]+)$/', $trimmed, $matches ) ) {
			return $matches[1];
		}
		return null;
	}

	public static function extract_all_class_names( string $selector ): array {
		if ( preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $selector, $matches ) ) {
			return $matches[1];
		}
		return [];
	}

	public static function is_nested_selector( string $selector ): bool {
		if ( preg_match( '/\s(?![^()]*\)|[^\[]*\]|[^"]*")/', $selector ) ) {
			return true;
		}
		if ( preg_match( '/>(?![^()]*\)|[^\[]*\]|[^"]*")/', $selector ) ) {
			return true;
		}
		return false;
	}

	public static function clean_selector_part( string $part ): string {
		$part = trim( $part );
		$part = ltrim( $part, '.' );
		$part = preg_replace( '/[^a-zA-Z0-9_-]/', '', $part );
		return $part;
	}
}
