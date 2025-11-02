<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;

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

	private $current_selector = '';
	private $specificity_calculator;

	private const WIDGET_CLASS_PREFIX = 'elementor-';

	public function __construct() {
		$this->specificity_calculator = new Css_Specificity_Calculator();
	}

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
		$log_file = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents( $log_file, "\n" . str_repeat( '-', 80 ) . "\n", FILE_APPEND );
		file_put_contents( $log_file, date('[H:i:s] ') . "WIDGET_CLASS_PROCESSOR: Started\n", FILE_APPEND );
		
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();
		$css_variable_definitions = $context->get_metadata( 'css_variable_definitions', [] );

		file_put_contents( $log_file, date('[H:i:s] ') . "Input: CSS rules=" . count( $css_rules ) . ", widgets=" . count( $widgets ) . ", CSS variables=" . count( $css_variable_definitions ) . "\n", FILE_APPEND );

		if ( empty( $css_rules ) || empty( $widgets ) ) {
			file_put_contents( $log_file, date('[H:i:s] ') . "WARNING: Empty CSS rules or widgets, skipping\n", FILE_APPEND );
			return $context;
		}

		// DEBUG: Filter CSS rules by specific patterns for debugging purposes only
		// This code is for debugging and does not affect processing logic
		$target_patterns = [ 'e-con-inner', '089b111', 'a431a3a', '6aaaa11', 'bb20798' ];
		$relevant_rules = [];
		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			foreach ( $target_patterns as $pattern ) {
				if ( false !== strpos( $selector, $pattern ) ) {
					$relevant_rules[] = [
						'selector' => $selector,
						'properties' => $rule['properties'] ?? [],
					];
					break;
				}
			}
		}
		
		if ( ! empty( $relevant_rules ) ) {
			file_put_contents( $log_file, date('[H:i:s] ') . "DEBUG: Relevant CSS rules BEFORE processing (" . count( $relevant_rules ) . "):\n", FILE_APPEND );
			foreach ( $relevant_rules as $idx => $rule ) {
				$props = array_map( function( $p ) { return ( $p['property'] ?? '' ) . ': ' . ( $p['value'] ?? '' ); }, $rule['properties'] );
				file_put_contents( $log_file, date('[H:i:s] ') . "  [{$idx}] {$rule['selector']}\n", FILE_APPEND );
				file_put_contents( $log_file, date('[H:i:s] ') . "      Props: " . implode( ', ', array_slice( $props, 0, 5 ) ) . "\n", FILE_APPEND );
			}
		}
		// END DEBUG

		if ( ! empty( $css_variable_definitions ) ) {
			file_put_contents( $log_file, date('[H:i:s] ') . "CSS Variables AVAILABLE BEFORE widget class processor (" . count( $css_variable_definitions ) . "):\n", FILE_APPEND );
			
			// DEBUG: Filter for flexbox-related variables for debugging purposes only
			$relevant_vars = array_filter( $css_variable_definitions, function( $var ) {
				$name = $var['name'] ?? '';
				return strpos( $name, 'display' ) !== false || 
				       strpos( $name, 'flex' ) !== false || 
				       strpos( $name, 'gap' ) !== false ||
				       strpos( $name, 'justify' ) !== false ||
				       strpos( $name, 'align' ) !== false;
			} );
			foreach ( array_slice( $relevant_vars, 0, 20 ) as $var ) {
				file_put_contents( $log_file, date('[H:i:s] ') . "  {$var['name']}: {$var['value']}\n", FILE_APPEND );
			}
		}

		$widget_classes = $this->extract_widget_classes_from_widgets( $widgets );
		file_put_contents( $log_file, date('[H:i:s] ') . "Extracted widget classes (" . count( $widget_classes ) . "): " . implode( ', ', array_slice( $widget_classes, 0, 10 ) ) . "\n", FILE_APPEND );
		
		$widget_specific_rules = $this->extract_widget_specific_rules( $css_rules, $widget_classes );
		file_put_contents( $log_file, date('[H:i:s] ') . "Widget-specific rules found: " . count( $widget_specific_rules ) . "\n", FILE_APPEND );

		if ( empty( $widget_specific_rules ) ) {
			return $context;
		}

		// Apply widget-specific styles directly to widgets
		$log_file = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents( $log_file, date('[H:i:s] ') . "WIDGET_CLASS_PROCESSOR: Applying styles to widgets\n", FILE_APPEND );
		$styles_applied = $this->apply_widget_specific_styles( $widget_specific_rules, $widgets, $context );
		file_put_contents( $log_file, date('[H:i:s] ') . "WIDGET_CLASS_PROCESSOR: Styles applied to " . $styles_applied . " widgets\n", FILE_APPEND );

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

		$widget_variable_references = $context->get_metadata( 'widget_variable_references', [] );
		$log_file = WP_CONTENT_DIR . '/scoped-vars.log';
		file_put_contents( $log_file, date('[H:i:s] ') . "Widget Class Processor: Extracted " . count($widget_variable_references) . " variable references from widget properties\n", FILE_APPEND );
		if ( ! empty( $widget_variable_references ) ) {
			file_put_contents( $log_file, date('[H:i:s] ') . "Widget variables: " . implode(', ', $widget_variable_references) . "\n", FILE_APPEND );
		}

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

		if ( $this->is_selector_with_element_tag_child( $trimmed ) ) {
			return false;
		}

		$space_parts = preg_split( '/\s+/', $trimmed );
		if ( count( $space_parts ) > 1 ) {
			preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $trimmed, $matches );
			$all_classes = $matches[1] ?? [];
			
			foreach ( $all_classes as $class ) {
				if ( $this->is_widget_class( $class ) ) {
					return false;
				}
			}
			
			return true;
		}

		if ( preg_match( '/[+~]/', $trimmed ) ) {
			return true;
		}

		return false;
	}

	private function is_selector_with_element_tag_child( string $selector ): bool {
		$element_tags = [ 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav', 'ul', 'ol', 'li', 'button', 'input', 'textarea', 'select', 'label', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot' ];

		$parts = preg_split( '/\s+/', trim( $selector ) );
		$last_part = end( $parts );

		foreach ( $element_tags as $tag ) {
			if ( preg_match( '/^' . preg_quote( $tag, '/' ) . '(?:[\.:\[#]|$)/', $last_part ) ) {
				preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $selector, $matches );
				$all_classes = $matches[1] ?? [];

				foreach ( $all_classes as $class ) {
					if ( $this->is_widget_class( $class ) ) {
						return true;
					}
				}
			}
		}

		return false;
	}

	private function is_widget_targeting_complex_selector( string $selector ): bool {
		$patterns_to_allow = [
			'/\.elementor-element\s+\.elementor-widget-container/',
			'/\.elementor-element:not\(:has\(\.elementor-widget-container\)\)/',
			'/\.elementor-widget-wrap\s*>\s*\.elementor-element/',
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

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			$this->current_selector = $selector;

			if ( $this->should_skip_complex_selector( $selector ) ) {
				continue;
			}

			$selector_classes = $this->extract_classes_from_selector( $selector );

			if ( $this->selector_contains_widget_classes( $selector_classes ) ) {
				
				$target_patterns = [ 'e-con-inner', '089b111', 'a431a3a', '6aaaa11', 'bb20798' ];
				$is_relevant = false;
				foreach ( $target_patterns as $pattern ) {
					if ( false !== strpos( $selector, $pattern ) ) {
						$is_relevant = true;
						break;
					}
				}
				
				if ( $is_relevant ) {
					$log_file = WP_CONTENT_DIR . '/css-property-tracking.log';
					$props = array_map( function( $p ) { return ( $p['property'] ?? '' ) . ': ' . ( $p['value'] ?? '' ); }, $rule['properties'] ?? [] );
					file_put_contents( $log_file, date('[H:i:s] ') . "WIDGET_CLASS_PROCESSOR: Found relevant rule - {$selector}\n", FILE_APPEND );
					file_put_contents( $log_file, date('[H:i:s] ') . "  Target classes: " . implode( ', ', $selector_classes ) . "\n", FILE_APPEND );
					file_put_contents( $log_file, date('[H:i:s] ') . "  Properties (" . count( $rule['properties'] ?? [] ) . "): " . implode( ', ', array_slice( $props, 0, 10 ) ) . "\n", FILE_APPEND );
				}
				
				$widget_rules[] = [
					'selector' => $selector,
					'properties' => $rule['properties'] ?? [],
					'target_classes' => $selector_classes, // FIXED: Use selector classes, not all widget classes
					'full_selector' => $selector, // Store full selector for element-specific matching
					'specificity' => $this->calculate_selector_specificity( $selector ),
				];

				if ( $selector === $target_selector ) {
					foreach ( $rule['properties'] ?? [] as $prop ) {
						if ( in_array( $prop['property'] ?? '', ['font-size', 'line-height', 'color'] ) ) {
						}
					}
				}
			}
		}

		return $widget_rules;
	}

	/**
	 * FIX #4: Extract target classes from selector (last part of nested selectors)
	 * FIX: Handle selectors ending with element tags (img, h1, p, etc.)
	 */
	private function extract_classes_from_selector( string $selector ): array {
		$parts = preg_split( '/\s+/', trim( $selector ) );
		$target_part = end( $parts );

		$element_tags = [ 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav', 'ul', 'ol', 'li', 'button', 'input', 'textarea', 'select', 'label', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot' ];

		$is_element_tag_only = false;

		foreach ( $element_tags as $tag ) {
			if ( preg_match( '/^' . preg_quote( $tag, '/' ) . '(?:[\.:\[#]|$)/', $target_part ) ) {
				$is_element_tag_only = true;
				break;
			}
		}

		if ( $is_element_tag_only ) {
			preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $selector, $matches );
			$all_classes = $matches[1] ?? [];

			$widget_classes = array_filter( $all_classes, function( $class ) {
				return $this->is_widget_class( $class );
			} );

			return array_values( $widget_classes );
		}

		preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $target_part, $matches );
		$target_classes = $matches[1] ?? [];

		if ( empty( $target_classes ) ) {
			preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $selector, $matches );
			$target_classes = $matches[1] ?? [];
		}

		return $target_classes;
	}

	private function extract_child_element_tag_from_selector( string $selector ): ?string {
		$parts = preg_split( '/\s+/', trim( $selector ) );
		$last_part = end( $parts );
		
		$element_tags = [ 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav', 'ul', 'ol', 'li', 'button', 'input', 'textarea', 'select', 'label', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot' ];
		
		foreach ( $element_tags as $tag ) {
			if ( preg_match( '/^' . preg_quote( $tag, '/' ) . '(?:[\.:\[#]|$)/', $last_part ) ) {
				return $tag;
			}
		}
		
		return null;
	}

	private function find_child_widgets_by_tag( array $parent_element_ids, string $child_tag, array $all_widgets ): array {
		$child_widgets = [];
		$tag_to_widget_type = [
			'img' => 'e-image',
			'h1' => 'e-heading',
			'h2' => 'e-heading',
			'h3' => 'e-heading',
			'h4' => 'e-heading',
			'h5' => 'e-heading',
			'h6' => 'e-heading',
			'p' => 'e-paragraph',
			'a' => 'e-link',
			'button' => 'e-button',
		];
		
		$target_widget_type = $tag_to_widget_type[ $child_tag ] ?? null;
		
		if ( ! $target_widget_type ) {
			return $child_widgets;
		}
		
		foreach ( $parent_element_ids as $parent_element_id ) {
			$parent_widget = $this->find_widget_by_element_id( $parent_element_id, $all_widgets );
			
			if ( $parent_widget && ! empty( $parent_widget['children'] ) ) {
				$this->recursively_find_child_widgets_by_type( $parent_widget['children'], $target_widget_type, $child_widgets );
			}
		}
		
		return array_unique( $child_widgets );
	}

	private function find_widget_by_element_id( string $element_id, array $widgets ): ?array {
		foreach ( $widgets as $widget ) {
			if ( ( $widget['element_id'] ?? '' ) === $element_id ) {
				return $widget;
			}
			
			if ( ! empty( $widget['children'] ) ) {
				$found = $this->find_widget_by_element_id( $element_id, $widget['children'] );
				if ( $found ) {
					return $found;
				}
			}
		}
		
		return null;
	}

	private function recursively_find_child_widgets_by_type( array $widgets, string $target_type, array &$result ): void {
		foreach ( $widgets as $widget ) {
			if ( ( $widget['widget_type'] ?? '' ) === $target_type ) {
				$element_id = $widget['element_id'] ?? null;
				if ( $element_id ) {
					$result[] = $element_id;
				}
			}
			
			if ( ! empty( $widget['children'] ) ) {
				$this->recursively_find_child_widgets_by_type( $widget['children'], $target_type, $result );
			}
		}
	}

	private function apply_styles_to_widget_atomically( 
		string $element_id, 
		array $converted_properties, 
		Css_Processing_Context $context, 
		string $child_element_tag = '',
		string $selector = '',
		int $specificity = 0
	): void {
		$unified_style_manager = $context->get_metadata( 'unified_style_manager' );

		if ( ! $unified_style_manager ) {
			return;
		}

		$tag_to_widget_type = [
			'img' => 'e-image',
			'h1' => 'e-heading',
			'h2' => 'e-heading',
			'h3' => 'e-heading',
			'h4' => 'e-heading',
			'h5' => 'e-heading',
			'h6' => 'e-heading',
			'p' => 'e-paragraph',
			'a' => 'e-link',
			'button' => 'e-button',
		];

		$widget_type = $tag_to_widget_type[ $child_element_tag ] ?? $child_element_tag;

		foreach ( $converted_properties as $property_data ) {
			// DEBUG WIDTH ISSUE: Track width properties from widget class processor
			if ( ( $property_data['property'] ?? '' ) === 'width' && $widget_type === 'e-image' ) {
				$log_file = WP_CONTENT_DIR . '/width-debug.log';
				file_put_contents( $log_file, date('[H:i:s] ') . "WIDGET_CLASS_PROCESSOR: width={$property_data['value']}, selector={$selector}, specificity={$specificity}, widget_id={$element_id}\n", FILE_APPEND );
			}
			
			$unified_style_manager->collect_element_styles(
				$widget_type,
				[ $property_data ],
				$element_id,
				$selector,
				$specificity
			);
		}
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
		error_log( "CUSTOM_CSS_DEBUG: Widget_Class_Processor - apply_widget_specific_styles called with " . count( $widget_rules ) . " rules" );
		$unified_style_manager = $context->get_metadata( 'unified_style_manager' );

		if ( ! $unified_style_manager ) {
			$unified_style_manager = new \Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager(
				new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator(),
				new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service()
			);
			$context->set_metadata( 'unified_style_manager', $unified_style_manager );
		}

		// Use existing custom CSS collector from context, or create new one if not available
		$custom_css_collector = $context->get_metadata( 'custom_css_collector' );
		if ( ! $custom_css_collector ) {
			$custom_css_collector = new \Elementor\Modules\CssConverter\Services\Css\Custom_Css_Collector();
			$context->set_metadata( 'custom_css_collector', $custom_css_collector );
		}
		$property_conversion_service = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service( $custom_css_collector );
		$styles_applied = 0;

		foreach ( $widget_rules as $rule ) {
			$selector = $rule['selector'];
			$properties = $rule['properties'];
			$target_classes = $rule['target_classes'] ?? [];
			$full_selector = $rule['full_selector'] ?? $selector;


			// Set current selector for element-specific matching
			$this->current_selector = $full_selector;

			$matching_widgets = [];

			// FIX #2: Use new matching logic based on selector classes
			$matching_widgets = $this->find_widgets_matching_selector_classes( $target_classes, $widgets );

			if ( ! empty( $matching_widgets ) ) {
				$this->extract_and_store_variable_references( $properties, $context );
				
				// Get element ID from the first matching widget for custom CSS collection
				$first_widget = reset( $matching_widgets );
				$widget_element_id = $first_widget['element_id'] ?? '';
				error_log( "CUSTOM_CSS_DEBUG: Widget_Class_Processor - first_widget keys: " . implode( ', ', array_keys( $first_widget ) ) );
				error_log( "CUSTOM_CSS_DEBUG: Widget_Class_Processor - widget_element_id: {$widget_element_id}" );
				$converted_properties = $this->convert_properties_to_atomic( $properties, $property_conversion_service, $context, $widget_element_id );

				if ( $selector === $target_selector ) {
					foreach ( $properties as $prop ) {
						if ( in_array( $prop['property'] ?? '', ['font-size', 'line-height', 'color'] ) ) {
						}
					}
					foreach ( $converted_properties as $prop_data ) {
						if ( in_array( $prop_data['property'] ?? '', ['font-size', 'line-height', 'color'] ) ) {
							$converted = $prop_data['converted_property'] ?? null;
						}
					}
				}

				$child_element_tag = $this->extract_child_element_tag_from_selector( $selector );
				
				// Calculate specificity for this selector
				$specificity = $this->specificity_calculator->calculate_specificity( $selector );
				
				if ( $child_element_tag ) {
					$child_widgets = $this->find_child_widgets_by_tag( $matching_widgets, $child_element_tag, $widgets );
					
					if ( ! empty( $child_widgets ) ) {
						foreach ( $child_widgets as $child_element_id ) {
							$this->apply_styles_to_widget_atomically( 
								$child_element_id, 
								$converted_properties, 
								$context, 
								$child_element_tag,
								$selector,
								$specificity
							);
						}
						$styles_applied += count( $child_widgets );
					}
				} else {
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
				}

			}
		}

		return $styles_applied;
	}

	private function convert_properties_to_atomic( array $properties, $property_conversion_service, Css_Processing_Context $context, string $widget_element_id = '' ): array {
		$converted_properties = [];
		$widget_id = ! empty( $widget_element_id ) ? $widget_element_id : 'widget-' . uniqid();

		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';
			$important = $property_data['important'] ?? false;

			if ( strpos( $property, '--' ) === 0 ) {
				continue;
			}

			$converted = $property_conversion_service->convert_property_with_fallback( $property, $value, $widget_id, $important );

			if ( $converted !== null ) {
				$converted_properties[] = [
					'property' => $property,
					'value' => $value,
					'original_property' => $property_data['original_property'] ?? $property,
					'original_value' => $property_data['original_value'] ?? $value,
					'important' => $important,
					'converted_property' => $converted,
				];
			}
		}

		return $converted_properties;
	}

	/**
	 * Simplified method to match widgets based on selector classes (page-specific logic removed)
	 */
	private function find_widgets_matching_selector_classes( array $selector_classes, array $widgets ): array {
		$matching_widgets = [];

		// Extract widget classes from selector (excluding element-specific classes)
		$widget_classes = array_filter($selector_classes, function( $class ) {
			return $this->is_widget_class( $class );
		});

		if ( ! empty( $widget_classes ) ) {
			$this->recursively_find_widgets_with_all_classes( $widget_classes, $widgets, $matching_widgets );
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


		$remaining_rules = [];
		$removed_count = 0;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			// FIXED: Remove ANY rule that was processed by Widget Class Processor
			// If we successfully applied it to widgets via widget-specific classes,
			// we should NOT let it be processed again as a global class
			if ( in_array( $selector, $processed_selectors, true ) ) {
				// Remove this rule - it was processed by Widget Class Processor
				++$removed_count;
				continue;
			}

			$remaining_rules[] = $rule;
		}


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

	private function extract_and_store_variable_references( array $properties, Css_Processing_Context $context ): void {
		$widget_variable_references = $context->get_metadata( 'widget_variable_references', [] );
		
		foreach ( $properties as $property_data ) {
			$value = $property_data['value'] ?? '';
			
			if ( empty( $value ) ) {
				continue;
			}
			
			preg_match_all( '/var\(\s*--([a-zA-Z0-9_-]+)/', $value, $matches );
			
			if ( ! empty( $matches[1] ) ) {
				foreach ( $matches[1] as $var_name ) {
					$clean_name = $this->clean_variable_name( $var_name );
					$widget_variable_references[] = $clean_name;
				}
			}
		}
		
		$context->set_metadata( 'widget_variable_references', array_unique( $widget_variable_references ) );
	}

	private function clean_variable_name( string $var_name ): string {
		$clean_name = ltrim( $var_name, '-' );
		return sanitize_key( $clean_name );
	}



	/**
	 * NEW: Helper method to get widget classes as array
	 */
	private function get_widget_classes_array( array $widget ): array {
		$classes_string = $widget['attributes']['class'] ?? '';
		if ( empty( $classes_string ) ) {
			return [];
		}
		return array_filter( explode( ' ', $classes_string ) );
	}


}
