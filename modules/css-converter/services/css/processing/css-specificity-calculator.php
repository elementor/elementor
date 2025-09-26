<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Specificity_Calculator {
	
	const IMPORTANT_WEIGHT = 10000;
	const INLINE_WEIGHT = 1000;
	const ID_WEIGHT = 100;
	const CLASS_WEIGHT = 10;
	const ELEMENT_WEIGHT = 1;

	public function calculate_specificity( $selector, $is_important = false, $is_inline = false ) {
		$specificity = 0;

		// !important declarations get highest priority (HVV + user requirement)
		if ( $is_important ) {
			$specificity += self::IMPORTANT_WEIGHT;
		}

		// Inline styles get high priority (but lower than !important)
		if ( $is_inline ) {
			$specificity += self::INLINE_WEIGHT;
			return $specificity; // Inline styles don't need selector parsing
		}

		// Parse selector for specificity calculation
		$specificity += $this->parse_selector_specificity( $selector );

		return $specificity;
	}

	private function parse_selector_specificity( $selector ) {
		$specificity = 0;
		
		// Clean up selector - remove pseudo-elements and pseudo-classes for basic calculation
		$clean_selector = $this->clean_selector( $selector );

		// Count IDs (#id)
		$id_count = preg_match_all( '/#[a-zA-Z][\w-]*/', $clean_selector );
		$specificity += $id_count * self::ID_WEIGHT;

		// Count classes (.class), attributes ([attr]), and pseudo-classes (:hover)
		$class_count = preg_match_all( '/\.[a-zA-Z][\w-]*/', $clean_selector );
		$attr_count = preg_match_all( '/\[[^\]]*\]/', $clean_selector );
		$pseudo_class_count = preg_match_all( '/:[a-zA-Z][\w-]*(?!\()/', $clean_selector );
		$specificity += ( $class_count + $attr_count + $pseudo_class_count ) * self::CLASS_WEIGHT;

		// Count elements (tag names) and pseudo-elements (::before)
		$element_count = $this->count_elements( $clean_selector );
		$pseudo_element_count = preg_match_all( '/::[a-zA-Z][\w-]*/', $clean_selector );
		$specificity += ( $element_count + $pseudo_element_count ) * self::ELEMENT_WEIGHT;

		return $specificity;
	}

	private function clean_selector( $selector ) {
		// Remove strings and comments that might contain selector-like patterns
		$selector = preg_replace( '/["\'][^"\']*["\']/', '', $selector );
		$selector = preg_replace( '/\/\*.*?\*\//', '', $selector );
		
		// Remove pseudo-element content for cleaner parsing
		$selector = preg_replace( '/::?[a-zA-Z][\w-]*(\([^)]*\))?/', '', $selector );
		
		return trim( $selector );
	}

	private function count_elements( $selector ) {
		// Split by combinators and count actual element names
		$parts = preg_split( '/[\s>+~]+/', $selector );
		$element_count = 0;

		foreach ( $parts as $part ) {
			$part = trim( $part );
			if ( empty( $part ) ) {
				continue;
			}

			// Remove IDs, classes, and attributes to get the element name
			$element_part = preg_replace( '/[#.][\w-]*|\[[^\]]*\]/', '', $part );
			$element_part = trim( $element_part );

			// If there's something left and it's not a pseudo-class/element, it's an element
			if ( ! empty( $element_part ) && ! preg_match( '/^:/', $element_part ) ) {
				$element_count++;
			}
		}

		return $element_count;
	}

	public function compare_specificity( $specificity_a, $specificity_b ) {
		if ( $specificity_a > $specificity_b ) {
			return 1;
		} elseif ( $specificity_a < $specificity_b ) {
			return -1;
		}
		return 0;
	}

	public function get_winning_style( $styles ) {
		if ( empty( $styles ) ) {
			return null;
		}

		$winning_style = null;
		$highest_specificity = -1;
		$latest_order = -1;

		foreach ( $styles as $style ) {
			$specificity = $style['specificity'] ?? 0;
			$order = $style['order'] ?? 0;

			// Higher specificity wins, or later order if specificity is equal
			if ( $specificity > $highest_specificity || 
				 ( $specificity === $highest_specificity && $order > $latest_order ) ) {
				$winning_style = $style;
				$highest_specificity = $specificity;
				$latest_order = $order;
			}
		}

		return $winning_style;
	}

	public function categorize_css_rule( $selector, $property, $value, $is_important = false ) {
		$specificity = $this->calculate_specificity( $selector, $is_important );
		
		// Determine rule category based on selector type
		$category = $this->determine_rule_category( $selector );
		
		return [
			'selector' => $selector,
			'property' => $property,
			'value' => $value,
			'important' => $is_important,
			'specificity' => $specificity,
			'category' => $category,
			'target' => $this->determine_target_type( $category, $specificity ),
		];
	}

	private function determine_rule_category( $selector ) {
		// Check for ID selectors
		if ( preg_match( '/#[a-zA-Z][\w-]*/', $selector ) ) {
			return 'id';
		}

		// Check for class selectors
		if ( preg_match( '/\.[a-zA-Z][\w-]*/', $selector ) ) {
			return 'class';
		}

		// Check for attribute selectors
		if ( preg_match( '/\[[^\]]*\]/', $selector ) ) {
			return 'attribute';
		}

		// Check for pseudo-classes
		if ( preg_match( '/:[a-zA-Z][\w-]*/', $selector ) ) {
			return 'pseudo-class';
		}

		// Default to element selector
		return 'element';
	}

	private function determine_target_type( $category, $specificity ) {
		// HVV Decision: Inline > ID > Class > Element priority
		// High specificity (ID, inline) goes to widget props
		// Lower specificity (class, element) goes to global classes

		if ( $specificity >= self::INLINE_WEIGHT ) {
			return 'widget_props'; // Inline styles
		}

		if ( $specificity >= self::ID_WEIGHT ) {
			return 'widget_props'; // ID selectors
		}

		if ( $category === 'class' ) {
			return 'global_classes'; // Class selectors
		}

		return 'element_styles'; // Element selectors (lowest priority)
	}

	public function parse_css_declarations( $css_block ) {
		$declarations = [];
		$rules = explode( ';', $css_block );

		foreach ( $rules as $rule ) {
			$rule = trim( $rule );
			if ( empty( $rule ) ) {
				continue;
			}

			$parts = explode( ':', $rule, 2 );
			if ( count( $parts ) !== 2 ) {
				continue;
			}

			$property = trim( $parts[0] );
			$value = trim( $parts[1] );

			// Check for !important
			$is_important = false;
			if ( strpos( $value, '!important' ) !== false ) {
				$value = trim( str_replace( '!important', '', $value ) );
				$is_important = true;
			}

			$declarations[] = [
				'property' => $property,
				'value' => $value,
				'important' => $is_important,
			];
		}

		return $declarations;
	}

	public function get_specificity_breakdown( $specificity ) {
		$breakdown = [
			'important' => 0,
			'inline' => 0,
			'ids' => 0,
			'classes' => 0,
			'elements' => 0,
			'total' => $specificity,
		];

		if ( $specificity >= self::IMPORTANT_WEIGHT ) {
			$breakdown['important'] = 1;
			$specificity -= self::IMPORTANT_WEIGHT;
		}

		if ( $specificity >= self::INLINE_WEIGHT ) {
			$breakdown['inline'] = 1;
			$specificity -= self::INLINE_WEIGHT;
		}

		$breakdown['ids'] = intval( $specificity / self::ID_WEIGHT );
		$specificity %= self::ID_WEIGHT;

		$breakdown['classes'] = intval( $specificity / self::CLASS_WEIGHT );
		$specificity %= self::CLASS_WEIGHT;

		$breakdown['elements'] = intval( $specificity / self::ELEMENT_WEIGHT );

		return $breakdown;
	}

	public function format_specificity( $specificity ) {
		$breakdown = $this->get_specificity_breakdown( $specificity );
		
		$parts = [];
		if ( $breakdown['important'] ) {
			$parts[] = '!important';
		}
		if ( $breakdown['inline'] ) {
			$parts[] = 'inline';
		}
		
		$specificity_notation = sprintf( 
			'(%d,%d,%d,%d)', 
			$breakdown['important'],
			$breakdown['ids'], 
			$breakdown['classes'], 
			$breakdown['elements'] 
		);
		
		if ( ! empty( $parts ) ) {
			return implode( ' + ', $parts ) . ' ' . $specificity_notation;
		}
		
		return $specificity_notation;
	}
}
