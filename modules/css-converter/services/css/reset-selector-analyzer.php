<?php

namespace Elementor\Modules\CssConverter\Services\Css;

use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;

class Reset_Selector_Analyzer {
	private $specificity_calculator;
	private $supported_simple_selectors = [
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'p',
		'a',
		'button',
		'span',
		'div',
		'section',
		'article',
		'aside',
		'header',
		'footer',
		'main',
		'nav',
		'img',
	];

	public function __construct( Css_Specificity_Calculator $specificity_calculator ) {
		$this->specificity_calculator = $specificity_calculator;
	}

	public function analyze_element_selector_conflicts( array $css_rules ): array {
		$element_rules = $this->extract_element_selector_rules( $css_rules );
		$conflict_map = [];

		foreach ( $element_rules as $selector => $rules ) {
			$conflict_map[ $selector ] = $this->detect_conflicts_for_selector(
				$selector,
				$rules,
				$css_rules
			);
		}

		return $conflict_map;
	}

	private function extract_element_selector_rules( array $css_rules ): array {
		$element_rules = [];

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			if ( $this->is_simple_element_selector( $selector ) ) {
				if ( ! isset( $element_rules[ $selector ] ) ) {
					$element_rules[ $selector ] = [];
				}
				$element_rules[ $selector ][] = $rule;
			}
		}

		return $element_rules;
	}

	public function is_simple_element_selector( string $selector ): bool {
		$selector = trim( $selector );

		if ( ! in_array( $selector, $this->supported_simple_selectors, true ) ) {
			return false;
		}

		if ( preg_match( '/[#.\[\]:>+~\s]/', $selector ) ) {
			return false;
		}

		return true;
	}

	public function detect_conflicts_for_selector( string $selector, array $rules, array $all_rules ): array {
		$conflicts = [];

		foreach ( $all_rules as $rule ) {
			if ( $rule['selector'] === $selector ) {
				continue;
			}

			if ( $this->selector_targets_element( $rule['selector'], $selector ) ) {
				$rule_specificity = $this->specificity_calculator->calculate_specificity(
					$rule['selector'],
					$rule['important'] ?? false
				);

				$base_specificity = $this->specificity_calculator->calculate_specificity(
					$selector,
					false
				);

				if ( $rule_specificity >= $base_specificity ) {
					$conflicts[] = [
						'conflicting_selector' => $rule['selector'],
						'specificity' => $rule_specificity,
						'properties' => $this->get_overlapping_properties( $rules, [ $rule ] ),
					];
				}
			}
		}

		return $conflicts;
	}

	private function selector_targets_element( string $complex_selector, string $element ): bool {
		$clean_selector = preg_replace( '/::?[a-zA-Z][\w-]*(\([^)]*\))?/', '', $complex_selector );

		return preg_match( '/\b' . preg_quote( $element, '/' ) . '\b/', $clean_selector ) === 1;
	}

	private function get_overlapping_properties( array $rules1, array $rules2 ): array {
		$props1 = array_column( $rules1, 'property' );
		$props2 = array_column( $rules2, 'property' );

		return array_intersect( $props1, $props2 );
	}

	public function get_non_conflicting_rules( string $selector, array $rules, array $conflict_map ): array {
		if ( empty( $conflict_map[ $selector ] ) ) {
			return $rules;
		}

		$conflicting_properties = [];
		foreach ( $conflict_map[ $selector ] as $conflict ) {
			$conflicting_properties = array_merge(
				$conflicting_properties,
				$conflict['properties']
			);
		}

		return array_filter( $rules, function( $rule ) use ( $conflicting_properties ) {
			return ! in_array( $rule['property'], $conflicting_properties, true );
		} );
	}

	public function get_supported_selectors(): array {
		return $this->supported_simple_selectors;
	}
}
