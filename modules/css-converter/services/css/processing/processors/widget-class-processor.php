<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;

if (! defined('ABSPATH') ) {
    exit;
}

/**
 * Widget Class Processor
 *
 * Handles CSS classes that start with widget-specific prefixes like 'elementor-'
 * These classes contain specific styling that should be applied directly to widgets
 * instead of being processed as global classes.
 */
class Widget_Class_Processor implements Css_Processor_Interface
{

    private $current_selector = '';
    private $specificity_calculator;
    private $selector_matcher;

    private const WIDGET_CLASS_PREFIX = 'elementor-';
    private const E_CON_PREFIX = 'e-con';

    // Classes that should be filtered out (not preserved in final widgets)
    // Note: element-specific and widget-specific classes are preserved via should_filter_class() logic
    private const FILTERED_ELEMENTOR_CLASSES = [
    'e-con-boxed',
    'e-flex',
    'e-parent',
    'e-child',
    'e-lazyloaded',
    'elementor-element', // Generic class, but element-specific ones (elementor-element-XXXXX) are preserved
    'elementor-widget',  // Generic class, but widget-specific ones (elementor-widget-XXXXX) are preserved
    'elementor-section',
    'elementor-column',
    'elementor-container',
    'loading', // Remove loading state classes
    ];

    public function __construct()
    {
        $this->specificity_calculator = new Css_Specificity_Calculator();
        $this->selector_matcher = new \Elementor\Modules\CssConverter\Services\Css\Processing\Selector_Matcher_Engine();
    }

    public function get_processor_name(): string
    {
        return 'widget_class';
    }

    public function get_priority(): int
    {
        return 11; // Very early: Before reset styles processor to prevent widget classes from being treated as reset styles
    }

    public function supports_context( Css_Processing_Context $context ): bool
    {
        $css_rules = $context->get_metadata('css_rules', []);
        $widgets = $context->get_widgets();
        return ! empty($css_rules) && ! empty($widgets);
    }

    public function process( Css_Processing_Context $context ): Css_Processing_Context
    {
        $css_rules = $context->get_metadata('css_rules', []);
        $widgets = $context->get_widgets();
        $css_variable_definitions = $context->get_metadata('css_variable_definitions', []);

        if (empty($css_rules) || empty($widgets) ) {
            return $context;
        }

        $widget_classes = $this->extract_widget_classes_from_widgets($widgets);
        $widget_specific_rules = $this->extract_widget_specific_rules($css_rules, $widget_classes);

        if (empty($widget_specific_rules) ) {
            $context->set_metadata('css_rules', $css_rules);
            
            // CRITICAL FIX: Add statistics even when no rules found (for test assertions)
            $context->add_statistic('widget_specific_rules_found', 0);
            $context->add_statistic('widget_classes_processed', count($widget_classes));
            $context->add_statistic('widget_styles_applied', 0);
            
            return $context;
        }

        $styles_applied = $this->apply_widget_specific_styles($widget_specific_rules, $widgets, $context);

        // Remove processed rules from css_rules so they don't get processed as global classes
        $remaining_rules = $this->remove_processed_rules($css_rules, $widget_specific_rules);
        
        $context->set_metadata('css_rules', $remaining_rules);

        // COMMENTED OUT: Hardcoded widget class removal logic
        // This was preventing CSS selector matching from working
        // $widget_classes_to_remove = array_filter(
        //     $widget_classes, function ( $class ) {
        //         return $this->is_widget_class( $class );
        //     }
        // );
        
        $widget_classes_to_remove = [];

        $css_class_modifiers = $context->get_metadata('css_class_modifiers', []);
        $css_class_modifiers[] = [
        'type' => 'widget-classes',
        'mappings' => $widget_classes_to_remove,
        ];

        $context->set_metadata('css_class_modifiers', $css_class_modifiers);

        // Add statistics
        $context->add_statistic('widget_specific_rules_found', count($widget_specific_rules));
        $context->add_statistic('widget_classes_processed', count($widget_classes));
        $context->add_statistic('widget_styles_applied', $styles_applied);

        return $context;
    }

    public function get_statistics_keys(): array
    {
        return [
        'widget_specific_rules_found',
        'widget_classes_processed',
        'widget_styles_applied',
        ];
    }

    private function extract_widget_classes_from_widgets( array $widgets ): array
    {
        $widget_classes = [];
        $this->recursively_extract_widget_classes($widgets, $widget_classes);
        return array_unique($widget_classes);
    }

    private function recursively_extract_widget_classes( array $widgets, array &$widget_classes ): void
    {
        foreach ( $widgets as $widget ) {
            $classes_string = $widget['attributes']['class'] ?? '';
            if (! empty($classes_string) ) {
                $classes_array = explode(' ', $classes_string);
                foreach ( $classes_array as $class_name ) {
                    $class_name = trim($class_name);
                    if ($this->is_widget_class($class_name) ) {
                        $widget_classes[] = $class_name;
                    }
                }
            }

            if (! empty($widget['children']) ) {
                $this->recursively_extract_widget_classes($widget['children'], $widget_classes);
            }
        }
    }

    private function is_widget_class( string $class_name ): bool
    {
        return 0 === strpos($class_name, self::WIDGET_CLASS_PREFIX) ||
        0 === strpos($class_name, self::E_CON_PREFIX);
    }

    private function should_skip_complex_selector( string $selector ): bool
    {
        $trimmed = trim($selector);

        if ($this->is_widget_targeting_complex_selector($trimmed) ) {
            return false;
        }

        if ($this->is_selector_with_element_tag_child($trimmed) ) {
            // REFINED: Only skip selectors with DIRECT CHILD combinators (>a, >img)
            // Allow descendant selectors (.elementor-element .elementor-heading-title)
            if ($this->has_direct_child_combinator($trimmed) ) {
                return true; // Skip direct child selectors like >a
            }
            return false; // Allow descendant child selectors
        }

        $space_parts = preg_split('/\s+/', $trimmed);
        if (count($space_parts) > 1 ) {
            preg_match_all('/\.([a-zA-Z0-9_-]+)/', $trimmed, $matches);
            $all_classes = $matches[1] ?? [];

            foreach ( $all_classes as $class ) {
                if ($this->is_widget_class($class) ) {
                    return false;
                }
            }

            return true;
        }

        if (preg_match('/[+~]/', $trimmed) ) {
            return true;
        }

        return false;
    }

    private function is_selector_with_element_tag_child( string $selector ): bool
    {
        // FIXED: Properly detect child element selectors with combinators
        $element_tags = [ 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav', 'ul', 'ol', 'li', 'button', 'input', 'textarea', 'select', 'label', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot' ];

        // Check for direct child combinator patterns: >element
        foreach ( $element_tags as $tag ) {
            if (preg_match('/>' . preg_quote($tag, '/') . '(?:[\.:\[#]|$)/', $selector) ) {
                // Found direct child element, check if selector has widget classes
                preg_match_all('/\.([a-zA-Z0-9_-]+)/', $selector, $matches);
                $all_classes = $matches[1] ?? [];

                foreach ( $all_classes as $class ) {
                    if ($this->is_widget_class($class) ) {
                        return true; // Skip this selector - it targets child elements
                    }
                }
            }
        }

        // Check for descendant selectors ending with element tags
        $parts = preg_split('/\s+/', trim($selector));
        $last_part = end($parts);

        // Clean up combinators
        $last_part = preg_replace('/[>+~]/', '', $last_part);
        $last_part = trim($last_part);

        foreach ( $element_tags as $tag ) {
            if (preg_match('/^' . preg_quote($tag, '/') . '(?:[\.:\[#]|$)/', $last_part) ) {
                preg_match_all('/\.([a-zA-Z0-9_-]+)/', $selector, $matches);
                $all_classes = $matches[1] ?? [];

                foreach ( $all_classes as $class ) {
                    if ($this->is_widget_class($class) ) {
                        return true; // Skip this selector - it targets child elements
                    }
                }
            }
        }

        return false;
    }

    private function has_direct_child_combinator( string $selector ): bool
    {
        // CRITICAL FIX: Only match >element (not >.class)
        // Pattern: > followed by a letter that's NOT preceded by a dot
        // This allows >.e-con-inner but skips >img, >a, etc.
        return preg_match('/>[a-zA-Z][^\.]*(?:\.|:|$)/', $selector) && 
               !preg_match('/>\.[a-zA-Z]/', $selector);
    }

    private function is_widget_targeting_complex_selector( string $selector ): bool
    {
        $patterns_to_allow = [
        '/\.elementor-element\s+\.elementor-widget-container/',
        '/\.elementor-element:not\(:has\(\.elementor-widget-container\)\)/',
        '/\.elementor-widget-wrap\s*>\s*\.elementor-element/',
        ];

        foreach ( $patterns_to_allow as $pattern ) {
            if (preg_match($pattern, $selector) ) {
                return true;
            }
        }

        return false;
    }

    private function is_malformed_selector( string $selector ): bool
    {
        $trimmed = trim($selector);

        // Check for malformed selectors:
        // - Unmatched parentheses
        // - Invalid characters
        // - Empty selectors

        if (empty($trimmed) ) {
            return true;
        }

        // Check for unmatched closing parentheses
        if (preg_match('/\)[^(]*$/', $trimmed) && ! preg_match('/\([^)]*\)/', $trimmed) ) {
            return true;
        }

        return false;
    }

    private function extract_widget_specific_rules( array $css_rules, array $widget_classes ): array
    {
        $widget_rules = [];

        foreach ( $css_rules as $rule ) {
            $selector = $rule['selector'] ?? '';

            $this->current_selector = $selector;
            
            // CRITICAL FIX: Skip Kit CSS selectors - they should be processed by CSS Variable Registry Processor, not Widget Class Processor
            if ( strpos( $selector, 'elementor-kit-' ) !== false ) {
                continue; // Skip Kit CSS - let it pass through to other processors
            }

            if ($this->should_skip_complex_selector($selector) ) {
                continue;
            }

            $selector_classes = $this->extract_classes_from_selector($selector);

            if ($this->selector_contains_widget_classes($selector_classes) ) {

                $widget_rules[] = [
                'selector' => $selector,
                'properties' => $rule['properties'] ?? [],
                'target_classes' => $selector_classes,
                'full_selector' => $selector,
                'specificity' => $this->calculate_selector_specificity($selector),
                ];

            }
        }

        return $widget_rules;
    }

    /**
     * FIX #4: Extract target classes from selector (last part of nested selectors)
     * FIX: Handle selectors ending with element tags (img, h1, p, etc.)
     */
    private function extract_classes_from_selector( string $selector ): array
    {
        $parts = preg_split('/\s+/', trim($selector));
        $target_part = end($parts);

        $element_tags = [ 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav', 'ul', 'ol', 'li', 'button', 'input', 'textarea', 'select', 'label', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot' ];

        $is_element_tag_only = false;

        foreach ( $element_tags as $tag ) {
            if (preg_match('/^' . preg_quote($tag, '/') . '(?:[\.:\[#]|$)/', $target_part) ) {
                $is_element_tag_only = true;
                break;
            }
        }

        if ($is_element_tag_only ) {
            preg_match_all('/\.([a-zA-Z0-9_-]+)/', $selector, $matches);
            $all_classes = $matches[1] ?? [];

            $widget_classes = array_filter(
                $all_classes, function ( $class ) {
                    return $this->is_widget_class($class);
                } 
            );

            return array_values($widget_classes);
        }

        preg_match_all('/\.([a-zA-Z0-9_-]+)/', $target_part, $matches);
        $target_classes = $matches[1] ?? [];

        if (empty($target_classes) ) {
            preg_match_all('/\.([a-zA-Z0-9_-]+)/', $selector, $matches);
            $target_classes = $matches[1] ?? [];
        }

        return $target_classes;
    }

    private function extract_child_element_tag_from_selector( string $selector ): ?string
    {
        $parts = preg_split('/\s+/', trim($selector));
        $last_part = end($parts);

        $element_tags = [ 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'span', 'div', 'section', 'article', 'aside', 'header', 'footer', 'main', 'nav', 'ul', 'ol', 'li', 'button', 'input', 'textarea', 'select', 'label', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot' ];

        foreach ( $element_tags as $tag ) {
            if (preg_match('/^' . preg_quote($tag, '/') . '(?:[\.:\[#]|$)/', $last_part) ) {
                return $tag;
            }
        }

        return null;
    }

    private function find_child_widgets_by_tag( array $parent_element_ids, string $child_tag, array $all_widgets ): array
    {
        $child_widgets = [];

        foreach ( $parent_element_ids as $parent_element_id ) {
            if (is_array($parent_element_id) ) {
                $parent_widget = $parent_element_id;
            } else {
                $parent_widget = $this->find_widget_by_element_id($parent_element_id, $all_widgets);
            }

            if ($parent_widget && ! empty($parent_widget['children']) ) {
                $this->recursively_find_child_widgets_by_tag($parent_widget['children'], $child_tag, $child_widgets);
            }
        }

        return array_unique($child_widgets);
    }

    private function find_widget_by_element_id( string $element_id, array $widgets ): ?array
    {
        foreach ( $widgets as $widget ) {
            if (( $widget['element_id'] ?? '' ) === $element_id ) {
                return $widget;
            }

            if (! empty($widget['children']) ) {
                $found = $this->find_widget_by_element_id($element_id, $widget['children']);
                if ($found ) {
                    return $found;
                }
            }
        }

        return null;
    }

    private function recursively_find_child_widgets_by_tag( array $widgets, string $target_tag, array &$result ): void
    {
        foreach ( $widgets as $widget ) {
            $widget_tag = $widget['original_tag'] ?? $widget['tag'] ?? '';
            if ($widget_tag === $target_tag ) {
                $element_id = $widget['element_id'] ?? null;
                if ($element_id ) {
                    $result[] = $element_id;
                }
            }

            if (! empty($widget['children']) ) {
                $this->recursively_find_child_widgets_by_tag($widget['children'], $target_tag, $result);
            }
        }
    }

    private function apply_styles_to_widget_atomically(
        string $element_id,
        array $converted_properties,
        Css_Processing_Context $context,
        array $widgets,
        string $selector = '',
        int $specificity = 0
    ): void {
        $unified_style_manager = $context->get_metadata('unified_style_manager');

        if (! $unified_style_manager ) {
            return;
        }

        $widget = $this->find_widget_by_element_id_recursive($element_id, $widgets);
        $widget_type = $widget['widget_type'] ?? '';

        if (empty($widget_type) ) {
            return;
        }

        foreach ( $converted_properties as $property_data ) {
            $unified_style_manager->collect_element_styles(
                $widget_type,
                [ $property_data ],
                $element_id,
                $selector,
                $specificity
            );
        }
    }

    private function selector_contains_widget_classes( array $selector_classes ): bool
    {
        foreach ( $selector_classes as $class_name ) {
            if ($this->is_widget_class($class_name) ) {
                return true;
            }
        }
        return false;
    }

    private function calculate_selector_specificity( string $selector ): int
    {
        // Simple specificity calculation
        $id_count = substr_count($selector, '#');
        $class_count = substr_count($selector, '.');
        $element_count = preg_match_all('/\b[a-z]+\b/', $selector);
        // CSS specificity: IDs worth 100, classes worth 10, elements worth 1
        return ( $id_count * 100 ) + ( $class_count * 10 ) + $element_count;
    }

    private function apply_widget_specific_styles( array $widget_rules, array $widgets, Css_Processing_Context $context ): int
    {
        $unified_style_manager = $context->get_metadata('unified_style_manager');

        if (! $unified_style_manager ) {
            $unified_style_manager = new \Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager(
                new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator(),
                new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service()
            );
            $context->set_metadata('unified_style_manager', $unified_style_manager);
        }

        // Use shared property converter from context
        $property_conversion_service = $context->get_metadata('property_converter');
        if (! $property_conversion_service ) {
            // Fallback: create new instance with collector
            $custom_css_collector = $context->get_metadata('custom_css_collector');
            if (! $custom_css_collector ) {
                $custom_css_collector = new \Elementor\Modules\CssConverter\Services\Css\Custom_Css_Collector();
                $context->set_metadata('custom_css_collector', $custom_css_collector);
            }
            $property_conversion_service = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service($custom_css_collector);
        }
        $styles_applied = 0;

        foreach ( $widget_rules as $rule ) {
            $selector = $rule['selector'];
            $properties = $rule['properties'];
            $target_classes = $rule['target_classes'] ?? [];
            $full_selector = $rule['full_selector'] ?? $selector;

            // Set current selector for element-specific matching
            $this->current_selector = $full_selector;

			try {
				$matching_element_ids = $this->selector_matcher->find_matching_widgets($selector, $widgets);
				$matching_widgets = $this->get_widgets_by_element_ids($matching_element_ids, $widgets);
            } catch ( \InvalidArgumentException $e ) {
                continue;
            }

            if (! empty($matching_widgets) ) {
                $this->extract_and_store_variable_references($properties, $context);

                // Get element ID from the first matching widget for custom CSS collection
                $first_widget = reset($matching_widgets);
                $widget_element_id = $first_widget['element_id'] ?? '';

                $converted_properties = $this->convert_properties_to_atomic($properties, $property_conversion_service, $context, $widget_element_id);

                $child_element_tag = $this->extract_child_element_tag_from_selector($selector);

                // Calculate specificity for this selector
                $specificity = $this->specificity_calculator->calculate_specificity($selector);


                if ($child_element_tag ) {
                    $child_widgets = $this->find_child_widgets_by_tag($matching_widgets, $child_element_tag, $widgets);

                    if (! empty($child_widgets) ) {
                        foreach ( $child_widgets as $child_element_id ) {
                            $this->apply_styles_to_widget_atomically(
                                $child_element_id,
                                $converted_properties,
                                $context,
                                $widgets,
                                $selector,
                                $specificity
                            );
                        }
                        $styles_applied += count($child_widgets);
                    }
                } else {
                    // Extract element_ids from matching widgets
                    $matched_element_ids = array_map(
                        function ( $widget ) {
                            return $widget['element_id'] ?? null;
                        }, $matching_widgets 
                    );
                    $matched_element_ids = array_filter($matched_element_ids);

                    $unified_style_manager->collect_css_selector_styles(
                        $selector,
                        $converted_properties,
                        $matched_element_ids
                    );
                    $styles_applied += count($matched_element_ids);
                }
            }
        }

        return $styles_applied;
    }

    private function convert_properties_to_atomic( array $properties, $property_conversion_service, Css_Processing_Context $context, string $widget_element_id = '' ): array
    {
        $converted_properties = [];
        $widget_id = ! empty($widget_element_id) ? $widget_element_id : 'widget-' . uniqid();

        foreach ( $properties as $property_data ) {
            $property = $property_data['property'] ?? '';
            $value = $property_data['value'] ?? '';
            $important = $property_data['important'] ?? false;

            if (strpos($property, '--') === 0 ) {
                continue;
            }

            $converted = $property_conversion_service->convert_property_to_v4_atomic($property, $value, $widget_id, $important);

            if ($converted !== null ) {
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
    private function find_widgets_matching_selector_classes( array $selector_classes, array $widgets ): array
    {
        $matching_widgets = [];

        // Extract widget classes from selector (excluding element-specific classes)
        $widget_classes = array_filter(
            $selector_classes, function ( $class ) {
                return $this->is_widget_class($class);
            } 
        );

        if (! empty($widget_classes) ) {
            $this->recursively_find_widgets_with_all_classes($widget_classes, $widgets, $matching_widgets);
        }

        return $matching_widgets;
    }

    private function find_widgets_with_all_classes( array $required_classes, array $widgets ): array
    {
        $matching_widgets = [];
        $this->recursively_find_widgets_with_all_classes($required_classes, $widgets, $matching_widgets);
        return $matching_widgets;
    }

    private function find_widgets_with_widget_class( array $widgets ): array
    {
        $matching_widgets = [];
        $this->recursively_find_widgets_with_widget_class($widgets, $matching_widgets);
        return $matching_widgets;
    }

    private function recursively_find_widgets_with_widget_class( array $widgets, array &$matching_widgets ): void
    {
        foreach ( $widgets as $widget ) {
            $classes_string = $widget['attributes']['class'] ?? '';
            if (! empty($classes_string) ) {
                $widget_classes = explode(' ', $classes_string);

                foreach ( $widget_classes as $class_name ) {
                    if ($this->is_widget_class($class_name) ) {
                        $matching_widgets[] = $widget;
                        break;
                    }
                }
            }

            if (! empty($widget['children']) ) {
                $this->recursively_find_widgets_with_widget_class($widget['children'], $matching_widgets);
            }
        }
    }


    private function recursively_find_widgets_with_all_classes( array $required_classes, array $widgets, array &$matching_widgets ): void
    {
        foreach ( $widgets as $widget ) {
            $classes_string = $widget['attributes']['class'] ?? '';
            if (! empty($classes_string) ) {
                $widget_classes = explode(' ', $classes_string);

                // Check if widget has ALL required classes
                $has_all_classes = true;
                foreach ( $required_classes as $required_class ) {
                    if (! in_array($required_class, $widget_classes, true) ) {
                        $has_all_classes = false;
                        break;
                    }
                }

                if ($has_all_classes ) {
                    $matching_widgets[] = $widget;
                }
            }

            if (! empty($widget['children']) ) {
                $this->recursively_find_widgets_with_all_classes($required_classes, $widget['children'], $matching_widgets);
            }
        }
    }



    private function remove_processed_rules( array $css_rules, array $widget_rules ): array
    {
        $processed_selectors = array_column($widget_rules, 'selector');

        $remaining_rules = [];
        $removed_count = 0;

        foreach ( $css_rules as $rule ) {
            $selector = $rule['selector'] ?? '';

            // FIXED: Remove ANY rule that was processed by Widget Class Processor
            // If we successfully applied it to widgets via widget-specific classes,
            // we should NOT let it be processed again as a global class
            if (in_array($selector, $processed_selectors, true) ) {
                // Remove this rule - it was processed by Widget Class Processor
                ++$removed_count;
                continue;
            }

            $remaining_rules[] = $rule;
        }

        return $remaining_rules;
    }

    private function selector_contains_only_widget_classes( string $selector ): bool
    {
        // Extract all class names from the selector
        preg_match_all('/\.([a-zA-Z0-9_-]+)/', $selector, $matches);

        if (empty($matches[1]) ) {
            return false; // No classes found
        }

        $class_names = $matches[1];

        // Check if ALL classes are widget-specific
        foreach ( $class_names as $class_name ) {
            if (! $this->is_widget_class($class_name) ) {
                return false; // Found a non-widget class
            }
        }

        return true; // All classes are widget-specific
    }

    private function extract_and_store_variable_references( array $properties, Css_Processing_Context $context ): void
    {
        $widget_variable_references = $context->get_metadata('widget_variable_references', []);

        foreach ( $properties as $property_data ) {
            $value = $property_data['value'] ?? '';

            if (empty($value) ) {
                continue;
            }

            preg_match_all('/var\(\s*--([a-zA-Z0-9_-]+)/', $value, $matches);

            if (! empty($matches[1]) ) {
                foreach ( $matches[1] as $var_name ) {
                    $clean_name = $this->clean_variable_name($var_name);
                    $widget_variable_references[] = $clean_name;
                }
            }
        }

        $context->set_metadata('widget_variable_references', array_unique($widget_variable_references));
    }

    private function clean_variable_name( string $var_name ): string
    {
        $clean_name = ltrim($var_name, '-');
        return sanitize_key($clean_name);
    }

    private function get_widgets_by_element_ids( array $element_ids, array $widgets ): array
    {
        $matching_widgets = [];

        foreach ( $element_ids as $element_id ) {
            $widget = $this->find_widget_by_element_id_recursive($element_id, $widgets);
            if ($widget ) {
                $matching_widgets[] = $widget;
            }
        }

        return $matching_widgets;
    }

    private function find_widget_by_element_id_recursive( string $element_id, array $widgets ): ?array
    {
        foreach ( $widgets as $widget ) {
            if (( $widget['element_id'] ?? '' ) === $element_id ) {
                return $widget;
            }

            if (! empty($widget['children']) ) {
                $found = $this->find_widget_by_element_id_recursive($element_id, $widget['children']);
                if ($found ) {
                    return $found;
                }
            }
        }

        return null;
    }

    /**
     * NEW: Helper method to get widget classes as array
     */
    private function get_widget_classes_array( array $widget ): array
    {
        $classes_string = $widget['attributes']['class'] ?? '';
        if (empty($classes_string) ) {
            return [];
        }
        return array_filter(explode(' ', $classes_string));
    }

    /**
     * SIMPLIFIED: Only filter classes that are definitely not needed for CSS matching
     * Remove hardcoded logic that was causing selector matching failures
     */
    private function should_filter_class( string $class ): bool
    {
        // COMMENTED OUT: All hardcoded filtering logic
        // The general widget class patterns should be sufficient
        
        // // Keep e-con and e-con-inner for CSS targeting
        // if ($class === 'e-con' || $class === 'e-con-inner' ) {
        //     return false;
        // }

        // // Keep element-specific classes (elementor-element-XXXXXX) for CSS targeting
        // if (preg_match('/^elementor-element-[a-z0-9]+$/i', $class) ) {
        //     return false;
        // }

        // // Keep widget-specific classes (elementor-widget-XXXXXX) for CSS targeting
        // if (preg_match('/^elementor-widget-[a-z0-9-]+$/i', $class) ) {
        //     return false;
        // }

        // // Filter out page wrapper classes (elementor-1140, elementor-kit-123, etc.)
        // // These are removed from HTML but remain available during CSS matching
        // if ( preg_match( '/^elementor-(\d+|kit-\d+)$/i', $class ) ) {
        //     return true;
        // }

        // // Filter out other Elementor structural classes
        // foreach ( self::FILTERED_ELEMENTOR_CLASSES as $pattern ) {
        //     if (strpos($class, $pattern) === 0 ) {
        //         // Exception: don't filter element-specific or widget-specific classes
        //         if (strpos($class, 'elementor-element-') === 0 || strpos($class, 'elementor-widget-') === 0 ) {
        //             return false;
        //         }
        //         return true;
        //     }
        // }

        // SIMPLIFIED: Don't filter anything - let CSS matching work naturally
        return false;
    }

    /**
     * Find widgets with e-con-inner class that are children of widgets with e-con class
     * This handles the specific selector .e-con>.e-con-inner
     */
    private function find_e_con_inner_children_of_e_con_parents( array $widgets ): array
    {
        $matching_widgets = [];

        // Find all widgets with e-con class (potential parents)
        $e_con_widgets = [];
        $this->find_widgets_with_class_recursively($widgets, 'e-con', $e_con_widgets);

        // For each e-con widget, check its direct children for e-con-inner class
        foreach ( $e_con_widgets as $e_con_widget ) {
            $children = $e_con_widget['children'] ?? [];

            foreach ( $children as $child ) {
                $child_classes = $child['attributes']['class'] ?? '';
                if (strpos($child_classes, 'e-con-inner') !== false ) {
                    $matching_widgets[] = $child;
                }
            }
        }

        return $matching_widgets;
    }

    /**
     * Find widgets with a specific class recursively
     */
    private function find_widgets_with_class_recursively( array $widgets, string $target_class, array &$result ): void
    {
        foreach ( $widgets as $widget ) {
            $classes = $widget['attributes']['class'] ?? '';
            if (strpos($classes, $target_class) !== false ) {
                $result[] = $widget;
            }

            if (! empty($widget['children']) ) {
                $this->find_widgets_with_class_recursively($widget['children'], $target_class, $result);
            }
        }
    }

    private function find_target_rule_in_rules( array $css_rules, string $element_id, string $class_name ): array
    {
        foreach ( $css_rules as $rule ) {
            $selector = $rule['selector'] ?? '';

            // Look for our target selector
            if (strpos($selector, $element_id) !== false && strpos($selector, $class_name) !== false ) {
                $properties = [];
                foreach ( $rule['properties'] ?? [] as $prop ) {
                    $prop_name = $prop['property'] ?? '';
                    $prop_value = $prop['value'] ?? '';
                    if (in_array($prop_name, [ 'font-weight', 'color', 'font-size' ], true) ) {
                        $properties[ $prop_name ] = $prop_value;
                    }
                }
                return $properties;
            }
        }

        return [];
    }


    private function extract_processed_widget_classes( array $widget_specific_rules ): array {
        $processed_classes = [];
        
        foreach ( $widget_specific_rules as $rule ) {
            $target_classes = $rule['target_classes'] ?? [];
            
            foreach ( $target_classes as $class ) {
                if ( $this->is_widget_class( $class ) ) {
                    $processed_classes[] = $class;
                }
            }
        }
        
        return array_unique( $processed_classes );
    }

    private function collect_all_element_ids_recursively( array $widgets, array &$element_ids ): void {
        foreach ( $widgets as $widget ) {
            $element_id = $widget['element_id'] ?? null;
            if ( $element_id ) {
                $element_ids[] = $element_id;
            }
            
            if ( ! empty( $widget['children'] ) ) {
                $this->collect_all_element_ids_recursively( $widget['children'], $element_ids );
            }
        }
    }


}

