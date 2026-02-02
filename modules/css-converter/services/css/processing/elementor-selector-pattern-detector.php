<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Elementor Selector Pattern Detector
 *
 * Detects and extracts information from Elementor-specific CSS selector patterns.
 * Handles selectors with page/post ID wrappers and element-specific classes.
 */
class Elementor_Selector_Pattern_Detector {

	/**
	 * Detect if a selector contains Elementor-specific patterns
	 *
	 * @param string $selector CSS selector to analyze
	 * @return bool True if selector contains Elementor patterns
	 */
	public function is_elementor_specific_selector( string $selector ): bool {
		// Contains: .elementor-NNNN (page ID) or .elementor-element-XXXXXX (element ID)
		return preg_match( '/\.elementor-(\d+|element-[a-z0-9]+)/i', $selector );
	}

	/**
	 * Extract element IDs from Elementor class names in a selector
	 *
	 * @param string $selector CSS selector to analyze
	 * @return array Array of extracted element IDs
	 */
	public function extract_element_ids_from_selector( string $selector ): array {
		$element_ids = [];

		// Find all elementor-element-XXXXXX classes
		if ( preg_match_all( '/\.elementor-element-([a-z0-9]+)/i', $selector, $matches ) ) {
			$element_ids = array_unique( $matches[1] );
		}

		return $element_ids;
	}

	/**
	 * Extract element ID from a single Elementor class name
	 *
	 * @param string $class_name Class name to analyze
	 * @return string|null Element ID or null if not found
	 */
	public function extract_element_id_from_class( string $class_name ): ?string {
		// elementor-element-a431a3a → a431a3a
		if ( preg_match( '/^elementor-element-([a-z0-9]+)$/i', $class_name, $matches ) ) {
			return $matches[1];
		}
		return null;
	}

	/**
	 * Check if a class is a page/post ID wrapper that should be ignored
	 *
	 * @param string $class_name Class name to check
	 * @return bool True if it's a page wrapper class
	 */
	public function is_page_wrapper_class( string $class_name ): bool {
		// elementor-1140, elementor-kit-123, etc.
		return preg_match( '/^elementor-(\d+|kit-\d+)$/i', $class_name );
	}

	/**
	 * Simplify selector by removing page wrapper classes
	 *
	 * @param string $selector Original CSS selector
	 * @return string Simplified selector without page wrappers
	 */
	public function remove_page_wrapper_classes( string $selector ): string {
		// Remove .elementor-NNNN and .elementor-kit-NNNN classes
		$simplified = preg_replace( '/\.elementor-(\d+|kit-\d+)\s*/', '', $selector );

		// Clean up extra spaces
		$simplified = preg_replace( '/\s+/', ' ', trim( $simplified ) );

		return $simplified;
	}

	/**
	 * Extract the most specific part of a complex selector
	 *
	 * @param string $selector CSS selector to analyze
	 * @return string Most specific selector part
	 */
	public function extract_target_selector_part( string $selector ): string {
		// Split by descendant combinator and get the last part
		$parts = preg_split( '/\s+/', trim( $selector ) );
		$target_part = end( $parts );

		// Clean up combinators
		$target_part = preg_replace( '/[>+~]/', '', $target_part );

		return trim( $target_part );
	}

	/**
	 * Check if selector has element-specific classes that should be preserved
	 *
	 * @param string $selector CSS selector to check
	 * @return bool True if selector has element-specific classes
	 */
	public function has_element_specific_classes( string $selector ): bool {
		// Check for elementor-element-XXXXXX pattern
		return preg_match( '/\.elementor-element-[a-z0-9]+/i', $selector );
	}

	/**
	 * Check if selector is a multi-part descendant selector
	 *
	 * @param string $selector CSS selector to check
	 * @return bool True if it's a multi-part descendant selector
	 */
	public function is_multi_part_descendant_selector( string $selector ): bool {
		// Check if selector has multiple parts separated by spaces
		$parts = preg_split( '/\s+/', trim( $selector ) );
		
		if ( count( $parts ) < 2 ) {
			return false;
		}
		
		// Check if it has element-specific classes and ends with a specific class
		$has_element_specific = $this->has_element_specific_classes( $selector );
		$last_part = end( $parts );
		$ends_with_class = strpos( $last_part, '.' ) === 0;
		
		return $has_element_specific && $ends_with_class;
	}

	/**
	 * Extract descendant chain from multi-part selector
	 *
	 * @param string $selector CSS selector to analyze
	 * @return array Array with 'parent_part' and 'descendant_part'
	 */
	public function extract_descendant_chain( string $selector ): array {
		$parts = preg_split( '/\s+/', trim( $selector ) );
		
		if ( count( $parts ) < 2 ) {
			return [
				'parent_part' => $selector,
				'descendant_part' => '',
			];
		}
		
		// Find the element-specific part
		$element_specific_index = -1;
		foreach ( $parts as $index => $part ) {
			if ( preg_match( '/\.elementor-element-[a-z0-9]+/i', $part ) ) {
				$element_specific_index = $index;
				break;
			}
		}
		
		if ( $element_specific_index === -1 ) {
			// No element-specific part found, use traditional split
			$last_part = array_pop( $parts );
			return [
				'parent_part' => implode( ' ', $parts ),
				'descendant_part' => $last_part,
			];
		}
		
		// Split at element-specific part
		$parent_parts = array_slice( $parts, 0, $element_specific_index + 1 );
		$descendant_parts = array_slice( $parts, $element_specific_index + 1 );
		
		return [
			'parent_part' => implode( ' ', $parent_parts ),
			'descendant_part' => implode( ' ', $descendant_parts ),
		];
	}

	/**
	 * Get selector analysis for debugging
	 *
	 * @param string $selector CSS selector to analyze
	 * @return array Analysis results
	 */
	public function analyze_selector( string $selector ): array {
		$chain = $this->extract_descendant_chain( $selector );
		
		return [
			'original_selector' => $selector,
			'is_elementor_specific' => $this->is_elementor_specific_selector( $selector ),
			'is_multi_part_descendant' => $this->is_multi_part_descendant_selector( $selector ),
			'element_ids' => $this->extract_element_ids_from_selector( $selector ),
			'has_element_specific' => $this->has_element_specific_classes( $selector ),
			'simplified_selector' => $this->remove_page_wrapper_classes( $selector ),
			'target_part' => $this->extract_target_selector_part( $selector ),
			'parent_part' => $chain['parent_part'],
			'descendant_part' => $chain['descendant_part'],
		];
	}
}
