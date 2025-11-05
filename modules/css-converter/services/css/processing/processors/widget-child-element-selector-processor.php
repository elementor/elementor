<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;
use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Child_Element_Selector_Processor implements Css_Processor_Interface {

	private $property_converter;
	private $specificity_calculator;

	public function __construct( Css_Property_Conversion_Service $property_converter ) {
		$this->property_converter = $property_converter;
		$this->specificity_calculator = new Css_Specificity_Calculator();
	}

	public function get_processor_name(): string {
		return 'widget-child-element-selector';
	}

	public function get_priority(): int {
		return 10; // BEFORE widget-class (11) to process child element selectors first
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		return ! empty( $css_rules ) && ! empty( $widgets );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();
		$unified_style_manager = $context->get_metadata( 'unified_style_manager' );

		// Create unified_style_manager if it doesn't exist
		if ( ! $unified_style_manager ) {
			$unified_style_manager = new \Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager(
				new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator(),
				$this->property_converter
			);
			$context->set_metadata( 'unified_style_manager', $unified_style_manager );
		}

		if ( empty( $css_rules ) || empty( $widgets ) ) {
			return $context;
		}

		// Extract child element selectors grouped by element tag
		$child_element_rules = $this->extract_child_element_selectors( $css_rules );

		if ( empty( $child_element_rules ) ) {
			return $context;
		}

		$total_selectors_processed = 0;
		$total_styles_applied = 0;

		// Process each element tag group
		foreach ( $child_element_rules as $element_tag => $rules ) {
			$styles_applied = $this->apply_child_element_styles_atomically(
				$element_tag,
				$rules,
				$widgets,
				$unified_style_manager
			);

			$total_selectors_processed += count( $rules );
			$total_styles_applied += $styles_applied;
		}

		// Remove processed rules from css_rules to prevent duplicate processing
		$remaining_rules = $this->remove_processed_child_element_rules( $css_rules, $child_element_rules );
		$context->set_metadata( 'css_rules', $remaining_rules );

		// Update statistics
		$context->add_statistic( 'widget_child_element_selectors_processed', $total_selectors_processed );
		$context->add_statistic( 'widget_child_element_styles_applied', $total_styles_applied );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'widget_child_element_selectors_processed',
			'widget_child_element_styles_applied',
		];
	}

	private function extract_child_element_selectors( array $css_rules ): array {
		$child_element_rules = [];

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			if ( ! $this->is_child_element_selector( $selector ) ) {
				continue;
			}

			$element_tag = $this->extract_child_element_tag( $selector );

			if ( ! $element_tag ) {
				continue;
			}

			if ( ! isset( $child_element_rules[ $element_tag ] ) ) {
				$child_element_rules[ $element_tag ] = [];
			}

			$child_element_rules[ $element_tag ][] = $rule;
		}

		return $child_element_rules;
	}

	private function is_child_element_selector( string $selector ): bool {
		// Pattern: .any-class element-tag
		// Examples: .widget img, .container p, .box button
		// Must end with a simple element tag (no classes, IDs, pseudo-selectors)
		$result = preg_match( '/\.[a-zA-Z0-9_-]+\s+[a-z][a-z0-9]*$/i', trim( $selector ) );

		// DEBUG WIDTH ISSUE: Track why selector is not matching
		if ( strpos( $selector, 'img' ) !== false ) {
			$log_file = WP_CONTENT_DIR . '/width-debug.log';
			$match_status = $result ? 'MATCHES' : 'NO_MATCH';
			file_put_contents( $log_file, date( '[H:i:s] ' ) . "CHILD_ELEMENT_SELECTOR_CHECK: {$match_status} - {$selector}\n", FILE_APPEND );
		}

		return $result;
	}

	private function extract_child_element_tag( string $selector ): string {
		// Extract last element tag from selector
		// ".widget-image img" → "img"
		// ".container > p" → "p"
		// ".box button.active" → "" (not a simple element)

		$parts = preg_split( '/\s+/', trim( $selector ) );
		$last_part = end( $parts );

		// Remove combinators
		$last_part = str_replace( '>', '', $last_part );
		$last_part = trim( $last_part );

		// Check if it's a simple element tag (no classes, IDs, pseudo-selectors)
		if ( preg_match( '/^[a-z][a-z0-9]*$/i', $last_part ) ) {
			return strtolower( $last_part );
		}

		return '';
	}

	private function apply_child_element_styles_atomically(
		string $element_tag,
		array $rules,
		array $widgets,
		Unified_Style_Manager $unified_style_manager
	): int {
		$matching_widgets = $this->find_child_widgets_by_tag( $element_tag, $widgets );

		if ( empty( $matching_widgets ) ) {
			return 0;
		}

		// Get widget type for this element tag
		$widget_type = $this->get_widget_type_from_tag( $element_tag );

		// Extract all classes that exist in the widget structure for scope validation
		$existing_classes = $this->extract_existing_classes_from_widgets( $widgets );

		// Process each rule individually to calculate specificity
		foreach ( $rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $this->prepare_properties_for_collection( [ $rule ] );

			if ( empty( $properties ) ) {
				continue;
			}

			// Validate selector scope - only apply if parent classes exist in converted structure
			if ( ! $this->is_selector_scope_valid( $selector, $existing_classes ) ) {
				continue;
			}

			// Calculate specificity for this selector
			$specificity = $this->specificity_calculator->calculate_specificity( $selector );

			// Apply styles atomically to each matching widget
			foreach ( $matching_widgets as $widget_id ) {
				$unified_style_manager->collect_element_styles(
					$widget_type,
					$properties,
					$widget_id,
					$selector,
					$specificity
				);
			}
		}

		return count( $matching_widgets );
	}

	private function find_child_widgets_by_tag( string $element_tag, array $widgets ): array {
		$matching_widget_ids = [];
		$widget_type = $this->get_widget_type_from_tag( $element_tag );

		foreach ( $widgets as $widget ) {
			$widget_tag = $widget['original_tag'] ?? $widget['tag'] ?? '';
			$widget_type_actual = $widget['widget_type'] ?? '';
			$element_id = $widget['element_id'] ?? null;

			// Match by original tag OR widget type
			$tag_matches = ( $widget_tag === $element_tag );
			$type_matches = ( $widget_type_actual === $widget_type );

			if ( ( $tag_matches || $type_matches ) && $element_id ) {
				$matching_widget_ids[] = $element_id;
			}

			// Recursively search children
			if ( ! empty( $widget['children'] ) ) {
				$child_matches = $this->find_child_widgets_by_tag( $element_tag, $widget['children'] );
				$matching_widget_ids = array_merge( $matching_widget_ids, $child_matches );
			}
		}

		return $matching_widget_ids;
	}

	private function get_widget_type_from_tag( string $element_tag ): string {
		$tag_to_widget_type = [
			'img' => 'e-image',
			'h1' => 'e-heading',
			'h2' => 'e-heading',
			'h3' => 'e-heading',
			'h4' => 'e-heading',
			'h5' => 'e-heading',
			'h6' => 'e-heading',
			'p' => 'e-paragraph',
			'span' => 'e-paragraph',
			'a' => 'e-link',
			'button' => 'e-button',
			'div' => 'e-div-block',
			'section' => 'e-div-block',
			'article' => 'e-div-block',
			'aside' => 'e-div-block',
			'header' => 'e-div-block',
			'footer' => 'e-div-block',
			'main' => 'e-div-block',
			'nav' => 'e-div-block',
			'ul' => 'e-div-block',
			'ol' => 'e-div-block',
			'li' => 'e-paragraph',
		];

		return $tag_to_widget_type[ $element_tag ] ?? $element_tag;
	}

	private function prepare_properties_for_collection( array $rules ): array {
		$properties = [];

		foreach ( $rules as $rule ) {
			if ( isset( $rule['properties'] ) && is_array( $rule['properties'] ) ) {
				foreach ( $rule['properties'] as $property_data ) {
					$property = $property_data['property'] ?? '';
					$value = $property_data['value'] ?? '';

					if ( empty( $property ) || empty( $value ) ) {
						continue;
					}

					$converted = $this->convert_property_if_needed( $property, $value );
					$properties[] = [
						'property' => $property,
						'value' => $value,
						'important' => $property_data['important'] ?? false,
						'converted_property' => $converted,
					];
				}
			}
		}

		return $properties;
	}

	private function remove_processed_child_element_rules(
		array $css_rules,
		array $child_element_rules
	): array {
		// Collect all processed selectors
		$processed_selectors = [];
		foreach ( $child_element_rules as $element_tag => $rules ) {
			foreach ( $rules as $rule ) {
				$processed_selectors[] = $rule['selector'] ?? '';
			}
		}

		// Filter out processed rules
		$remaining_rules = [];
		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( ! in_array( $selector, $processed_selectors, true ) ) {
				$remaining_rules[] = $rule;
			}
		}

		return $remaining_rules;
	}

	private function convert_property_if_needed( string $property, string $value ) {
		if ( ! $this->property_converter ) {
			return null;
		}

		try {
			return $this->property_converter->convert_property_to_v4_atomic( $property, $value );
		} catch ( \Exception $e ) {
			return null;
		}
	}

	private function extract_existing_classes_from_widgets( array $widgets ): array {
		$existing_classes = [];

		foreach ( $widgets as $widget ) {
			// Extract classes from original_classes field
			if ( ! empty( $widget['original_classes'] ) ) {
				if ( is_array( $widget['original_classes'] ) ) {
					$existing_classes = array_merge( $existing_classes, $widget['original_classes'] );
				} elseif ( is_string( $widget['original_classes'] ) ) {
					$classes = explode( ' ', $widget['original_classes'] );
					$existing_classes = array_merge( $existing_classes, $classes );
				}
			}

			// Extract classes from class field
			if ( ! empty( $widget['class'] ) ) {
				if ( is_array( $widget['class'] ) ) {
					$existing_classes = array_merge( $existing_classes, $widget['class'] );
				} elseif ( is_string( $widget['class'] ) ) {
					$classes = explode( ' ', $widget['class'] );
					$existing_classes = array_merge( $existing_classes, $classes );
				}
			}

			// Recursively extract from children
			if ( ! empty( $widget['children'] ) ) {
				$child_classes = $this->extract_existing_classes_from_widgets( $widget['children'] );
				$existing_classes = array_merge( $existing_classes, $child_classes );
			}
		}

		// Remove duplicates and empty values
		$existing_classes = array_filter( array_unique( $existing_classes ) );

		return $existing_classes;
	}

	private function is_selector_scope_valid( string $selector, array $existing_classes ): bool {
		// Extract parent classes from selector (everything before the element tag)
		// Example: ".avatar .avatar-image img" → [".avatar", ".avatar-image"]
		// Example: ".elementor-widget-image img" → [".elementor-widget-image"]

		$parts = preg_split( '/\s+/', trim( $selector ) );

		// Remove the last part (element tag) to get parent classes
		array_pop( $parts );

		if ( empty( $parts ) ) {
			// No parent classes, selector is just "img" - allow it
			return true;
		}

		// Extract class names from each part
		$required_classes = [];
		foreach ( $parts as $part ) {
			// Extract classes from this part (e.g., ".class1.class2" → ["class1", "class2"])
			if ( preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $part, $matches ) ) {
				$required_classes = array_merge( $required_classes, $matches[1] );
			}
		}

		if ( empty( $required_classes ) ) {
			// No classes found in selector parts, allow it
			return true;
		}

		// SPECIAL CASE: Allow Elementor-specific selectors that target the original content
		// These selectors are legitimate even if the exact classes don't exist in converted structure
		$elementor_patterns = [
			'elementor-element',        // Element wrapper class
			'elementor-widget-',        // Widget type classes
		];

		foreach ( $required_classes as $required_class ) {
			foreach ( $elementor_patterns as $pattern ) {
				if ( strpos( $required_class, $pattern ) === 0 ) {
					return true; // Allow Elementor-specific selectors
				}
			}
		}

		// For non-Elementor selectors, check if at least one required class exists in the converted structure
		foreach ( $required_classes as $required_class ) {
			if ( in_array( $required_class, $existing_classes, true ) ) {
				return true; // At least one class exists, selector is valid
			}
		}

		// None of the required classes exist in converted structure
		return false;
	}
}
