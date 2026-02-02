<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Flattened_Class_Name_Generator {

	private const CONTEXT_SEPARATOR = '--';
	private const MAX_CLASS_NAME_LENGTH = 50;

	public static function make(): self {
		return new self();
	}

	public function generate_flattened_class_name( array $parsed_selector, array $existing_names = [] ): string {
		$target = $this->clean_selector_part( $parsed_selector['target'] );
		$context = $parsed_selector['context'] ?? [];

		if ( empty( $context ) ) {
			return $target;
		}

		$context_string = $this->build_context_string( $context );
		$base_name = $target . self::CONTEXT_SEPARATOR . $context_string;
		$base_name = $this->ensure_valid_css_class_name( $base_name );

		// CRITICAL FIX: Implement proper duplicate handling with numeric indices
		// .first .second → second--first
		// .first > .second → second--first-2 (if second--first already exists)
		return $this->generate_unique_class_name( $base_name, $existing_names );
	}

	private function generate_unique_class_name( string $base_name, array $existing_names ): string {
		// If no collision, use base name
		if ( ! in_array( $base_name, $existing_names, true ) ) {
			return $base_name;
		}

		// Find next available numeric suffix
		$counter = 2; // Start with -2 (base name is implicit -1)
		do {
			$candidate_name = $base_name . '-' . $counter;
			$counter++;
		} while ( in_array( $candidate_name, $existing_names, true ) );

		return $candidate_name;
	}

	private function clean_selector_part( string $part ): string {
		$part = trim( $part );

		// Remove HTML tags from selector parts (e.g., "body.loaded" -> ".loaded")
		$part = $this->remove_html_tags_from_selector( $part );

		// Remove leading dots and hashes
		$part = ltrim( $part, '.#' );

		// Convert to lowercase and replace invalid characters
		$part = strtolower( $part );
		$part = preg_replace( '/[^a-z0-9_-]/', '-', $part );

		// Remove multiple consecutive dashes
		$part = preg_replace( '/-+/', '-', $part );

		// Remove leading/trailing dashes
		$part = trim( $part, '-' );

		return $part;
	}

	private function remove_html_tags_from_selector( string $selector ): string {
		$html_tags = [
			'html',
			'body',
			'div',
			'span',
			'p',
			'a',
			'img',
			'ul',
			'ol',
			'li',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'section',
			'article',
			'aside',
			'header',
			'footer',
			'nav',
			'main',
			'form',
			'input',
			'button',
			'select',
			'textarea',
			'label',
			'table',
			'tr',
			'td',
			'th',
			'thead',
			'tbody',
			'tfoot',
		];

		foreach ( $html_tags as $tag ) {
			$selector = preg_replace( '/^' . $tag . '(?=[.#:]|$)/i', '', $selector );
		}

		return $selector;
	}

	private function build_context_string( array $context ): string {
		$cleaned_context = [];

		foreach ( $context as $part ) {
			$cleaned_part = $this->clean_selector_part( $part );
			if ( ! empty( $cleaned_part ) ) {
				$cleaned_context[] = $cleaned_part;
			}
		}

		return implode( '-', $cleaned_context );
	}

	private function ensure_valid_css_class_name( string $class_name ): string {
		// Ensure it starts with a letter or underscore
		if ( ! preg_match( '/^[a-zA-Z_]/', $class_name ) ) {
			$class_name = 'g-' . $class_name;
		}

		// Truncate if too long
		if ( strlen( $class_name ) > self::MAX_CLASS_NAME_LENGTH ) {
			$class_name = substr( $class_name, 0, self::MAX_CLASS_NAME_LENGTH );
			$class_name = rtrim( $class_name, '-' );
		}

		return $class_name;
	}
}
