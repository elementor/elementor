<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reset Style Detector
 *
 * Detects and classifies CSS element selectors for reset style processing.
 * Integrates with the unified-atomic mapper approach.
 *
 * Based on: 2-RESET-CLASSES.md Approach 6 (Direct Widget Styling for Simple Element Selectors)
 */
class Reset_Style_Detector {

	/**
	 * Simple element selectors supported for direct widget styling
	 */
	private $supported_simple_selectors = [
		// Headings
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',

		// Text elements
		'p',
		'span',
		'a',

		// Containers
		'div',
		'section',
		'article',
		'aside',
		'header',
		'footer',
		'main',
		'nav',

		// Interactive
		'button',

		// Media
		'img',

		// Lists
		'ul',
		'ol',
		'li',

		// Tables
		'table',
		'thead',
		'tbody',
		'tfoot',
		'tr',
		'th',
		'td',

		// Forms
		'form',
		'input',
		'textarea',
		'select',
		'label',
		'fieldset',
		'legend',

		// Special
		'body',
		'html',
	];

	/**
	 * HTML tag to atomic widget type mapping
	 */
	private $tag_to_widget_mapping = [
		'h1' => 'e-heading',
		'h2' => 'e-heading',
		'h3' => 'e-heading',
		'h4' => 'e-heading',
		'h5' => 'e-heading',
		'h6' => 'e-heading',
		'p' => 'e-paragraph',
		'a' => 'e-button',
		'button' => 'e-button',
		'span' => 'e-paragraph',
		'div' => 'e-flexbox',
		'section' => 'e-flexbox',
		'article' => 'e-flexbox',
		'aside' => 'e-flexbox',
		'header' => 'e-flexbox',
		'footer' => 'e-flexbox',
		'main' => 'e-flexbox',
		'nav' => 'e-flexbox',
		'img' => 'e-image',
		'ul' => 'e-flexbox',
		'ol' => 'e-flexbox',
		'li' => 'e-paragraph',
	];

	private $specificity_calculator;

	public function __construct( Css_Specificity_Calculator $specificity_calculator ) {
		$this->specificity_calculator = $specificity_calculator;
	}

	/**
	 * Extract element selector rules from CSS rules array
	 *
	 * @param array $css_rules All CSS rules
	 * @return array Element selector rules grouped by selector
	 */
	public function extract_element_selector_rules( array $css_rules ): array {
		$element_rules = [];

		// Log first 10 selectors to see what we're working with
		$sample_selectors = [];
		for ( $i = 0; $i < min( 10, count( $css_rules ) ); $i++ ) {
			$sample_selectors[] = $css_rules[ $i ]['selector'] ?? 'unknown';
		}

		foreach ( $css_rules as $rule ) {
			$selector = trim( $rule['selector'] ?? '' );

			// Handle comma-separated selectors (e.g., "h1, h2, h3, p, div")
			if ( strpos( $selector, ',' ) !== false ) {
				$individual_selectors = array_map( 'trim', explode( ',', $selector ) );

				foreach ( $individual_selectors as $individual_selector ) {
					$is_simple = $this->is_simple_element_selector( $individual_selector );

					if ( $is_simple ) {
						if ( ! isset( $element_rules[ $individual_selector ] ) ) {
							$element_rules[ $individual_selector ] = [];
						}

						// Create a new rule for this individual selector
						$individual_rule = $rule;
						$individual_rule['selector'] = $individual_selector;
						$element_rules[ $individual_selector ][] = $individual_rule;
					}
				}
			} else {
				// Single selector - use existing logic
				if ( $this->is_element_selector( $selector ) ) {
					if ( ! isset( $element_rules[ $selector ] ) ) {
						$element_rules[ $selector ] = [];
					}

					$element_rules[ $selector ][] = $rule;
				}
			}
		}

		return $element_rules;
	}

	/**
	 * Check if a selector is an element selector (simple or complex)
	 *
	 * @param string $selector CSS selector
	 * @return bool True if element selector
	 */
	public function is_element_selector( string $selector ): bool {
		$selector = trim( $selector );

		// FIXED: ONLY accept simple element selectors (h1, p, div, etc.)
		// NO combinations like .first p, div.class, p > span, etc.
		// Reset styles should ONLY apply to pure element selectors
		return $this->is_simple_element_selector( $selector );
	}

	/**
	 * Check if selector is a simple element selector (h1, p, div, etc.)
	 *
	 * @param string $selector CSS selector
	 * @return bool True if simple element selector
	 */
	public function is_simple_element_selector( string $selector ): bool {
		$selector = trim( $selector );

		// Must be ONLY an element name (no classes, IDs, pseudo-classes, combinators)
		if ( ! in_array( $selector, $this->supported_simple_selectors, true ) ) {
			return false;
		}

		// Verify no additional selectors or combinators
		if ( preg_match( '/[#.\[\]:>+~\s]/', $selector ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Check if selector contains element names (for complex selectors)
	 *
	 * @param string $selector CSS selector
	 * @return bool True if contains element names
	 */
	private function contains_element_names( string $selector ): bool {
		// Remove pseudo-elements and pseudo-classes for matching
		$clean_selector = preg_replace( '/::?[a-zA-Z][\w-]*(\([^)]*\))?/', '', $selector );

		// Check if any supported element names appear as whole words
		// BUT exclude matches that are part of class names (after a dot)
		foreach ( $this->supported_simple_selectors as $element ) {
			// FIXED: Don't match element names that are part of class names
			// Pattern explanation:
			// - (?<!\.) = negative lookbehind, not preceded by a dot
			// - \b = word boundary
			// - element name
			// - \b = word boundary
			// - (?![a-zA-Z0-9_-]) = negative lookahead, not followed by class name characters
			$pattern = '/(?<!\.)(?<![a-zA-Z0-9_-])\b' . preg_quote( $element, '/' ) . '\b(?![a-zA-Z0-9_-])/';
			if ( preg_match( $pattern, $clean_selector ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Analyze conflicts for element selector rules
	 *
	 * @param array $element_rules Element rules grouped by selector
	 * @param array $all_css_rules All CSS rules for conflict detection
	 * @return array Conflict analysis results
	 */
	public function analyze_element_selector_conflicts( array $element_rules, array $all_css_rules ): array {
		$conflict_analysis = [];

		foreach ( $element_rules as $selector => $rules ) {
			$conflict_analysis[ $selector ] = $this->detect_conflicts_for_selector(
				$selector,
				$rules,
				$all_css_rules
			);
		}

		return $conflict_analysis;
	}

	/**
	 * Detect conflicts for a specific element selector
	 *
	 * @param string $selector Element selector
	 * @param array  $rules Rules for this selector
	 * @param array  $all_rules All CSS rules
	 * @return array Conflict information
	 */
	private function detect_conflicts_for_selector( string $selector, array $rules, array $all_rules ): array {
		$conflicts = [];
		$properties = $this->extract_properties_from_rules( $rules );

		foreach ( $all_rules as $rule ) {
			// Skip the rule itself
			if ( ( $rule['selector'] ?? '' ) === $selector ) {
				continue;
			}

			// Check if this rule targets the same element
			if ( $this->selector_targets_element( $rule['selector'] ?? '', $selector ) ) {
				$rule_specificity = $this->specificity_calculator->calculate_specificity(
					$rule['selector'] ?? '',
					$rule['important'] ?? false
				);

				$base_specificity = $this->specificity_calculator->calculate_specificity(
					$selector,
					false
				);

				// If other selector has higher or equal specificity, it's a potential conflict
				if ( $rule_specificity >= $base_specificity ) {
					$overlapping_properties = $this->get_overlapping_properties(
						$properties,
						$this->extract_properties_from_rules( [ $rule ] )
					);

					if ( ! empty( $overlapping_properties ) ) {
						$conflicts[] = [
							'conflicting_selector' => $rule['selector'] ?? '',
							'specificity' => $rule_specificity,
							'base_specificity' => $base_specificity,
							'overlapping_properties' => $overlapping_properties,
							'rule' => $rule,
						];
					}
				}
			}
		}

		return [
			'has_conflicts' => ! empty( $conflicts ),
			'conflict_count' => count( $conflicts ),
			'conflicts' => $conflicts,
			'can_apply_directly' => empty( $conflicts ),
		];
	}

	/**
	 * Check if a complex selector targets a specific element
	 *
	 * @param string $complex_selector Complex CSS selector
	 * @param string $element Simple element name
	 * @return bool True if targets the element
	 */
	private function selector_targets_element( string $complex_selector, string $element ): bool {
		// Remove pseudo-elements and pseudo-classes for matching
		$clean_selector = preg_replace( '/::?[a-zA-Z][\w-]*(\([^)]*\))?/', '', $complex_selector );

		// Check for element name in selector as whole word
		return preg_match( '/\b' . preg_quote( $element, '/' ) . '\b/', $clean_selector ) === 1;
	}

	/**
	 * Extract property names from CSS rules
	 *
	 * @param array $rules CSS rules
	 * @return array Property names
	 */
	private function extract_properties_from_rules( array $rules ): array {
		$properties = [];

		foreach ( $rules as $rule ) {
			if ( isset( $rule['property'] ) ) {
				$properties[] = $rule['property'];
			}
		}

		return array_unique( $properties );
	}

	/**
	 * Get overlapping properties between two property arrays
	 *
	 * @param array $properties1 First property array
	 * @param array $properties2 Second property array
	 * @return array Overlapping properties
	 */
	private function get_overlapping_properties( array $properties1, array $properties2 ): array {
		return array_intersect( $properties1, $properties2 );
	}

	/**
	 * Get non-conflicting rules for a selector
	 *
	 * @param string $selector Element selector
	 * @param array  $rules Rules for this selector
	 * @param array  $conflict_analysis Conflict analysis results
	 * @return array Non-conflicting rules
	 */
	public function get_non_conflicting_rules( string $selector, array $rules, array $conflict_analysis ): array {
		if ( empty( $conflict_analysis[ $selector ]['conflicts'] ) ) {
			// No conflicts - all rules can be applied directly
			return $rules;
		}

		$conflicting_properties = [];
		foreach ( $conflict_analysis[ $selector ]['conflicts'] as $conflict ) {
			$conflicting_properties = array_merge(
				$conflicting_properties,
				$conflict['overlapping_properties']
			);
		}

		// Return only rules that don't have conflicting properties
		return array_filter( $rules, function( $rule ) use ( $conflicting_properties ) {
			return ! in_array( $rule['property'] ?? '', $conflicting_properties, true );
		} );
	}

	/**
	 * Get atomic widget type for HTML tag
	 *
	 * @param string $html_tag HTML tag name
	 * @return string|null Atomic widget type or null if not mapped
	 */
	public function get_atomic_widget_type( string $html_tag ): ?string {
		return $this->tag_to_widget_mapping[ $html_tag ] ?? null;
	}

	/**
	 * Check if element selector can be applied directly to widgets
	 *
	 * @param string $selector Element selector
	 * @param array  $conflict_analysis Conflict analysis results
	 * @return bool True if can be applied directly
	 */
	public function can_apply_directly_to_widgets( string $selector, array $conflict_analysis ): bool {
		// Must be simple element selector
		if ( ! $this->is_simple_element_selector( $selector ) ) {
			return false;
		}

		// Must have no conflicts
		if ( ! empty( $conflict_analysis[ $selector ]['conflicts'] ) ) {
			return false;
		}

		// Must have atomic widget mapping
		if ( ! $this->get_atomic_widget_type( $selector ) ) {
			return false;
		}

		return true;
	}

	/**
	 * Get debug information about reset style detection
	 *
	 * @param array $element_rules Element rules
	 * @param array $conflict_analysis Conflict analysis
	 * @return array Debug information
	 */
	public function get_debug_info( array $element_rules, array $conflict_analysis ): array {
		$simple_selectors = [];
		$complex_selectors = [];
		$direct_applicable = [];
		$requires_css_file = [];

		foreach ( $element_rules as $selector => $rules ) {
			if ( $this->is_simple_element_selector( $selector ) ) {
				$simple_selectors[] = $selector;

				if ( $this->can_apply_directly_to_widgets( $selector, $conflict_analysis ) ) {
					$direct_applicable[] = $selector;
				} else {
					$requires_css_file[] = $selector;
				}
			} else {
				$complex_selectors[] = $selector;
				$requires_css_file[] = $selector;
			}
		}

		return [
			'total_element_selectors' => count( $element_rules ),
			'simple_selectors' => $simple_selectors,
			'complex_selectors' => $complex_selectors,
			'direct_applicable' => $direct_applicable,
			'requires_css_file' => array_unique( $requires_css_file ),
			'conflict_summary' => array_map( function( $analysis ) {
				return [
					'has_conflicts' => $analysis['has_conflicts'],
					'conflict_count' => $analysis['conflict_count'],
				];
			}, $conflict_analysis ),
		];
	}
}
