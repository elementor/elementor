<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


class Nested_Selector_Parser {

	private $specificity_calculator;

	public function __construct( $specificity_calculator = null ) {
		$this->specificity_calculator = $specificity_calculator ?: new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator();
	}

	public static function make(): self {
		return new self();
	}

	public function is_nested_selector( string $selector ): bool {
		return Css_Selector_Utils::is_nested_selector( $selector );
	}

	public function parse_nested_selector( string $selector ): ?array {
		$selector = trim( $selector );

		if ( ! $this->is_nested_selector( $selector ) ) {
			return null;
		}

		$parts = $this->extract_selector_parts( $selector );
		$target = $this->identify_target_element( $parts );
		$context = $this->extract_context_parts( $parts, $target );
		$original_specificity = $this->specificity_calculator->calculate_specificity( $selector );

		return [
			'original_selector' => $selector,
			'target' => $target,
			'context' => $context,
			'parts' => $parts,
			'specificity' => $original_specificity,
			'type' => $this->determine_selector_type( $selector ),
		];
	}

	private function has_descendant_selector( string $selector ): bool {
		return Css_Selector_Utils::has_descendant_selector( $selector );
	}

	private function has_child_selector( string $selector ): bool {
		return Css_Selector_Utils::has_child_selector( $selector );
	}

	private function extract_selector_parts( string $selector ): array {
		$selector = preg_replace( '/\s*>\s*/', ' > ', $selector );
		$selector = preg_replace( '/\s+/', ' ', $selector );

		$parts = explode( ' ', trim( $selector ) );

		$cleaned_parts = [];
		foreach ( $parts as $part ) {
			$part = trim( $part );
			if ( ! empty( $part ) && $part !== '>' ) {
				$cleaned_parts[] = $part;
			}
		}

		return $cleaned_parts;
	}

	private function identify_target_element( array $parts ): string {
		if ( empty( $parts ) ) {
			return '';
		}

		$last_part = end( $parts );

		if ( $this->has_mixed_element_and_class( $last_part ) ) {
			return $this->extract_class_from_mixed( $last_part );
		}

		if ( $this->is_element_tag( $last_part ) ) {
			return $this->convert_element_tag_to_pseudo_class( $last_part );
		}

		return $last_part;
	}

	private function convert_element_tag_to_pseudo_class( string $element_tag ): string {
		return '.' . $element_tag;
	}

	private function extract_context_parts( array $parts, string $target ): array {
		$context = $parts;

		$last_key = array_key_last( $context );
		if ( isset( $context[ $last_key ] ) ) {
			unset( $context[ $last_key ] );
		}

		return array_values( $context );
	}

	private function has_mixed_element_and_class( string $part ): bool {
		return preg_match( '/^[a-zA-Z][a-zA-Z0-9]*\.[a-zA-Z]/', $part );
	}

	private function extract_class_from_mixed( string $part ): string {
		if ( preg_match( '/\.([a-zA-Z][a-zA-Z0-9_-]*)/', $part, $matches ) ) {
			return '.' . $matches[1];
		}

		return $part;
	}

	private function determine_selector_type( string $selector ): string {
		if ( strpos( $selector, '>' ) !== false ) {
			return 'child';
		}

		return 'descendant';
	}

	private function is_element_tag( string $part ): bool {
		return Css_Selector_Utils::is_element_tag( $part );
	}
}
