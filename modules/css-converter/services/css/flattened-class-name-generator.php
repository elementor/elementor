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

	public function generate_flattened_class_name( array $parsed_selector ): string {
		$target = $this->clean_selector_part( $parsed_selector['target'] );
		$context = $parsed_selector['context'] ?? [];
		
		if ( empty( $context ) ) {
			return $target;
		}

		$context_string = $this->build_context_string( $context );
		$flattened_name = $target . self::CONTEXT_SEPARATOR . $context_string;
		
		return $this->ensure_valid_css_class_name( $flattened_name );
	}

	private function clean_selector_part( string $part ): string {
		$part = trim( $part );
		
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
