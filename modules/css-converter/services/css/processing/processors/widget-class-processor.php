<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Widget Class Processor
 *
 * Handles CSS classes that start with widget-specific prefixes like 'elementor-'
 * These classes contain specific styling that should be applied directly to widgets
 * instead of being processed as global classes.
 */
class Widget_Class_Processor implements Css_Processor_Interface {


	private const WIDGET_CLASS_PREFIX = 'elementor-';

	public function get_processor_name(): string {
		return 'widget_class';
	}

	public function get_priority(): int {
		return 11; // Very early: Before reset styles processor to prevent widget classes from being treated as reset styles
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();
		return ! empty( $css_rules ) && ! empty( $widgets );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		if ( empty( $css_rules ) || empty( $widgets ) ) {
			return $context;
		}

		$widget_classes = $this->extract_widget_classes_from_widgets( $widgets );
		$widget_specific_rules = $this->extract_widget_specific_rules( $css_rules, $widget_classes );

		if ( empty( $widget_specific_rules ) ) {
			return $context;
		}

		// Apply widget-specific styles directly to widgets
		$styles_applied = $this->apply_widget_specific_styles( $widget_specific_rules, $widgets, $context );

		// Remove processed rules from css_rules so they don't get processed as global classes
		$remaining_rules = $this->remove_processed_rules( $css_rules, $widget_specific_rules );
		$context->set_metadata( 'css_rules', $remaining_rules );

		// Pass widget classes to HTML Class Modifier for removal from HTML
		$css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );
		$css_class_modifiers[] = [
			'type' => 'widget-classes',
			'mappings' => $widget_classes,
		];
		$context->set_metadata( 'css_class_modifiers', $css_class_modifiers );

		// DEBUG: Log what widget classes we're passing for removal
		file_put_contents( '/tmp/widget_classes_for_removal.log', 'Widget classes for removal: ' . implode( ', ', $widget_classes ) . "\n", FILE_APPEND );

		// Add statistics
		$context->add_statistic( 'widget_specific_rules_found', count( $widget_specific_rules ) );
		$context->add_statistic( 'widget_classes_processed', count( $widget_classes ) );
		$context->add_statistic( 'widget_styles_applied', $styles_applied );

		error_log( 'CSS PIPELINE DEBUG [WIDGET_CLASS]: Applied ' . $styles_applied . ' widget-specific styles from ' . count( $widget_specific_rules ) . ' rules' );
		error_log( 'CSS PIPELINE DEBUG [WIDGET_CLASS]: Passing ' . count( $widget_classes ) . ' widget classes for HTML removal: ' . implode( ', ', array_slice( $widget_classes, 0, 5 ) ) );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'widget_specific_rules_found',
			'widget_classes_processed',
			'widget_styles_applied',
		];
	}

	private function extract_widget_classes_from_widgets( array $widgets ): array {
		$widget_classes = [];
		$this->recursively_extract_widget_classes( $widgets, $widget_classes );
		return array_unique( $widget_classes );
	}

	private function recursively_extract_widget_classes( array $widgets, array &$widget_classes ): void {
		foreach ( $widgets as $widget ) {
			$classes_string = $widget['attributes']['class'] ?? '';
			if ( ! empty( $classes_string ) ) {
				$classes_array = explode( ' ', $classes_string );
				foreach ( $classes_array as $class_name ) {
					$class_name = trim( $class_name );
					if ( $this->is_widget_class( $class_name ) ) {
						$widget_classes[] = $class_name;
					}
				}
			}

			if ( ! empty( $widget['children'] ) ) {
				$this->recursively_extract_widget_classes( $widget['children'], $widget_classes );
			}
		}
	}

	private function is_widget_class( string $class_name ): bool {
		return 0 === strpos( $class_name, self::WIDGET_CLASS_PREFIX );
	}

	private function should_skip_complex_selector( string $selector ): bool {
		$trimmed = trim( $selector );

		if ( $this->is_widget_targeting_complex_selector( $trimmed ) ) {
			return false;
		}

		$space_parts = preg_split( '/\s+/', $trimmed );
		if ( count( $space_parts ) > 1 ) {
			return true;
		}

		if ( preg_match( '/[+~]/', $trimmed ) ) {
			return true;
		}

		return false;
	}

	private function is_widget_targeting_complex_selector( string $selector ): bool {
		$patterns_to_allow = [
			'/\.elementor-element\s+\.elementor-widget-container/',
			'/\.elementor-element:not\(:has\(\.elementor-widget-container\)\)/',
			'/\.elementor-widget-wrap\s*>\s*\.elementor-element/',
			'/\.elementor-\d+\s+\.elementor-element\.elementor-element-[a-f0-9]+/',
		];

		foreach ( $patterns_to_allow as $pattern ) {
			if ( preg_match( $pattern, $selector ) ) {
				return true;
			}
		}

		return false;
	}

	private function is_malformed_selector( string $selector ): bool {
		$trimmed = trim( $selector );

		// Check for malformed selectors:
		// - Unmatched parentheses
		// - Invalid characters
		// - Empty selectors

		if ( empty( $trimmed ) ) {
			return true;
		}

		// Check for unmatched closing parentheses
		if ( preg_match( '/\)[^(]*$/', $trimmed ) && ! preg_match( '/\([^)]*\)/', $trimmed ) ) {
			return true;
		}

		return false;
	}

	private function extract_widget_specific_rules( array $css_rules, array $widget_classes ): array {
		$widget_rules = [];
		$target_selector = '.elementor-1140 .elementor-element.elementor-element-6d397c1';

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			// DEBUG: Track target selector
			if ( $selector === $target_selector ) {
				error_log( 'WIDGET_CLASS_PROCESSOR: Processing target selector' );
			}

			if ( $this->should_skip_complex_selector( $selector ) ) {
				if ( $selector === $target_selector ) {
					error_log( 'WIDGET_CLASS_PROCESSOR: Target selector SKIPPED by should_skip_complex_selector' );
				}
				continue;
			}

			// FIX #1: Extract classes from the selector itself, not from all widgets
			$selector_classes = $this->extract_classes_from_selector( $selector );

			if ( $selector === $target_selector ) {
				error_log( 'WIDGET_CLASS_PROCESSOR: Target selector classes: ' . implode( ', ', $selector_classes ) );
			}

			if ( $this->selector_contains_widget_classes( $selector_classes ) ) {
				$widget_rules[] = [
					'selector' => $selector,
					'properties' => $rule['properties'] ?? [],
					'target_classes' => $selector_classes, // FIXED: Use selector classes, not all widget classes
					'specificity' => $this->calculate_selector_specificity( $selector ),
				];

				if ( $selector === $target_selector ) {
					error_log( 'WIDGET_CLASS_PROCESSOR: Target selector ACCEPTED as widget rule with ' . count( $rule['properties'] ?? [] ) . ' properties' );
					foreach ( $rule['properties'] ?? [] as $prop ) {
						if ( in_array( $prop['property'] ?? '', ['font-size', 'line-height', 'color'] ) ) {
							error_log( '  ' . ( $prop['property'] ?? 'unknown' ) . ': ' . ( $prop['value'] ?? 'unknown' ) );
						}
					}
				}
			} else {
				if ( $selector === $target_selector ) {
					error_log( 'WIDGET_CLASS_PROCESSOR: Target selector REJECTED - no widget classes found' );
				}
			}
		}

		return $widget_rules;
	}

	/**
	 * FIX #4: Replaced with new methods that work with selector classes
	 */
	private function extract_classes_from_selector( string $selector ): array {
		preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $selector, $matches );
		return $matches[1] ?? [];
	}

	private function selector_contains_widget_classes( array $selector_classes ): bool {
		foreach ( $selector_classes as $class_name ) {
			if ( $this->is_widget_class( $class_name ) ) {
				return true;
			}
		}
		return false;
	}

	private function calculate_selector_specificity( string $selector ): int {
		// Simple specificity calculation
		$id_count = substr_count( $selector, '#' );
		$class_count = substr_count( $selector, '.' );
		$element_count = preg_match_all( '/\b[a-z]+\b/', $selector );
		// CSS specificity: IDs worth 100, classes worth 10, elements worth 1
		return ( $id_count * 100 ) + ( $class_count * 10 ) + $element_count;
	}

	private function apply_widget_specific_styles( array $widget_rules, array $widgets, Css_Processing_Context $context ): int {
		$unified_style_manager = $context->get_metadata( 'unified_style_manager' );

		if ( ! $unified_style_manager ) {
			$unified_style_manager = new \Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager(
				new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator(),
				new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service()
			);
			$context->set_metadata( 'unified_style_manager', $unified_style_manager );
		}

		$property_conversion_service = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service();
		$styles_applied = 0;

		foreach ( $widget_rules as $rule ) {
			$selector = $rule['selector'];
			$properties = $rule['properties'];
			$target_classes = $rule['target_classes'] ?? [];
			$target_selector = '.elementor-1140 .elementor-element.elementor-element-6d397c1';

			$matching_widgets = [];

			// FIX #2: Use new matching logic based on selector classes
			$matching_widgets = $this->find_widgets_matching_selector_classes( $target_classes, $widgets );

			if ( $selector === $target_selector ) {
				error_log( 'WIDGET_CLASS_PROCESSOR: Target selector found ' . count( $matching_widgets ) . ' matching widgets' );
			}

			if ( ! empty( $matching_widgets ) ) {
				$converted_properties = $this->convert_properties_to_atomic( $properties, $property_conversion_service );

				if ( $selector === $target_selector ) {
					error_log( 'WIDGET_CLASS_PROCESSOR: Target selector converting ' . count( $properties ) . ' properties to ' . count( $converted_properties ) . ' atomic properties' );
					foreach ( $properties as $prop ) {
						if ( in_array( $prop['property'] ?? '', ['font-size', 'line-height', 'color'] ) ) {
							error_log( '  ORIGINAL: ' . ( $prop['property'] ?? 'unknown' ) . ': ' . ( $prop['value'] ?? 'unknown' ) );
						}
					}
					foreach ( $converted_properties as $prop_data ) {
						if ( in_array( $prop_data['property'] ?? '', ['font-size', 'line-height', 'color'] ) ) {
							$converted = $prop_data['converted_property'] ?? null;
							error_log( '  CONVERTED: ' . ( $prop_data['property'] ?? 'unknown' ) . ': ' . ( $prop_data['value'] ?? 'unknown' ) . ' -> ' . ( $converted ? 'SUCCESS' : 'FAILED' ) );
						}
					}
				}

				file_put_contents( '/tmp/widget_rules_applied.log', "APPLYING RULE: {$selector}\n", FILE_APPEND );
				file_put_contents( '/tmp/widget_rules_applied.log', '  Target classes: ' . implode( ', ', $target_classes ) . "\n", FILE_APPEND );
				file_put_contents( '/tmp/widget_rules_applied.log', '  Properties: ' . count( $converted_properties ) . "\n", FILE_APPEND );
				foreach ( $converted_properties as $prop_data ) {
					$prop = $prop_data['property'] ?? '';
					$value = $prop_data['original_value'] ?? 'unknown';
					file_put_contents( '/tmp/widget_rules_applied.log', "    {$prop}: {$value}\n", FILE_APPEND );
				}
				file_put_contents( '/tmp/widget_rules_applied.log', "\n", FILE_APPEND );

				$unified_style_manager->collect_css_selector_styles(
					$selector,
					$converted_properties,
					$matching_widgets
				);
				$styles_applied += count( $matching_widgets );

				error_log( 'CSS PIPELINE DEBUG [WIDGET_CLASS]: Applied \'' . $selector . '\' to ' . count( $matching_widgets ) . ' widgets with classes [' . implode( ', ', $target_classes ) . ']' );
			}
		}

		return $styles_applied;
	}

	private function convert_properties_to_atomic( array $properties, $property_conversion_service ): array {
		$converted_properties = [];

		foreach ( $properties as $property_data ) {
			$property = $property_data['property'];
			$value = $property_data['value'];
			$important = $property_data['important'] ?? false;

			$converted = $property_conversion_service->convert_property_to_v4_atomic( $property, $value );

			$converted_properties[] = [
				'property' => $property,
				'value' => $value,
				'original_property' => $property,
				'original_value' => $value,
				'important' => $important,
				'converted_property' => $converted,
			];
		}

		return $converted_properties;
	}

	/**
	 * FIX #2: New method to match widgets based on selector classes
	 */
	private function find_widgets_matching_selector_classes( array $selector_classes, array $widgets ): array {
		$matching_widgets = [];

		// Extract element-ID-specific classes (e.g., elementor-element-1a10fb4)
		$element_id_classes = array_filter($selector_classes, function( $class ) {
			return preg_match( '/^elementor-element-[a-f0-9]+$/', $class );
		});

		if ( ! empty( $element_id_classes ) ) {
			// If selector has element ID, ONLY match widgets with that specific ID
			$this->recursively_find_widgets_with_specific_element_id( $element_id_classes, $widgets, $matching_widgets );
		} else {
			// For generic selectors, match widgets with ALL required elementor- classes
			$elementor_classes = array_filter($selector_classes, function( $class ) {
				return $this->is_widget_class( $class );
			});
			if ( ! empty( $elementor_classes ) ) {
				$this->recursively_find_widgets_with_all_classes( $elementor_classes, $widgets, $matching_widgets );
			}
		}

		return $matching_widgets;
	}

	private function find_widgets_with_all_classes( array $required_classes, array $widgets ): array {
		$matching_widgets = [];
		$this->recursively_find_widgets_with_all_classes( $required_classes, $widgets, $matching_widgets );
		return $matching_widgets;
	}

	private function find_widgets_with_widget_class( array $widgets ): array {
		$matching_widgets = [];
		$this->recursively_find_widgets_with_widget_class( $widgets, $matching_widgets );
		return $matching_widgets;
	}

	private function recursively_find_widgets_with_widget_class( array $widgets, array &$matching_widgets ): void {
		foreach ( $widgets as $widget ) {
			$classes_string = $widget['attributes']['class'] ?? '';
			if ( ! empty( $classes_string ) ) {
				$widget_classes = explode( ' ', $classes_string );

				foreach ( $widget_classes as $class_name ) {
					if ( $this->is_widget_class( $class_name ) ) {
						$element_id = $widget['element_id'] ?? null;
						if ( $element_id ) {
							$matching_widgets[] = $element_id;
						}
						break;
					}
				}
			}

			if ( ! empty( $widget['children'] ) ) {
				$this->recursively_find_widgets_with_widget_class( $widget['children'], $matching_widgets );
			}
		}
	}

	private function recursively_find_widgets_with_specific_element_id( array $element_id_classes, array $widgets, array &$matching_widgets ): void {
		foreach ( $widgets as $widget ) {
			$classes_string = $widget['attributes']['class'] ?? '';
			if ( ! empty( $classes_string ) ) {
				$widget_classes = explode( ' ', $classes_string );

				// Check if widget has the SPECIFIC element ID class
				foreach ( $element_id_classes as $element_id_class ) {
					if ( in_array( $element_id_class, $widget_classes, true ) ) {
						$element_id = $widget['element_id'] ?? null;
						if ( $element_id ) {
							$matching_widgets[] = $element_id;
						}
						break; // Found the specific element ID, no need to check others
					}
				}
			}

			if ( ! empty( $widget['children'] ) ) {
				$this->recursively_find_widgets_with_specific_element_id( $element_id_classes, $widget['children'], $matching_widgets );
			}
		}
	}

	private function recursively_find_widgets_with_all_classes( array $required_classes, array $widgets, array &$matching_widgets ): void {
		foreach ( $widgets as $widget ) {
			$classes_string = $widget['attributes']['class'] ?? '';
			if ( ! empty( $classes_string ) ) {
				$widget_classes = explode( ' ', $classes_string );

				// Check if widget has ALL required classes
				$has_all_classes = true;
				foreach ( $required_classes as $required_class ) {
					if ( ! in_array( $required_class, $widget_classes, true ) ) {
						$has_all_classes = false;
						break;
					}
				}

				if ( $has_all_classes ) {
					$element_id = $widget['element_id'] ?? null;
					if ( $element_id ) {
						$matching_widgets[] = $element_id;
					}
				}
			}

			if ( ! empty( $widget['children'] ) ) {
				$this->recursively_find_widgets_with_all_classes( $required_classes, $widget['children'], $matching_widgets );
			}
		}
	}

	private function remove_processed_rules( array $css_rules, array $widget_rules ): array {
		$processed_selectors = array_column( $widget_rules, 'selector' );

		error_log( 'CSS PIPELINE DEBUG [WIDGET_CLASS]: remove_processed_rules - Total CSS rules: ' . count( $css_rules ) );
		error_log( 'CSS PIPELINE DEBUG [WIDGET_CLASS]: remove_processed_rules - Processed selectors: ' . count( $processed_selectors ) );

		$remaining_rules = [];
		$removed_count = 0;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			// FIXED: Remove ANY rule that was processed by Widget Class Processor
			// If we successfully applied it to widgets via widget-specific classes,
			// we should NOT let it be processed again as a global class
			//
			// Example: .elementor-1140 .elementor-element.elementor-element-6d397c1
			// - Contains .elementor-1140 (page class)
			// - Contains .elementor-element-6d397c1 (widget class)
			// - We applied it to the widget → REMOVE IT
			// - Don't create a global class for it
			if ( in_array( $selector, $processed_selectors, true ) ) {
				// Remove this rule - it was processed by Widget Class Processor
				if ( strpos( $selector, 'elementor-element-6d397c1' ) !== false ) {
					error_log( 'CSS PIPELINE DEBUG [WIDGET_CLASS]: REMOVING TARGET: ' . $selector );
				}
				++$removed_count;
				continue;
			}

			$remaining_rules[] = $rule;
		}

		error_log( 'CSS PIPELINE DEBUG [WIDGET_CLASS]: Removed ' . $removed_count . ' rules, ' . count( $remaining_rules ) . ' remaining' );

		return $remaining_rules;
	}

	private function selector_contains_only_widget_classes( string $selector ): bool {
		// Extract all class names from the selector
		preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $selector, $matches );

		if ( empty( $matches[1] ) ) {
			return false; // No classes found
		}

		$class_names = $matches[1];

		// Check if ALL classes are widget-specific
		foreach ( $class_names as $class_name ) {
			if ( ! $this->is_widget_class( $class_name ) ) {
				return false; // Found a non-widget class
			}
		}

		return true; // All classes are widget-specific
	}
}
