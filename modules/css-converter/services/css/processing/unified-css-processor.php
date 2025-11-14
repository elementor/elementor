<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if (! defined('ABSPATH') ) {
    exit;
}

use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Processor_Factory;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

class Unified_Css_Processor
{

    private $css_parser;
    private $property_converter;
    private $specificity_calculator;
    private $unified_style_manager;
    private $reset_style_detector;
    private $html_class_modifier;
    private $css_variable_definitions;
    private $css_output_optimizer;
    public function __construct(
        $css_parser,
        $property_converter,
        Css_Specificity_Calculator $specificity_calculator
    ) {
        $this->css_parser = $css_parser;
        $this->property_converter = $property_converter;
        $this->specificity_calculator = $specificity_calculator;
        $this->unified_style_manager = new Unified_Style_Manager(
            $specificity_calculator,
            $property_converter
        );
        $this->reset_style_detector = new Reset_Style_Detector($specificity_calculator);
        $this->css_variable_definitions = [];
        $this->css_output_optimizer = new Css_Output_Optimizer();
        $this->initialize_html_class_modifier();
    }
    private function initialize_html_class_modifier(): void
    {
        $this->html_class_modifier = new \Elementor\Modules\CssConverter\Services\Css\Html_Class_Modifier_Service();
    }
    public function process_css_and_widgets( string $css, array $widgets, array $options = [] ): array
    {

        // Create processing context with input data
        $context = new Css_Processing_Context();
        $context->set_metadata('css', $css);
        $context->set_widgets($widgets);
        $context->set_metadata('options', $options);
        $context->set_metadata('existing_global_class_names', $this->get_existing_global_class_names());

        // Set the custom CSS collector in context so processors can use the same instance
        if (method_exists($this->property_converter, 'get_custom_css_collector') ) {
            $custom_css_collector = $this->property_converter->get_custom_css_collector();
            $context->set_metadata('custom_css_collector', $custom_css_collector);
        }

        // Set the shared property converter in context so all processors use the same instance
        $context->set_metadata('property_converter', $this->property_converter);

        // Execute the complete registry pipeline
        $context = Css_Processor_Factory::execute_css_processing($context);

        // Extract results from context
        // Note: global_classes already includes compound classes (merged by Global_Classes_Processor)
        $processed_widgets = $context->get_widgets();
        $statistics = $context->get_statistics();
        $css_class_rules = $context->get_metadata('css_class_rules', []);
        $css_variable_definitions = $context->get_metadata('css_variable_definitions', []);
        $global_classes = $context->get_metadata('global_classes', []);
        $class_name_mappings = $context->get_metadata('class_name_mappings', []);
        $custom_css_rules = $context->get_metadata('custom_css_rules', []);
        $debug_duplicate_detection = $context->get_metadata('debug_duplicate_detection');
        $css_class_modifiers = $context->get_metadata('css_class_modifiers', []);
        $reset_styles_stats = $context->get_metadata('reset_styles_stats', []);
        $complex_reset_styles = $context->get_metadata('complex_reset_styles', []);
        $html_class_modifications = $context->get_metadata('html_class_modifications', []);
        $html_class_modifier = $context->get_metadata('html_class_modifier');
        $body_styles = $context->get_metadata('body_styles', []);

        // Build legacy result format for backward compatibility
        return [
        'widgets' => $processed_widgets,
        'body_styles' => $body_styles,
        'stats' => $statistics,
        'css_class_rules' => $css_class_rules,
        'css_variable_definitions' => $css_variable_definitions,
        'global_classes' => $global_classes,
        'global_classes_created' => count($global_classes),
        'class_name_mappings' => $class_name_mappings,
        'custom_css_rules' => $custom_css_rules,
        'debug_duplicate_detection' => $debug_duplicate_detection,
        'flattened_classes' => $this->get_flattened_classes_from_unified_structure($context),
        'flattened_classes_count' => $this->count_modifiers_by_type($css_class_modifiers, 'flattening'),
        'compound_classes' => $context->get_metadata('compound_global_classes', []),
        'compound_classes_created' => $this->count_modifiers_by_type($css_class_modifiers, 'compound'),
        'css_class_modifiers' => $css_class_modifiers,
        'reset_styles_detected' => ( $reset_styles_stats['reset_element_styles'] ?? 0 ) > 0 || ( $reset_styles_stats['reset_complex_styles'] ?? 0 ) > 0,
        'reset_styles_stats' => $reset_styles_stats,
        'complex_reset_styles' => $complex_reset_styles,
        'html_class_modifications' => $html_class_modifications,
        'flattening_results' => [
        'flattened_rules' => $this->get_flattened_rules_from_unified_structure($context),
        'class_mappings' => $context->get_metadata('class_mappings', []),
        'flattened_classes' => $this->get_flattened_classes_from_unified_structure($context),
        ],
        'compound_results' => [
        'compound_global_classes' => $context->get_metadata('compound_global_classes', []),
        'compound_mappings' => $context->get_metadata('compound_mappings', []),
        ],
        'html_class_modifier' => $html_class_modifier,
        ];
    }

    // ============================================================================
    // LEGACY CODE SECTION - INACTIVE
    // ============================================================================
    // The methods below are marked as LEGACY and their status is unclear.
    // They were replaced by the processor registry pattern but have not been
    // verified as completely unused.
    //
    // DO NOT DELETE until verification is complete.
    // See: plugins/elementor-css/modules/css-converter/docs/page-testing/0-0----old-code.md
    // ============================================================================

    /**
     * @deprecated 2025-10-28 Replaced by Style_Collection_Processor in processor registry pattern
     * @see        plugins/elementor-css/modules/css-converter/docs/page-testing/0-0--remove-legacy-code.md
     * Status: INACTIVE - Method not called, safe to remove after verification
     */
    private function collect_all_styles_from_sources( string $css, array $widgets ): void
    {
        $this->unified_style_manager->reset();
        $this->collect_css_styles($css, $widgets);
        $this->collect_inline_styles_from_widgets($widgets);
        // REMOVED: Reset styles now handled by Reset_Styles_Processor
        // $this->collect_reset_styles( $css, $widgets );
    }
    /**
     * @deprecated 2025-10-28 Replaced by Style_Collection_Processor in processor registry pattern
     * @see        plugins/elementor-css/modules/css-converter/docs/page-testing/0-0--remove-legacy-code.md
     * Status: INACTIVE - Method not called, safe to remove after verification
     */
    private function collect_all_styles_from_sources_with_flattened_rules(
        string $css,
        array $widgets,
        array $flattened_rules
    ): void {
        $this->unified_style_manager->reset();
        $this->collect_css_styles_from_flattened_rules($flattened_rules, $widgets);
        $this->collect_inline_styles_from_widgets($widgets);
        // REMOVED: Reset styles now handled by Reset_Styles_Processor
        // $this->collect_reset_styles( $css, $widgets );
    }
    /**
     * @deprecated 2025-10-28 Replaced by Css_Parsing_Processor in processor registry pattern
     * @see        plugins/elementor-css/modules/css-converter/docs/page-testing/0-0--remove-legacy-code.md
     * Status: INACTIVE - Method not called, safe to remove after verification
     */
    private function collect_css_styles_from_flattened_rules( array $flattened_rules, array $widgets ): void
    {
        if (empty($flattened_rules) ) {
            return;
        }
        $this->log_css_parsing_start_from_rules($flattened_rules, $widgets);
        $this->analyze_and_apply_direct_element_styles($flattened_rules, $widgets);
        $this->process_css_rules_for_widgets($flattened_rules, $widgets);
    }
    private function log_css_parsing_start_from_rules( array $rules, array $widgets ): void
    {
        // Skip debug logging for performance
    }
    /**
     * @deprecated 2025-10-28 Replaced by Css_Parsing_Processor in processor registry pattern
     * @see        plugins/elementor-css/modules/css-converter/docs/page-testing/0-0--remove-legacy-code.md
     * Status: INACTIVE - Method not called, safe to remove after verification
     */
    private function collect_css_styles( string $css, array $widgets )
    {
        if (empty($css) ) {
            return;
        }
        if (strpos($css, 'h1') !== false ) {
            $h1_matches = [];
            preg_match_all('/h1\s*\{[^}]*\}/', $css, $h1_matches);
            foreach ( $h1_matches[0] as $i => $match ) {
            }
        }
        $this->log_css_parsing_start($css, $widgets);
        $rules = $this->parse_css_and_extract_rules($css);
        $h1_rules_found = 0;
        foreach ( $rules as $rule ) {
            if (isset($rule['selector']) && $rule['selector'] === 'h1' ) {
                ++$h1_rules_found;
            }
        }
        $this->log_extracted_rules($rules);
        $this->analyze_and_apply_direct_element_styles($rules, $widgets);
        $this->process_css_rules_for_widgets($rules, $widgets);
    }
    private function log_css_parsing_start( string $css, array $widgets ): void
    {
    }
    /**
     * @deprecated Use Css_Parsing_Processor via registry pattern instead
     */
    private function parse_css_and_extract_rules( string $css ): array
    {
        // Delegate to registry pattern for backward compatibility
        $context = new Css_Processing_Context();
        $context->set_metadata('css', $css);

        $processor = new \Elementor\Modules\CssConverter\Services\Css\Processing\Processors\Css_Parsing_Processor($this->css_parser);
        $context = $processor->process($context);

        return $context->get_metadata('css_rules', []);
    }
    private function log_extracted_rules(): void
    {
        $this->skip_debug_logging_for_performance();
    }
    private function is_simple_element_selector( string $selector ): bool
    {
        // Check if selector is a simple element selector (p, h1, div, etc.)
        return preg_match('/^[a-zA-Z][a-zA-Z0-9]*$/', trim($selector));
    }
    private function infer_html_tag_from_widget_type( string $widget_type, array $widget ): string
    {
        // Map widget types to HTML tags
        $widget_to_tag_map = [
        'e-paragraph' => 'p',
        'e-heading' => $this->infer_heading_tag_from_widget($widget),
        'e-div-block' => 'div',
        'e-flexbox' => 'div',
        ];
        return $widget_to_tag_map[ $widget_type ] ?? '';
    }
    private function infer_heading_tag_from_widget( array $widget ): string
    {
        // Try to infer heading tag from widget settings or default to h1
        $settings = $widget['settings'] ?? [];
        $tag = $settings['tag'] ?? 'h1';
        return in_array($tag, [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ]) ? $tag : 'h1';
    }
    private function prepare_properties_for_collection( array $properties ): array
    {
        $converted_properties = [];
        foreach ( $properties as $property => $value ) {
            $property_name = $value['property'] ?? $property;
            $property_value = $value['value'] ?? $value;
            $important = $value['important'] ?? false;
            $converted = $this->convert_property_if_needed($property_name, $property_value);
            $converted_properties[] = [
            'property' => $property_name,
            'value' => $property_value,
            'original_property' => $property_name,
            'original_value' => $property_value,
            'important' => $important,
            'converted_property' => $converted,
            ];
        }
        return $converted_properties;
    }
    /**
     * @deprecated 2025-10-28 Replaced by Reset_Styles_Processor in processor registry pattern
     * @see        plugins/elementor-css/modules/css-converter/docs/page-testing/0-0--remove-legacy-code.md
     * Status: CRITICAL - Handles element reset styles, replaced by Reset_Styles_Processor
     */
    private function analyze_and_apply_direct_element_styles( array $rules, array $widgets ): void
    {
        foreach ( $rules as $rule ) {
            $selector = $rule['selector'] ?? '';
            $properties = $rule['properties'] ?? [];
            // Skip if not a simple element selector (p, h1, div, etc.)
            if (! $this->is_simple_element_selector($selector) ) {
                continue;
            }
            // Collect element styles for all widgets of this type
            $element_type = $selector;
            foreach ( $widgets as $widget ) {
                $widget_tag = $widget['tag'] ?? '';
                $widget_type = $widget['widget_type'] ?? '';
                $element_id = $widget['element_id'] ?? null;
                // Extract HTML tag from element_id patterns:
                // Pattern 1: "element-p-1" (no HTML ID) -> "p"
                // Pattern 2: "element-text" (has HTML ID) -> check widget metadata
                $html_tag_from_element_id = '';
                if ($element_id ) {
                    if (preg_match('/^element-([a-z0-9]+)-\d+$/', $element_id, $matches) ) {
                        // Pattern 1: element-{tag}-{number}
                        $html_tag_from_element_id = $matches[1];
                    } elseif (preg_match('/^element-([a-z0-9_-]+)$/', $element_id) ) {
                        // Pattern 2: element-{html_id} - need to infer tag from widget type
                        $html_tag_from_element_id = $this->infer_html_tag_from_widget_type($widget_type, $widget);
                    }
                }
                // Check if this widget matches the element type by tag OR element_id
                $tag_matches = ( $widget_tag === $element_type ) || ( $html_tag_from_element_id === $element_type );
                if ($tag_matches && $element_id ) {
                    // Skip if widget has inline styles that would conflict
                    $widget_has_inline_styles = ! empty($widget['attributes']['style'] ?? '');
                    if ($widget_has_inline_styles ) {
                        continue;
                    }
                    $converted_properties = $this->prepare_properties_for_collection($properties);
                    // Use widget_type for element_type so filtering works correctly
                    $this->unified_style_manager->collect_element_styles(
                        $widget_type, // Use widget type (e-paragraph) instead of HTML tag (p)
                        $converted_properties,
                        $element_id
                    );
                }
                // Process children recursively
                if (! empty($widget['children']) ) {
                    $this->analyze_and_apply_direct_element_styles([ $rule ], $widget['children']);
                }
            }
        }
    }
    private function convert_rules_to_analyzer_format( array $rules ): array
    {
        $analyzer_rules = [];
        foreach ( $rules as $rule ) {
            $selector = $rule['selector'];
            $properties = $rule['properties'] ?? [];

            foreach ( $properties as $property_data ) {
                $analyzer_rules[] = [
                 'selector' => $selector,
                 'property' => $property_data['property'],
                 'value' => $property_data['value'],
                 'important' => $property_data['important'] ?? false,
                ];
            }
        }
        return $analyzer_rules;
    }
    private function apply_direct_element_styles_to_widgets( array $rule, array $widgets ): void
    {
        $selector = $rule['selector'];
        $property = $rule['property'];
        $value = $rule['value'];
        $important = $rule['important'] ?? false;
        $matching_widgets = $this->find_widgets_by_element_type($selector, $widgets);
        foreach ( $matching_widgets as $widget_id ) {
            $converted_property = $this->convert_css_property_to_atomic_widget_format($property, $value);
            if ($converted_property ) {
                $this->apply_direct_element_style_with_higher_priority(
                    $widget_id,
                    $selector,
                    [
                    $property => [
                    'value' => $value,
                    'important' => $important,
                    'converted_property' => $converted_property,
                    'source' => 'direct_element_reset',
                    ],
                    ]
                );
            } else {
            }
        }
    }
    private function find_widgets_by_element_type( string $element_selector, array $widgets ): array
    {
        $matching_widget_ids = [];
        $element_to_widget_map = $this->get_html_element_to_atomic_widget_mapping();
        $target_widget_type = $element_to_widget_map[ $element_selector ] ?? $element_selector;

        foreach ( $widgets as $widget ) {
            $widget_tag = $widget['tag'] ?? $widget['widget_type'] ?? '';
            $element_id = $widget['element_id'] ?? null;
            $widget_type = $widget['widget_type'] ?? 'unknown';

            // Try multiple matching strategies:
            // 1. Direct tag match
            if ($widget_tag === $element_selector && $element_id ) {
                $matching_widget_ids[] = $element_id;
                if (! empty($widget['children']) ) {
                    $child_matches = $this->find_widgets_by_element_type($element_selector, $widget['children']);
                    $matching_widget_ids = array_merge($matching_widget_ids, $child_matches);
                }
                continue;
            }

            // 2. Widget type match (e.g., e-heading for h2)
            if ($widget_type === $target_widget_type && $element_id ) {
                $matching_widget_ids[] = $element_id;
                if (! empty($widget['children']) ) {
                    $child_matches = $this->find_widgets_by_element_type($element_selector, $widget['children']);
                    $matching_widget_ids = array_merge($matching_widget_ids, $child_matches);
                }
                continue;
            }

            // 3. Recurse through children
            if (! empty($widget['children']) ) {
                $child_matches = $this->find_widgets_by_element_type($element_selector, $widget['children']);
                $matching_widget_ids = array_merge($matching_widget_ids, $child_matches);
            }
        }

        return $matching_widget_ids;
    }
    /**
     * @deprecated 2025-10-28 Replaced by Nested_Element_Selector_Processor in processor registry pattern
     * @see        plugins/elementor-css/modules/css-converter/docs/page-testing/0-0--remove-legacy-code.md
     * Status: INACTIVE - Method not called, safe to remove after verification
     */
    private function process_css_rules_for_widgets( array $rules, array $widgets ): void
    {
        foreach ( $rules as $rule ) {
            $selector = $rule['selector'];
            $properties = $rule['properties'] ?? [];

            $this->log_rule_processing($selector, $properties);

            if (empty($properties) ) {
                continue;
            }

            // Handle nested selectors with compound classes inside
            $is_nested_compound = $this->is_nested_selector_with_compound_classes($selector);

            if ($is_nested_compound ) {
                $this->apply_widget_specific_styling_for_nested_compound($selector, $properties, $widgets);
                continue;
            }

            // Flattening is now handled by the registry pattern in process_flattening_with_registry()
            // No need to apply flattening here - use the rule as-is
            $processed_rule = $rule;

            $processed_selector = $processed_rule['selector'];
            $processed_properties = $processed_rule['properties'];
            $matched_elements = $this->find_matching_widgets($processed_selector, $widgets);

            $this->log_matched_elements($processed_selector, $matched_elements);

            if (! empty($matched_elements) ) {
                $this->process_matched_rule($processed_selector, $processed_properties, $matched_elements);
            }
        }
    }

    private function is_nested_selector_with_compound_classes( string $selector ): bool
    {
        $has_nesting = strpos($selector, ' ') !== false || strpos($selector, '>') !== false;

        if (! $has_nesting ) {
            return false;
        }

        $has_compound = preg_match('/\.\w+[\w-]*\.\w+/', $selector) === 1;

        if ($has_compound ) {
            return true;
        }

        $has_element_tag_in_last_part = $this->has_element_tag_in_last_selector_part($selector);

        return $has_element_tag_in_last_part;
    }

    private function has_element_tag_in_last_selector_part( string $selector ): bool
    {
        $parts = preg_split('/\s+/', trim($selector));
        if (empty($parts) ) {
            return false;
        }

        $last_part = end($parts);
        $last_part = str_replace('>', '', $last_part);
        $last_part = trim($last_part);

        if (preg_match('/^[a-zA-Z][a-zA-Z0-9]*\./', $last_part) ) {
            return true;
        }

        return \Elementor\Modules\CssConverter\Services\Css\Css_Selector_Utils::is_element_tag($last_part);
    }

    private function apply_widget_specific_styling_for_nested_compound(
        string $selector,
        array $properties,
        array $widgets
    ): void {

        // Extract the target element from the end of the selector
        $target_selector = $this->extract_target_selector($selector);

        if (empty($target_selector) ) {
            return;
        }

        // Find widgets matching the target selector
        $matched_elements = $this->find_matching_widgets($target_selector, $widgets);

        // If no widgets matched by selector and it's a direct element selector, try element type matching
        if (empty($matched_elements) && strpos($target_selector, '.') !== 0 ) {
            // Direct element selector (e.g., "p", "h2")
            $element_type = $target_selector;

            $matched_elements = $this->find_widgets_by_element_type($element_type, $widgets);
        }

        if (empty($matched_elements) ) {
            return;
        }

        // Convert properties to atomic format with proper converted_property values
        $converted_properties = $this->convert_rule_properties_to_atomic($properties);

        // Apply properties via collect_reset_styles which properly handles direct widget styling
        $this->unified_style_manager->collect_reset_styles(
            $target_selector,
            $converted_properties,
            $matched_elements,
            true // can_apply_directly
        );
    }

    private function extract_target_selector( string $selector ): string
    {
        // Get the last part of the selector (after the last space)
        $parts = explode(' ', trim($selector));

        if (empty($parts) ) {
            return '';
        }

        // Get the last part
        $target = end($parts);

        return ! empty($target) ? trim($target) : '';
    }
    private function log_rule_processing(): void
    {
        $this->skip_debug_logging_for_performance();
    }
    private function log_matched_elements(): void
    {
        $this->skip_debug_logging_for_performance();
    }
    private function process_matched_rule( string $selector, array $properties, array $matched_elements ): void
    {
        $converted_properties = $this->convert_rule_properties_to_atomic($properties);
        // ID selectors are now handled by Id_Selector_Processor in the unified registry pattern
        // All remaining selectors are CSS class/element selectors
        $this->unified_style_manager->collect_css_selector_styles(
            $selector,
            $converted_properties,
            $matched_elements
        );
    }
    private function convert_rule_properties_to_atomic( array $properties ): array
    {
        $properties_to_convert = $this->expand_border_shorthand_before_property_mapper_processing($properties);
        $converted_properties = [];
        foreach ( $properties_to_convert as $property_data ) {
            $converted = $this->convert_property_if_needed(
                $property_data['property'],
                $property_data['value']
            );
            $converted_properties[] = [
            'property' => $property_data['property'],
            'value' => $property_data['value'],
            'original_property' => $property_data['property'],
            'original_value' => $property_data['value'],
            'important' => $property_data['important'] ?? false,
            'converted_property' => $converted,
            ];
        }
        return $converted_properties;
    }
    private function expand_border_shorthand_before_property_mapper_processing( array $properties ): array
    {
        include_once __DIR__ . '/css-shorthand-expander.php';
        $simple_props = $this->convert_properties_to_simple_key_value_array($properties);
        $expanded = $this->expand_css_shorthand_properties_using_expander($simple_props);
        $result = $this->convert_expanded_properties_back_to_property_data_format($expanded, $properties);
        $this->skip_debug_logging_for_performance();
        return $result;
    }
    /**
     * @deprecated 2025-10-28 Replaced by Style_Collection_Processor in processor registry pattern
     * @see        plugins/elementor-css/modules/css-converter/docs/page-testing/0-0--remove-legacy-code.md
     * Status: CRITICAL - Handles inline styles collection, replaced by Style_Collection_Processor
     */
    private function collect_inline_styles_from_widgets( array $widgets )
    {
        $this->log_inline_style_collection_start($widgets);
        $this->collect_inline_styles_recursively($widgets);
        $this->log_inline_style_collection_complete();
    }
    private function log_inline_style_collection_start(): void
    {
        $this->skip_debug_logging_for_performance();
    }
    private function log_inline_style_collection_complete(): void
    {
        $this->skip_debug_logging_for_performance();
    }
    private function collect_inline_styles_recursively( array $widgets )
    {
        foreach ( $widgets as $widget ) {
            $element_id = $widget['element_id'] ?? null;
            $inline_css = $widget['inline_css'] ?? [];
            $this->log_widget_inline_processing($element_id, $inline_css);
            if ($element_id && ! empty($inline_css) ) {
                $this->process_widget_inline_styles($element_id, $inline_css);
            }
            $this->process_child_widgets_recursively($widget, $element_id);
        }
    }
    private function log_widget_inline_processing( ?string $element_id, array $inline_css ): void
    {
        // DEBUG: Log inline style processing
        if (! empty($inline_css) ) {
        }
        $this->skip_debug_logging_for_performance();
    }
    private function process_widget_inline_styles( string $element_id, array $inline_css ): void
    {
        $inline_properties = $this->extract_inline_properties($inline_css);
        $batch_converted = $this->convert_properties_batch($inline_properties, $element_id, $inline_css);
        $this->store_converted_inline_styles($element_id, $inline_css, $batch_converted);
    }
    private function extract_inline_properties( array $inline_css ): array
    {
        $inline_properties = [];
        foreach ( $inline_css as $property => $property_data ) {
            $value = $property_data['value'] ?? $property_data;
            $inline_properties[ $property ] = $value;
        }
        return $inline_properties;
    }
    private function store_converted_inline_styles( string $element_id, array $inline_css, array $batch_converted ): void
    {
        // DEBUG: Log inline style storage

        foreach ( $inline_css as $property => $property_data ) {
            $value = $property_data['value'] ?? $property_data;
            $important = $property_data['important'] ?? false;
            $converted = $this->find_converted_property_in_batch($property, $batch_converted);

            $this->unified_style_manager->collect_inline_styles(
                $element_id, [
                $property => [
                'value' => $value,
                'important' => $important,
                'converted_property' => $converted,
                ],
                ]
            );
        }
    }
    private function find_converted_property_in_batch( string $property, array $batch_converted ): ?array
    {
        foreach ( $batch_converted as $atomic_property => $atomic_value ) {
            if ($this->is_property_source_unified($property, $atomic_property) ) {
                return [ $atomic_property => $atomic_value ];
            }
        }
        return null;
    }
    private function process_child_widgets_recursively( array $widget ): void
    {
        if (! empty($widget['children']) ) {
            $this->collect_inline_styles_recursively($widget['children']);
        }
    }
    private function convert_properties_batch( array $properties, string $element_id = null, array $inline_css = [] ): array
    {
        if (! $this->property_converter ) {
            return [];
        }

        if ($element_id ) {
            $converted = [];
            foreach ( $properties as $property => $value ) {
                $important = $inline_css[ $property ]['important'] ?? false;
                $result = $this->property_converter->convert_property_to_v4_atomic($property, $value, $element_id, $important);
                if ($result ) {
                    $converted = array_merge($converted, $result);
                }
            }
            return $converted;
        }

        return $this->property_converter->convert_properties_to_v4_atomic($properties);
    }
    private function is_property_source_unified( string $css_property, string $atomic_property ): bool
    {
        if ($this->is_margin_property_mapping($css_property, $atomic_property) ) {
            return true;
        }
        if ($this->is_padding_property_mapping($css_property, $atomic_property) ) {
            return true;
        }
        if ($this->is_border_radius_property_mapping($css_property, $atomic_property) ) {
            return true;
        }
        return $css_property === $atomic_property;
    }
    private function is_margin_property_mapping( string $css_property, string $atomic_property ): bool
    {
        return 'margin' === $atomic_property && in_array(
            $css_property, [
            'margin',
            'margin-top',
            'margin-right',
            'margin-bottom',
            'margin-left',
            'margin-block-start',
            'margin-block-end',
            'margin-inline-start',
            'margin-inline-end',
            'margin-block',
            'margin-inline',
            ], true
        );
    }
    private function is_padding_property_mapping( string $css_property, string $atomic_property ): bool
    {
        return 'padding' === $atomic_property && in_array(
            $css_property, [
            'padding',
            'padding-top',
            'padding-right',
            'padding-bottom',
            'padding-left',
            'padding-block-start',
            'padding-block-end',
            'padding-inline-start',
            'padding-inline-end',
            'padding-block',
            'padding-inline',
            ], true
        );
    }
    private function is_border_radius_property_mapping( string $css_property, string $atomic_property ): bool
    {
        return 'border-radius' === $atomic_property && in_array(
            $css_property, [
            'border-radius',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'border-start-start-radius',
            'border-start-end-radius',
            'border-end-start-radius',
            'border-end-end-radius',
            ], true
        );
    }
    private function resolve_styles_recursively( array $widgets ): array
    {
        $resolved_widgets = [];
        foreach ( $widgets as $widget ) {
            $widget_id = $this->get_widget_identifier($widget);
            $resolved_styles = $this->unified_style_manager->resolve_styles_for_widget($widget);

            // EVIDENCE: Track font-size in resolved styles
            if (isset($resolved_styles['font-size']) ) {
            }

            $widget['resolved_styles'] = $resolved_styles;
            if (! empty($widget['children']) ) {
                $widget['children'] = $this->resolve_styles_recursively($widget['children']);
            }
            $resolved_widgets[] = $widget;
        }
        return $resolved_widgets;
    }
    private function find_matching_widgets( string $selector, array $widgets ): array
    {
        $matched_elements = [];
        foreach ( $widgets as $widget ) {
            $element_id = $widget['element_id'] ?? null;
            if ($this->selector_matches_widget($selector, $widget) ) {
                if ($element_id ) {
                    $matched_elements[] = $element_id;
                }
            }
            if (! empty($widget['children']) ) {
                $nested_matches = $this->find_matching_widgets($selector, $widget['children']);
                $matched_elements = array_merge($matched_elements, $nested_matches);
            }
        }
        return $matched_elements;
    }
    private function selector_matches_widget( string $selector, array $widget ): bool
    {
        $element_type = $widget['tag'] ?? $widget['widget_type'] ?? '';
        $html_id = $widget['attributes']['id'] ?? '';
        $classes = $widget['attributes']['class'] ?? '';
        $this->log_selector_matching_attempt($selector, $element_type, $classes);
        if ($this->is_element_selector_match($selector, $element_type) ) {
            return true;
        }
        if ($this->is_id_selector_match($selector, $html_id) ) {
            return true;
        }
        if ($this->is_class_selector_match($selector, $classes) ) {
            return true;
        }
        if ($this->is_combined_selector_match($selector, $element_type, $classes, $html_id) ) {
            return true;
        }
        if ($this->is_descendant_id_selector_match($selector, $widget) ) {
            return true;
        }
        return false;
    }
    private function log_selector_matching_attempt( string $selector, string $element_type, string $classes ): void
    {
        $this->skip_debug_logging_for_performance();
    }
    private function is_element_selector_match( string $selector, string $element_type ): bool
    {
        return $selector === $element_type;
    }
    private function is_id_selector_match( string $selector, string $html_id ): bool
    {
        if (strpos($selector, '#') === 0 ) {
            $id_part = substr($selector, 1);
            // Extract only the ID part before any class selectors (e.g., "container" from "container.box")
            $id_from_selector = strpos($id_part, '.') !== false ? substr($id_part, 0, strpos($id_part, '.')) : $id_part;
            $matches = $html_id === $id_from_selector;
            return $matches;
        }
        return false;
    }
    private function is_descendant_id_selector_match( string $selector, array $widget ): bool
    {
        // Handle descendant ID selectors like "#outer #inner"
        if (strpos($selector, ' ') === false || strpos($selector, '#') === false ) {
            return false; // Not a descendant selector with IDs
        }
        // Parse the descendant selector
        $parts = array_map('trim', explode(' ', $selector));
        $target_id_selector = end($parts); // Last part is the target (e.g., "#inner")
        $ancestor_selectors = array_slice($parts, 0, -1); // All parts except the last (e.g., ["#outer"])
        // Check if target matches this widget
        if (! $this->is_id_selector_match($target_id_selector, $widget['attributes']['id'] ?? '') ) {
            return false;
        }
        // Check if any ancestor matches (simplified - in a real implementation, we'd check the widget hierarchy)
        // For now, we'll assume the match is valid if the target ID matches
        // TODO: Implement proper ancestor checking by traversing widget parents
        return true;
    }
    private function is_class_selector_match( string $selector, string $classes ): bool
    {
        if (strpos($selector, '.') === 0 ) {
            $class_from_selector = substr($selector, 1);
            $widget_classes = explode(' ', $classes);
            $is_match = in_array($class_from_selector, $widget_classes, true);
            $this->log_class_match_result($class_from_selector, $widget_classes, $is_match);
            return $is_match;
        }
        return false;
    }
    private function log_class_match_result(): void
    {
        $this->skip_debug_logging_for_performance();
    }
    private function is_combined_selector_match( string $selector, string $element_type, string $classes, string $html_id ): bool
    {
        if (strpos($selector, '#') !== false && strpos($selector, '.') !== false ) {
            if (preg_match('/#([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)/', $selector, $matches) ) {
                $id_from_selector = $matches[1];
                $class_from_selector = $matches[2];
                $id_matches = ( $html_id === $id_from_selector );
                $class_matches = in_array($class_from_selector, explode(' ', $classes), true);
                $combined_match = $id_matches && $class_matches;
                return $combined_match;
            }
        }
        if (strpos($selector, '.') !== false && strpos($selector, '#') === false ) {
            $parts = explode('.', $selector);
            $element_part = $parts[0];

            if (! empty($element_part) && $element_part !== $element_type ) {
                return false;
            }

            $required_classes = array_slice($parts, 1);
            $widget_classes = explode(' ', $classes);

            foreach ( $required_classes as $required_class ) {
                if (! in_array($required_class, $widget_classes, true) ) {
                    return false;
                }
            }

            return true;
        }
        return false;
    }
    private function convert_property_if_needed( string $property, string $value )
    {
        if (! $this->property_converter ) {
            return null;
        }
        try {
            return $this->property_converter->convert_property_to_v4_atomic($property, $value);
        } catch ( \Exception $e ) {
            $this->log_property_conversion_failure($property, $e);
            return null;
        }
    }
    private function log_property_conversion_failure(): void
    {
        $this->skip_debug_logging_for_performance();
    }
    private function skip_debug_logging_for_performance(): void
    {
    }
    private function log_sample_rules_for_debugging( array $rules ): void
    {
    }
    /**
     * Collect reset styles using the new Reset_Style_Detector
     *
     * This method implements the unified-atomic mapper approach for reset styles:
     * 1. Extract element selector rules from CSS
     * 2. Analyze conflicts using Reset_Style_Detector
     * 3. Apply simple element selectors directly to widgets
     * 4. Mark complex selectors for CSS file generation
     */
    private function collect_reset_styles( string $css, array $widgets ): void
    {
        if (empty($css) ) {
            return;
        }
        $all_rules = $this->parse_css_and_extract_rules($css);
        $element_rules = $this->reset_style_detector->extract_element_selector_rules($all_rules);
        if (empty($element_rules) ) {
            return;
        }
        $conflict_analysis = $this->reset_style_detector->analyze_element_selector_conflicts(
            $element_rules,
            $all_rules
        );
        foreach ( $element_rules as $selector => $rules ) {
            $this->process_element_selector_reset_styles($selector, $rules, $conflict_analysis, $widgets);
        }
    }
    /**
     * Process reset styles for a specific element selector
     */
    private function process_element_selector_reset_styles(
        string $selector,
        array $rules,
        array $conflict_analysis,
        array $widgets
    ): void {
        // Check if this selector can be applied directly to widgets
        $can_apply_directly = $this->reset_style_detector->can_apply_directly_to_widgets(
            $selector,
            $conflict_analysis
        );
        if ($can_apply_directly ) {
            // Apply directly to widgets via unified style manager
            $this->apply_reset_styles_directly_to_widgets($selector, $rules, $widgets);
        } else {
            // Mark for CSS file generation
            $this->collect_complex_reset_styles_for_css_file(
                $selector,
                $rules,
                $conflict_analysis[ $selector ] ?? []
            );
        }
    }
    /**
     * Apply reset styles directly to matching widgets
     */
    private function apply_reset_styles_directly_to_widgets(
        string $selector,
        array $rules,
        array $widgets
    ): void {
        $matching_widgets = $this->find_widgets_by_element_type($selector, $widgets);
        if (empty($matching_widgets) ) {
            return;
        }
        $properties = [];
        foreach ( $rules as $rule ) {
            if (isset($rule['properties']) && is_array($rule['properties']) ) {
                foreach ( $rule['properties'] as $property_data ) {
                    $converted = $this->convert_property_if_needed(
                        $property_data['property'] ?? '',
                        $property_data['value'] ?? ''
                    );
                        $properties[] = [
                         'property' => $property_data['property'] ?? '',
                         'value' => $property_data['value'] ?? '',
                         'important' => $property_data['important'] ?? false,
                         'converted_property' => $converted,
                        ];
                }
            } elseif (isset($rule['property']) && isset($rule['value']) ) {
                $converted = $this->convert_property_if_needed(
                    $rule['property'],
                    $rule['value']
                );
                $properties[] = [
                'property' => $rule['property'],
                'value' => $rule['value'],
                'important' => $rule['important'] ?? false,
                'converted_property' => $converted,
                ];
            }
        }
        $this->unified_style_manager->collect_reset_styles(
            $selector,
            $properties,
            $matching_widgets,
            true
        );
    }
    /**
     * Collect complex reset styles for CSS file generation
     */
    private function collect_complex_reset_styles_for_css_file(
        string $selector,
        array $rules,
        array $conflicts
    ): void {
        // Convert rules to properties format
        $properties = [];
        foreach ( $rules as $rule ) {
            foreach ( $rule['properties'] ?? [] as $property_data ) {
                $properties[] = [
                 'property' => $property_data['property'],
                 'value' => $property_data['value'],
                 'important' => $property_data['important'] ?? false,
                ];
            }
        }
        // Collect via unified style manager for CSS file generation
        $this->unified_style_manager->collect_complex_reset_styles(
            $selector,
            $properties,
            $conflicts
        );
    }
    private function analyze_element_selector_conflicts_for_direct_styling(): array
    {
        // Legacy method - now handled by collect_reset_styles
        return [];
    }
    private function convert_css_property_to_atomic_widget_format( string $property, string $value )
    {
        return $this->convert_property_if_needed($property, $value);
    }
    private function apply_direct_element_style_with_higher_priority( string $widget_id, string $selector, array $styles ): void
    {
        $this->unified_style_manager->collect_direct_element_styles($widget_id, $selector, $styles);
    }
    private function get_html_element_to_atomic_widget_mapping(): array
    {
        return [
        'h1' => 'e-heading',
        'h2' => 'e-heading',
        'h3' => 'e-heading',
        'h4' => 'e-heading',
        'h5' => 'e-heading',
        'h6' => 'e-heading',
        'p' => 'e-paragraph',
        'span' => 'e-paragraph',
        'a' => 'e-button',
        'button' => 'e-button',
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
    }
    private function convert_properties_to_simple_key_value_array( array $properties ): array
    {
        $simple_props = [];
        foreach ( $properties as $prop_data ) {
            $simple_props[ $prop_data['property'] ] = $prop_data['value'];
        }
        return $simple_props;
    }
    private function expand_css_shorthand_properties_using_expander( array $simple_props ): array
    {
        return \Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander::expand_shorthand_properties($simple_props);
    }
    private function convert_expanded_properties_back_to_property_data_format( array $expanded, array $original_properties = [] ): array
    {
        // Create a map of original properties to preserve important flags
        $original_important_flags = [];
        foreach ( $original_properties as $prop_data ) {
            $original_important_flags[ $prop_data['property'] ] = $prop_data['important'] ?? false;
        }
        $result = [];
        foreach ( $expanded as $property => $value ) {
            // Preserve the important flag from the original property, default to false if not found
            $important = $original_important_flags[ $property ] ?? false;
            $result[] = [
            'property' => $property,
            'value' => $value,
            'important' => $important,
            ];
        }
        return $result;
    }
    private function get_widget_identifier( array $widget ): string
    {
        $widget_type = $widget['widget_type'] ?? 'unknown';
        $element_id = $widget['element_id'] ?? 'no-element-id';
        return "{$widget_type}#{$element_id}";
    }
    private function extract_rules_from_document( $document ): array
    {
        $rules = [];
        $all_rule_sets = $document->getAllRuleSets();

        foreach ( $all_rule_sets as $index => $rule_set ) {

            if (! method_exists($rule_set, 'getSelectors') ) {
                continue;
            }
            $selectors = $rule_set->getSelectors();
            $declarations = $rule_set->getRules();

            $selector_strings = array_map(
                function ( $s ) {
                    return (string) $s;
                }, $selectors
            );

            $hasElementorKit = false;
            foreach ( $selector_strings as $sel_str ) {
                if (strpos($sel_str, 'elementor-kit') !== false ) {
                    $hasElementorKit = true;
                    $varDeclarationCount = 0;
                    foreach ( $declarations as $decl ) {
                        if (method_exists($decl, 'getRule') ) {
                            $prop = $decl->getRule();
                            if (strpos($prop, '--') === 0 ) {
                                    ++$varDeclarationCount;
                            }
                        }
                    }
                    break;
                }
            }

            $this->extract_css_variable_definitions($selectors, $declarations);

            $extracted_rules = $this->extract_rules_from_selectors($selectors, $declarations);
            $rules = array_merge($rules, $extracted_rules);
        }

        $merged_rules = $this->merge_duplicate_selector_rules($rules);
        return $merged_rules;
    }


    private function extract_rules_from_selectors( array $selectors, array $declarations ): array
    {
        $rules = [];
        foreach ( $selectors as $selector_index => $selector ) {
            $selector_string = (string) $selector;
            $properties = $this->extract_properties_from_declarations($declarations);

            if (! empty($properties) ) {
                $rules[] = [
                 'selector' => $selector_string,
                 'properties' => $properties,
                ];
            }
        }
        return $rules;
    }
    private function extract_properties_from_declarations( array $declarations ): array
    {
        $properties = [];
        foreach ( $declarations as $decl_index => $declaration ) {
            if ($this->is_valid_declaration($declaration) ) {
                $property = $this->create_property_from_declaration($declaration);
                // Skip empty properties (filtered out)
                if (! empty($property) ) {
                    $properties[] = $property;
                }
            }
        }
        return $properties;
    }
    private function is_valid_declaration( $declaration ): bool
    {
        return method_exists($declaration, 'getRule') && method_exists($declaration, 'getValue');
    }
    private function create_property_from_declaration( $declaration ): array
    {
        $property = $declaration->getRule();
        $value = (string) $declaration->getValue();
        $important = method_exists($declaration, 'getIsImportant') ? $declaration->getIsImportant() : false;

        // FILTER: Skip font-family properties (not supported in current implementation)
        if ('font-family' === $property ) {
            error_log( 'CSS_CONVERTER_DEBUG: Skipping font-family property: ' . $property . ' = ' . $value );
            return []; // Return empty array to skip this property
        }

        // DEBUG: Log properties that should be applied
        $should_apply_properties = [ 'display', 'font-size', 'color', 'background-color', 'padding', 'margin', 'width', 'height', 'line-height' ];
        if ( in_array( $property, $should_apply_properties, true ) || strpos( $property, 'font-' ) === 0 || strpos( $property, 'background' ) === 0 ) {
            error_log( 'CSS_CONVERTER_DEBUG: Property extracted: ' . $property . ' = ' . $value . ( $important ? ' !important' : '' ) );
        }

        return [
        'property' => $property,
        'value' => $value,
        'important' => $important,
        ];
    }

    private function merge_duplicate_selector_rules( array $rules ): array
    {
        $grouped_by_selector = [];

        foreach ( $rules as $rule ) {
            $selector = $rule['selector'];
            if (! isset($grouped_by_selector[ $selector ]) ) {
                $grouped_by_selector[ $selector ] = [];
            }
            $grouped_by_selector[ $selector ][] = $rule;
        }

        $merged_rules = [];

        foreach ( $grouped_by_selector as $selector => $selector_rules ) {
            if (1 === count($selector_rules) ) {
                $merged_rules[] = $selector_rules[0];
                continue;
            }

            $merged_properties = [];
            $property_index_map = [];

            foreach ( $selector_rules as $rule_index => $rule ) {
                $properties = $rule['properties'] ?? [];

                foreach ( $properties as $property ) {
                    $property_name = $property['property'] ?? '';
                    $property_value = $property['value'] ?? '';
                    $property_important = $property['important'] ?? false;

                    if (empty($property_name) ) {
                        continue;
                    }

                    if (isset($property_index_map[ $property_name ]) ) {
                        $existing_index = $property_index_map[ $property_name ];
                        $existing_property = $merged_properties[ $existing_index ];
                        $existing_important = $existing_property['important'] ?? false;

                        if ($property_important && ! $existing_important ) {
                            $merged_properties[ $existing_index ] = $property;
                        } elseif (! $property_important && ! $existing_important ) {
                            $merged_properties[ $existing_index ] = $property;
                        }
                    } else {
                        $property_index_map[ $property_name ] = count($merged_properties);
                        $merged_properties[] = $property;
                    }
                }
            }

            $merged_rules[] = [
            'selector' => $selector,
            'properties' => $merged_properties,
            ];
        }

        return $merged_rules;
    }
    public function extract_and_process_css_from_html_and_urls( string $html, array $css_urls, bool $follow_imports, array &$elements ): string
    {
        error_log( 'CSS_CONVERTER_DEBUG: extract_and_process_css_from_html_and_urls called' );
        error_log( 'CSS_CONVERTER_DEBUG: CSS URLs to fetch: ' . count( $css_urls ) );
        error_log( 'CSS_CONVERTER_DEBUG: CSS URLs list: ' . print_r( $css_urls, true ) );
        
        $css_sources = [];
        $html_style_tags = [];
        $inline_element_styles = [];

        // Extract inline <style> tags from HTML (process LAST for correct cascade)
        preg_match_all('/<style[^>]*>(.*?)<\/style>/is', $html, $matches);
        error_log( 'CSS_CONVERTER_DEBUG: Found inline style tags: ' . count( $matches[1] ?? [] ) );
        if (! empty($matches[1]) ) {
            foreach ( $matches[1] as $index => $css_content ) {
                error_log( 'CSS_CONVERTER_DEBUG: Inline style tag ' . $index . ' length: ' . strlen( $css_content ) );

                $html_style_tags[] = [
                 'type' => 'inline_style_tag',
                 'source' => 'inline-style-' . $index,
                 'content' => $css_content,
                ];
            }
        }

        // Extract inline styles from elements and convert to CSS rules (process LAST for correct cascade)
        foreach ( $elements as &$element ) {
            if (isset($element['attributes']['style']) ) {
                $inline_style = $element['attributes']['style'];
                $selector = '.' . ( $element['generated_class'] ?? 'element-' . uniqid() );
                $inline_element_styles[] = [
                'type' => 'inline_element_style',
                'source' => $selector,
                'content' => $selector . ' { ' . $inline_style . ' }',
                ];
            }
        }

        foreach ( $css_urls as $css_url ) {
            error_log( 'CSS_CONVERTER_DEBUG: Fetching CSS from URL: ' . $css_url );
            $is_elementor_kit_css = strpos($css_url, '/elementor/css/') !== false;

            $response = wp_remote_get(
                $css_url, [
                'timeout' => 30,
                'sslverify' => false,
                ]
            );
            if (! is_wp_error($response) ) {
                $response_code = wp_remote_retrieve_response_code($response);
                $css_content = wp_remote_retrieve_body($response);
                error_log( 'CSS_CONVERTER_DEBUG: CSS URL ' . $css_url . ' fetched successfully, status: ' . $response_code . ', length: ' . strlen( $css_content ) );

                $reset_patterns = [
                 'html, body, div, span',
                 'html,body,div,span',
                 'html, body',
                 'margin: 0',
                 'padding: 0',
                ];

                $has_reset_css = false;
                $found_pattern = '';
                foreach ( $reset_patterns as $pattern ) {
                    if (strpos($css_content, $pattern) !== false ) {
                        $has_reset_css = true;
                        $found_pattern = $pattern;
                        break;
                    }
                }

                $css_sources[] = [
                 'type' => 'external_file',
                 'source' => $css_url,
                 'content' => $css_content,
                ];

                // Handle @import statements if requested
                if ($follow_imports && false !== strpos($css_content, '@import') ) {
                    preg_match_all('/@import\s+(?:url\()?["\']?([^"\')]+)["\']?\)?;/i', $css_content, $import_matches);
                    if (! empty($import_matches[1]) ) {
                        foreach ( $import_matches[1] as $import_url ) {
                            $absolute_import_url = $this->resolve_relative_url($import_url, $css_url);
                            $import_response = wp_remote_get(
                                $absolute_import_url, [
                                'timeout' => 30,
                                'sslverify' => false,
                                ]
                            );
                            if (! is_wp_error($import_response) ) {
                                    $import_css = wp_remote_retrieve_body($import_response);
                                    $css_sources[] = [
                                     'type' => 'imported_file',
                                     'source' => $absolute_import_url,
                                     'content' => $import_css,
                                    ];
                            }
                        }
                    }
                }
            }
        }

        // FIXED: Add HTML style tags AFTER external CSS for correct cascade priority
        // External CSS should be overridden by HTML <style> tags
        $css_sources = array_merge($css_sources, $html_style_tags);

        // FIXED: Add inline element styles LAST for highest priority
        // Inline styles should override everything else
        $css_sources = array_merge($css_sources, $inline_element_styles);
        
        error_log( 'CSS_CONVERTER_DEBUG: Total CSS sources: ' . count( $css_sources ) );
        error_log( 'CSS_CONVERTER_DEBUG: CSS sources types: ' . print_r( array_column( $css_sources, 'type' ), true ) );
        
        $brxe_section_in_sources = 0;
        foreach ( $css_sources as $index => $source ) {
            $source_content = $source['content'] ?? '';
            $source_type = $source['type'] ?? 'unknown';
            if ( strpos( $source_content, '.brxe-section' ) !== false ) {
                $brxe_section_in_sources++;
                preg_match_all( '/\.brxe-section[^{]*\{[^}]*\}/', $source_content, $matches );
                $count = count( $matches[0] ?? [] );
                error_log( 'CSS_CONVERTER_DEBUG: Found .brxe-section in CSS source ' . $index . ' (type: ' . $source_type . '): ' . $count . ' rules' );
                if ( $count > 0 && $count <= 2 ) {
                    foreach ( array_slice( $matches[0], 0, 1 ) as $match ) {
                        error_log( 'CSS_CONVERTER_DEBUG: .brxe-section rule in source: ' . substr( $match, 0, 200 ) );
                    }
                }
            }
        }
        error_log( 'CSS_CONVERTER_DEBUG: Total CSS sources containing .brxe-section: ' . $brxe_section_in_sources );
        
        $combined_css = $this->parse_css_sources_safely($css_sources);
        
        if ( strpos( $combined_css, '.brxe-section' ) !== false ) {
            preg_match_all( '/\.brxe-section[^{]*\{[^}]*\}/', $combined_css, $matches );
            $combined_count = count( $matches[0] ?? [] );
            error_log( 'CSS_CONVERTER_DEBUG: Found .brxe-section in combined CSS: ' . $combined_count . ' rules' );
        } else {
            error_log( 'CSS_CONVERTER_DEBUG: .brxe-section NOT found in combined CSS' );
        }
        
        error_log( 'CSS_CONVERTER_DEBUG: Combined CSS length: ' . strlen( $combined_css ) );
        
        return $combined_css;
    }

    private function parse_css_sources_safely( array $css_sources ): string
    {
        $successful_css = '';
        $failed_sources = [];
        $successful_count = 0;
        $failed_count = 0;

        foreach ( $css_sources as $source ) {
            $type = $source['type'];
            $source_name = $source['source'];
            $content = $source['content'];

            if (empty(trim($content)) ) {
                continue;
            }

            try {
                $sanitized_content = $this->sanitize_css_for_parsing($content);
                // REMOVED: CSS variable renaming - resolve --e-global- directly instead
                // $sanitized_content = $this->rename_elementor_css_variables($sanitized_content);

                if (null !== $this->css_parser ) {
                    try {
                        $parsed = $this->css_parser->parse($sanitized_content);
                        $document = $parsed->get_document();
                        $format = \Sabberworm\CSS\OutputFormat::createPretty();
                        $beautified_content = $document->render($format);
                        $sanitized_content = $beautified_content;
                    } catch ( \Exception $beautify_error ) {
                        // CRITICAL FIX: Keep original content if beautification fails (especially for Kit CSS)
                        // Don't throw error - just use the sanitized content as-is
                    }
                }

                $successful_css .= $sanitized_content . "\n";
                ++$successful_count;
            } catch ( \Exception $e ) {
                ++$failed_count;
                $failed_sources[] = [
                'type' => $type,
                'source' => $source_name,
                'error' => $e->getMessage(),
                'size' => strlen($content),
                ];
            }
        }

        return $successful_css;
    }

    /**
     * Sanitize CSS to remove common CSS hacks and invalid syntax that break parsers
     *
     * @param  string $css Raw CSS content
     * @return string Sanitized CSS content
     */
    private function sanitize_css_for_parsing( string $css ): string
    {
        // Remove common CSS hacks that break Sabberworm parser
        $css_hacks_to_remove = [
        // IE CSS hacks
        '/\*zoom\s*:\s*[^;]+;?/i',           // *zoom: 1;
        '/\*display\s*:\s*[^;]+;?/i',        // *display: inline;
        '/\*width\s*:\s*[^;]+;?/i',          // *width: auto;
        '/\*height\s*:\s*[^;]+;?/i',         // *height: 1%;
        '/\*margin\s*:\s*[^;]+;?/i',         // *margin: 0;
        '/\*padding\s*:\s*[^;]+;?/i',        // *padding: 0;
        '/\*position\s*:\s*[^;]+;?/i',       // *position: relative;
        '/\*overflow\s*:\s*[^;]+;?/i',       // *overflow: hidden;

        // Other CSS hacks
        '/_[a-zA-Z-]+\s*:\s*[^;]+;?/i',      // _property: value;
        '/\+[a-zA-Z-]+\s*:\s*[^;]+;?/i',     // +property: value;
        ];

        foreach ( $css_hacks_to_remove as $hack_pattern ) {
            $css = preg_replace($hack_pattern, '', $css);
        }

        // Clean up any double semicolons or extra whitespace left by hack removal
        $css = preg_replace('/;+/', ';', $css);
        $css = preg_replace('/\s*;\s*}/', '}', $css);

        return $css;
    }

    public function fetch_css_from_urls( array $css_urls, bool $follow_imports = false ): array
    {
        $all_css = '';
        $fetched_urls = [];
        $errors = [];
        foreach ( $css_urls as $url ) {
            try {
                $css_content = $this->fetch_single_css_url($url);
                if ($css_content ) {
                    $all_css .= "/* CSS from: {$url} */\n" . $css_content . "\n\n";
                    $fetched_urls[] = $url;
                    if ($follow_imports ) {
                        $import_urls = $this->extract_import_urls($css_content, $url);
                        foreach ( $import_urls as $import_url ) {
                            if (! in_array($import_url, $fetched_urls, true) ) {
                                    $import_css = $this->fetch_single_css_url($import_url);
                                if ($import_css ) {
                                    $all_css .= "/* CSS from import: {$import_url} */\n" . $import_css . "\n\n";
                                    $fetched_urls[] = $import_url;
                                }
                            }
                        }
                    }
                }
            } catch ( \Exception $e ) {
                $errors[] = [
                'url' => $url,
                'error' => $e->getMessage(),
                ];
            }
        }
        return [
        'css' => $all_css,
        'fetched_urls' => $fetched_urls,
        'errors' => $errors,
        ];
    }
    private function fetch_single_css_url( string $url ): string
    {
        $timeout = apply_filters('elementor_widget_converter_timeout', 30);
        $response = wp_remote_get(
            $url, [
            'timeout' => $timeout,
            'headers' => [
            'Accept' => 'text/css,*/*;q=0.1',
            'User-Agent' => 'Elementor Widget Converter/1.0',
            ],
            ]
        );
        if (is_wp_error($response) ) {
            throw new \Exception('Failed to fetch CSS from URL: ' . $response->get_error_message());
        }
        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code !== 200 ) {
            throw new \Exception("HTTP {$response_code} error when fetching CSS from URL");
        }
        $css_content = wp_remote_retrieve_body($response);
        if (empty($css_content) ) {
            throw new \Exception('Empty CSS content received from URL');
        }
        return $css_content;
    }
    private function extract_import_urls( string $css_content, string $base_url ): array
    {
        $import_urls = [];
        if (preg_match_all('/@import\s+(?:url\()?["\']?([^"\'()]+)["\']?\)?[^;]*;/i', $css_content, $matches) ) {
            foreach ( $matches[1] as $import_url ) {
                $import_url = trim($import_url);
                if (! filter_var($import_url, FILTER_VALIDATE_URL) ) {
                    $import_url = $this->resolve_relative_url($import_url, $base_url);
                }
                if (filter_var($import_url, FILTER_VALIDATE_URL) ) {
                    $import_urls[] = $import_url;
                }
            }
        }
        return $import_urls;
    }
    private function resolve_relative_url( string $relative_url, string $base_url ): string
    {
        $base_parts = parse_url($base_url);
        if (! $base_parts ) {
            return $relative_url;
        }
        if (strpos($relative_url, '//') === 0 ) {
            return ( $base_parts['scheme'] ?? 'https' ) . ':' . $relative_url;
        }
        if (strpos($relative_url, '/') === 0 ) {
            return ( $base_parts['scheme'] ?? 'https' ) . '://' . $base_parts['host'] . $relative_url;
        }
        $base_path = dirname($base_parts['path'] ?? '');
        if ($base_path === '.' ) {
            $base_path = '';
        }
        return ( $base_parts['scheme'] ?? 'https' ) . '://' . $base_parts['host'] . $base_path . '/' . $relative_url;
    }
    private function extract_css_class_rules_for_global_classes( string $css, array $flattening_results = [] ): array
    {
        if (empty($css) ) {
            return [];
        }
        $parsed_css = $this->css_parser->parse($css);
        $document = $parsed_css->get_document();
        $all_rules = $this->extract_rules_from_document($document);

        $css_class_rules = [];
        foreach ( $all_rules as $rule ) {
            $selector = $rule['selector'] ?? '';
            $properties = $rule['properties'] ?? [];
            if (strpos($selector, '.') === 0 && ! empty($properties) ) {
                $css_class_rules[] = [
                'selector' => $selector,
                'properties' => $properties,
                ];
            }
        }

        // INTEGRATION POINT A: Optimize CSS rules before returning
        if (! empty($css_class_rules) ) {
            $optimized_rules = [];
            foreach ( $css_class_rules as $rule ) {
                $selector = $rule['selector'];
                $properties_array = [];

                // Convert properties format for optimizer
                foreach ( $rule['properties'] as $prop ) {
                    $property = $prop['property'] ?? '';
                    $value = $prop['value'] ?? '';
                    if (! empty($property) && ! empty($value) ) {
                        $properties_array[ $property ] = $value;
                    }
                }

                // Optimize using CSS Output Optimizer
                $optimized_selector_rules = $this->css_output_optimizer->optimize_css_output(
                    [
                    $selector => $properties_array,
                    ]
                );

                // Convert back to original format if not empty
                foreach ( $optimized_selector_rules as $opt_selector => $opt_properties ) {
                    if (! empty($opt_properties) ) {
                        $converted_properties = [];
                        foreach ( $opt_properties as $property => $value ) {
                            $converted_properties[] = [
                             'property' => $property,
                             'value' => $value,
                            ];
                        }
                        $optimized_rules[] = [
                        'selector' => $opt_selector,
                        'properties' => $converted_properties,
                        ];
                    }
                }
            }
            $css_class_rules = $optimized_rules;
        }

        // CRITICAL FIX: Include flattened classes for global class registration
        if (! empty($flattening_results['flattened_classes']) ) {
            foreach ( $flattening_results['flattened_classes'] as $class_id => $class_data ) {
                $properties = $class_data['properties'] ?? [];
                if (! empty($properties) ) {
                    $css_class_rules[] = [
                     'selector' => '.' . $class_id,
                     'properties' => $properties,
                     'flattened' => true,
                     'original_selector' => $class_data['css_converter_original_selector'] ?? '',
                    ];
                }
            }
        }

        return $css_class_rules;
    }
    private function apply_html_class_modifications( array $widgets ): array
    {
        // Flatten the widget tree to get all widgets
        $flattened_widgets = $this->flatten_widget_tree($widgets);
        // Apply HTML modifications to all flattened widgets
        $modified_flat_widgets = [];
        foreach ( $flattened_widgets as $widget ) {
            $modified_widget = $this->html_class_modifier->modify_element_classes($widget);
            $modified_flat_widgets[] = $modified_widget;
        }
        // Reconstruct the original tree structure with modified widgets
        return $this->reconstruct_widget_tree($widgets, $modified_flat_widgets);
    }
    private function apply_html_class_modifications_recursively( array $element ): array
    {
        // Modify classes for this element
        $modified_element = $this->html_class_modifier->modify_element_classes($element);
        // Recursively modify child elements
        if (isset($modified_element['elements']) && is_array($modified_element['elements']) ) {
            $modified_children = [];
            foreach ( $modified_element['elements'] as $child ) {
                $modified_children[] = $this->apply_html_class_modifications_recursively($child);
            }
            $modified_element['elements'] = $modified_children;
        }
        return $modified_element;
    }
    private function flatten_widget_tree( array $widgets ): array
    {
        $flattened_widgets = [];
        foreach ( $widgets as $widget ) {
            $this->flatten_widget_recursively($widget, $flattened_widgets);
        }
        return $flattened_widgets;
    }
    private function flatten_widget_recursively( array $widget, array &$flattened_widgets ): void
    {
        // Add the current widget to the flattened list
        $flattened_widgets[] = $widget;
        // Recursively process child widgets if they exist
        if (isset($widget['elements']) && is_array($widget['elements']) ) {
            foreach ( $widget['elements'] as $child_widget ) {
                $this->flatten_widget_recursively($child_widget, $flattened_widgets);
            }
        }
        // Also check for 'children' key (alternative structure)
        if (isset($widget['children']) && is_array($widget['children']) ) {
            foreach ( $widget['children'] as $child_widget ) {
                $this->flatten_widget_recursively($child_widget, $flattened_widgets);
            }
        }
    }
    private function reconstruct_widget_tree( array $original_widgets, array $modified_flat_widgets ): array
    {
        $widget_index = 0;
        $reconstructed_widgets = [];
        foreach ( $original_widgets as $original_widget ) {
            $reconstructed_widget = $this->reconstruct_widget_recursively(
                $original_widget,
                $modified_flat_widgets,
                $widget_index
            );
            $reconstructed_widgets[] = $reconstructed_widget;
        }
        return $reconstructed_widgets;
    }
    private function reconstruct_widget_recursively( array $original_widget, array $modified_flat_widgets, int &$widget_index ): array
    {
        // Get the modified version of this widget
        $modified_widget = $modified_flat_widgets[ $widget_index ] ?? $original_widget;
        ++$widget_index;
        // Reconstruct child widgets if they exist
        if (isset($original_widget['elements']) && is_array($original_widget['elements']) ) {
            $modified_children = [];
            foreach ( $original_widget['elements'] as $child_widget ) {
                $modified_children[] = $this->reconstruct_widget_recursively(
                    $child_widget,
                    $modified_flat_widgets,
                    $widget_index
                );
            }
            $modified_widget['elements'] = $modified_children;
        }
        // Also handle 'children' key (alternative structure)
        if (isset($original_widget['children']) && is_array($original_widget['children']) ) {
            $modified_children = [];
            foreach ( $original_widget['children'] as $child_widget ) {
                $modified_children[] = $this->reconstruct_widget_recursively(
                    $child_widget,
                    $modified_flat_widgets,
                    $widget_index
                );
            }
            $modified_widget['children'] = $modified_children;
        }
        return $modified_widget;
    }

    private function get_existing_global_class_names(): array
    {
        try {
            if (! defined('ELEMENTOR_VERSION') || ! class_exists('\Elementor\Modules\GlobalClasses\Global_Classes_Repository') ) {
                return [];
            }

            $repository = \Elementor\Modules\GlobalClasses\Global_Classes_Repository::make()
            ->context(\Elementor\Modules\GlobalClasses\Global_Classes_Repository::CONTEXT_FRONTEND);

            $existing = $repository->all();
            $items = $existing->get_items()->all();

            // Extract class names (labels) from existing global classes
            $class_names = [];
            foreach ( $items as $item ) {
                if (isset($item['label']) ) {
                    $class_names[] = $item['label'];
                }
            }

            return $class_names;

        } catch ( \Exception $e ) {
            return [];
        }
    }

    private function process_css_with_unified_registry( array $css_rules, array $widgets ): array
    {

        // Create a single context with all necessary data
        $context = new Css_Processing_Context();
        $context->set_metadata('css_rules', $css_rules);
        $context->set_metadata('existing_global_class_names', $this->get_existing_global_class_names());
        $context->set_widgets($widgets);

        // Execute the full registry pipeline (flattening → compound)
        $context = Css_Processor_Factory::execute_css_processing($context);

        $flattened_rules = $this->get_flattened_rules_from_unified_structure($context);
        $compound_global_classes = $context->get_metadata('compound_global_classes', []);
        $compound_mappings = $context->get_metadata('compound_mappings', []);

        // Use existing modifiers created by processors
        $css_class_modifiers = $context->get_metadata('css_class_modifiers', []);

        // Legacy fallback: Add flattening modifiers if not already present
        $class_mappings = $context->get_metadata('class_mappings', []);
        if (! empty($class_mappings) && ! $this->has_modifier_type($css_class_modifiers, 'flattening') ) {
            $css_class_modifiers[] = [
            'type' => 'flattening',
            'mappings' => $class_mappings,
            'metadata' => [
            'classes_with_direct_styles' => $context->get_metadata('classes_with_direct_styles', []),
            'classes_only_in_nested' => $context->get_metadata('classes_only_in_nested', []),
            'flattened_classes' => $this->get_flattened_classes_from_unified_structure($context),
            ],
            ];
        }

        // Legacy fallback: Add compound modifiers if not already present
        if (! empty($compound_mappings) && ! $this->has_modifier_type($css_class_modifiers, 'compound') ) {
            $css_class_modifiers[] = [
            'type' => 'compound',
            'mappings' => $compound_mappings,
            'metadata' => [
            'compound_global_classes' => $compound_global_classes,
            ],
            ];
        }

        return [
        'flattening' => [
        'flattened_rules' => $flattened_rules,
        'class_mappings' => $class_mappings,
        'classes_with_direct_styles' => $context->get_metadata('classes_with_direct_styles', []),
        'classes_only_in_nested' => $context->get_metadata('classes_only_in_nested', []),
        'flattened_classes' => $this->get_flattened_classes_from_unified_structure($context),
        ],
        'compound' => [
        'compound_global_classes' => $compound_global_classes,
        'compound_mappings' => $compound_mappings,
        ],
        'css_class_modifiers' => $css_class_modifiers,
        ];
    }




    private function create_global_class_from_compound(
        string $flattened_name,
        string $original_selector,
        array $required_classes,
        int $specificity,
        array $converted_properties
    ): array {

        if (strpos($flattened_name, 'fixed') !== false || strpos($original_selector, 'fixed') !== false ) {
        }
        $atomic_props = [];
        foreach ( $converted_properties as $prop_data ) {
            $converted = $prop_data['converted_property'] ?? null;
            if ($converted && is_array($converted) ) {
                foreach ( $converted as $atomic_prop_name => $atomic_prop_value ) {
                    $atomic_props[ $atomic_prop_name ] = [
                     '$$type' => $this->determine_atomic_type($atomic_prop_name),
                     'value' => $atomic_prop_value,
                    ];
                }
            }
        }
        return [
        'id' => 'g-' . substr(md5($original_selector), 0, 8),
        'label' => $flattened_name,
        'type' => 'class',
        'original_selector' => $original_selector,
        'requires' => $required_classes,
        'specificity' => $specificity,
        'variants' => [
        [
                    'meta' => [
                        'breakpoint' => 'desktop',
                        'state' => null,
                    ],
                    'props' => $atomic_props,
        ],
        ],
        ];
    }
    private function determine_atomic_type( string $prop_name ): string
    {
        $type_map = [
        'color' => 'color',
        'background' => 'background',
        'font-size' => 'font-size',
        'padding' => 'padding',
        'margin' => 'margin',
        'border-width' => 'border-width',
        'border-color' => 'border-color',
        'border-style' => 'border-style',
        'border-radius' => 'border-radius',
        'width' => 'size',
        'height' => 'size',
        ];
        return $type_map[ $prop_name ] ?? 'text';
    }

    private function extract_css_variable_definitions( array $selectors, array $declarations ): void
    {
        foreach ( $selectors as $selector ) {
            $selector_string = (string) $selector;
            $this->process_css_variable_declarations($selector_string, $declarations);
        }
    }

    private function is_css_variable_definition_selector( string $selector ): bool
    {
        $selector = trim($selector);

        // Common selectors that define CSS variables
        $variable_definition_selectors = [
        ':root',
        'html',
        'body',
        'html:root',
        'body:root',
        ];

        // Check for exact matches
        if (in_array($selector, $variable_definition_selectors, true) ) {
            return true;
        }

        // Check for selectors that start with these patterns
        foreach ( $variable_definition_selectors as $pattern ) {
            if (0 === strpos($selector, $pattern) ) {
                return true;
            }
        }

        return false;
    }

    private function process_css_variable_declarations( string $selector, array $declarations ): void
    {
        foreach ( $declarations as $index => $declaration ) {
            if (! $this->is_valid_declaration($declaration) ) {
                continue;
            }

            $property = $declaration->getRule();
            $value = (string) $declaration->getValue();

            if (0 === strpos($property, '--') ) {
                $this->store_css_variable_definition($property, $value, $selector);
            } else {
                $this->extract_variable_references_from_value($value, $selector);
            }
        }
    }

    private function extract_variable_references_from_value( string $value, string $selector ): void
    {
        if (preg_match_all('/var\s*\(\s*(--[a-zA-Z0-9_-]+)/', $value, $matches) ) {
            foreach ( $matches[1] as $variable_name ) {
                $variable_name = trim($variable_name);

                if (! isset($this->css_variable_definitions[ $variable_name ]) ) {
                    $this->css_variable_definitions[ $variable_name ] = [
                    'name' => $variable_name,
                    'value' => '',
                    'selector' => $selector,
                    'source' => 'extracted_from_reference',
                    ];
                }
            }
        }
    }

    private function store_css_variable_definition( string $variable_name, string $value, string $selector ): void
    {
        if (empty($value) ) {
            return;
        }

        if (! isset($this->css_variable_definitions[ $variable_name ]) ) {
            $this->css_variable_definitions[ $variable_name ] = [
            'name' => $variable_name,
            'value' => $value,
            'selector' => $selector,
            'source' => 'extracted_from_css',
            ];
        } elseif (empty($this->css_variable_definitions[ $variable_name ]['value']) || $this->css_variable_definitions[ $variable_name ]['source'] === 'extracted_from_reference' ) {
            $this->css_variable_definitions[ $variable_name ]['value'] = $value;
            $this->css_variable_definitions[ $variable_name ]['source'] = 'extracted_from_css';
            if (empty($this->css_variable_definitions[ $variable_name ]['selector']) || $this->css_variable_definitions[ $variable_name ]['selector'] === $selector ) {
                $this->css_variable_definitions[ $variable_name ]['selector'] = $selector;
            }
        }
    }

    public function get_css_variable_definitions(): array
    {
        return $this->css_variable_definitions;
    }


    /**
     * Process global classes with duplicate detection
     * Includes regular classes, flattened classes, and compound classes
     */
    private function process_global_classes_with_duplicate_detection( array $css_class_rules, array $flattening_results, array $compound_results = [] ): array
    {
        $provider = \Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider::instance();

        if (! $provider->is_available() ) {
            return [
            'global_classes' => [],
            'class_name_mappings' => [],
            ];
        }

        // Process regular CSS class rules
        $integration_service = $provider->get_integration_service();
        $regular_classes_result = $integration_service->process_css_rules($css_class_rules);

        $all_global_classes = $regular_classes_result['global_classes'] ?? [];
        $class_name_mappings = $regular_classes_result['class_name_mappings'] ?? [];
        $debug_duplicate_detection = $regular_classes_result['debug_duplicate_detection'] ?? null;

        // Process flattened classes (if any)
        $flattened_classes = $flattening_results['flattened_classes'] ?? [];
        if (! empty($flattened_classes) ) {
            $filtered_flattened_classes = $this->filter_flattened_classes_for_widgets($flattened_classes);
            $all_global_classes = array_merge($all_global_classes, $filtered_flattened_classes);
        }

        // Process compound classes (if any)
        $compound_classes = $compound_results['compound_global_classes'] ?? [];
        if (! empty($compound_classes) ) {
            $all_global_classes = array_merge($all_global_classes, $compound_classes);
        }

        return [
        'global_classes' => $all_global_classes,
        'class_name_mappings' => $class_name_mappings,
        'debug_duplicate_detection' => $debug_duplicate_detection,
        ];
    }

    /**
     * Filter flattened classes to only include those used by widgets
     */
    private function filter_flattened_classes_for_widgets( array $flattened_classes ): array
    {
        $filtered_flattened_classes = [];

        foreach ( $flattened_classes as $class_id => $class_data ) {
            $original_selector = $class_data['css_converter_original_selector'] ?? '';

            // Skip core Elementor selectors to avoid conflicts
            if ($this->is_core_elementor_flattened_selector($original_selector) ) {
                continue;
            }

            $filtered_flattened_classes[ $class_id ] = $class_data;
        }

        return $filtered_flattened_classes;
    }

    /**
     * Check if a selector is a core Elementor selector
     */
    private function is_core_elementor_flattened_selector( string $selector ): bool
    {
        $elementor_prefixes = [
        '.elementor-',
        '.e-con-',
        '.e-',
        ];

        foreach ( $elementor_prefixes as $prefix ) {
            if (0 === strpos($selector, $prefix) ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Apply class name mappings from duplicate detection to widgets
     */
    private function apply_class_name_mappings_to_widgets( array $widgets, array $class_name_mappings ): array
    {
        if (empty($class_name_mappings) ) {
            return $widgets;
        }

        // Set the mappings on the HTML class modifier
        $this->html_class_modifier->set_duplicate_class_mappings($class_name_mappings);

        return $widgets; // The actual modification happens in apply_html_class_modifications_to_widgets
    }

    /**
     * Apply HTML class modifications (flattening, compound, duplicate mappings) to widgets
     */
    private function apply_html_class_modifications_to_widgets( array $widgets ): array
    {
        $modified_widgets = [];

        foreach ( $widgets as $widget ) {
            $modified_widget = $this->apply_html_class_modifications_to_widget_recursively($widget);
            $modified_widgets[] = $modified_widget;
        }

        return $modified_widgets;
    }

    /**
     * Recursively apply HTML class modifications to a widget and its children
     */
    private function apply_html_class_modifications_to_widget_recursively( array $widget ): array
    {
        $modified_widget = $this->html_class_modifier->modify_element_classes($widget);

        if (! empty($modified_widget['children']) && is_array($modified_widget['children']) ) {
            $modified_children = [];
            foreach ( $modified_widget['children'] as $child ) {
                $modified_children[] = $this->apply_html_class_modifications_to_widget_recursively($child);
            }
            $modified_widget['children'] = $modified_children;
        }

        return $modified_widget;
    }

    /**
     * Split CSS rules to prevent duplicate styling
     *
     * Rules that should become global classes are excluded from atomic processing
     * to prevent applying the same styles twice (once as atomic properties, once as global classes)
     */
    private function split_rules_for_processing( array $flattened_rules ): array
    {
        $atomic_rules = [];
        $global_class_rules = [];

        foreach ( $flattened_rules as $rule ) {
            if ($this->should_create_global_class_for_rule($rule) ) {
                $global_class_rules[] = $rule;
            } else {
                $atomic_rules[] = $rule;
            }
        }

        return [
        'atomic_rules' => $atomic_rules,
        'global_class_rules' => $global_class_rules,
        ];
    }

    /**
     * Determine if a CSS rule should become a global class instead of atomic properties
     */
    private function should_create_global_class_for_rule( array $rule ): bool
    {
        $selector = $rule['selector'] ?? '';
        $properties = $rule['properties'] ?? [];

        // Skip empty rules
        if (empty($selector) || empty($properties) ) {
            return false;
        }

        // Always create global classes for simple class selectors (.class-name)
        if ($this->is_simple_class_selector($selector) ) {
            return true;
        }

        // Create global classes for rules with multiple properties (better for reusability)
        if ($this->has_multiple_properties($rule) ) {
            return true;
        }

        // Create global classes for complex selectors that benefit from CSS specificity
        if ($this->is_complex_reusable_selector($selector) ) {
            return true;
        }

        // Default to atomic properties for simple, widget-specific styles
        return false;
    }

    /**
     * Check if selector is a simple class selector (.class-name)
     */
    private function is_simple_class_selector( string $selector ): bool
    {
        $trimmed = trim($selector);

        // Must start with a dot
        if (0 !== strpos($trimmed, '.') ) {
            return false;
        }

        // Remove the leading dot
        $class_name = substr($trimmed, 1);

        // Should not contain spaces, combinators, or pseudo-selectors
        if (preg_match('/[\s>+~:]/', $class_name) ) {
            return false;
        }

        // Should be a valid class name
        return preg_match('/^[a-zA-Z_-][a-zA-Z0-9_-]*$/', $class_name);
    }

    /**
     * Check if rule has multiple properties (good candidate for global class)
     */
    private function has_multiple_properties( array $rule ): bool
    {
        $properties = $rule['properties'] ?? [];
        return count($properties) >= 3; // 3+ properties benefit from global classes
    }

    /**
     * Check if selector is complex and would benefit from global class treatment
     */
    private function is_complex_reusable_selector( string $selector ): bool
    {
        // Pseudo-selectors (:hover, :focus, etc.) benefit from global classes
        if (false !== strpos($selector, ':') ) {
            return true;
        }

        // Attribute selectors benefit from global classes
        if (false !== strpos($selector, '[') ) {
            return true;
        }

        // Complex combinators benefit from global classes
        if (preg_match('/[>+~]/', $selector) ) {
            return true;
        }

        return false;
    }

    private function count_modifiers_by_type( array $modifiers, string $type ): int
    {
        $count = 0;
        foreach ( $modifiers as $modifier ) {
            if (( $modifier['type'] ?? '' ) === $type ) {
                $count += count($modifier['mappings'] ?? []);
            }
        }
        return $count;
    }

    private function has_modifier_type( array $modifiers, string $type ): bool
    {
        foreach ( $modifiers as $modifier ) {
            if (( $modifier['type'] ?? '' ) === $type ) {
                return true;
            }
        }
        return false;
    }

    private function collect_widget_ids_recursively( array $widgets, array &$widget_ids ): void {
        foreach ( $widgets as $widget ) {
            $element_id = $widget['element_id'] ?? null;
            if ( $element_id ) {
                $widget_ids[] = $element_id;
            }
            
            if ( ! empty( $widget['children'] ) ) {
                $this->collect_widget_ids_recursively( $widget['children'], $widget_ids );
            }
        }
    }

    private function get_flattened_classes_from_unified_structure( Css_Processing_Context $context ): array
    {
        $global_classes_rules = $context->get_metadata('global_classes_rules', []);
        return isset($global_classes_rules['flattening']['classes']) ? $global_classes_rules['flattening']['classes'] : $context->get_metadata('flattened_classes', []);
    }

    private function get_flattened_rules_from_unified_structure( Css_Processing_Context $context ): array
    {
        $global_classes_rules = $context->get_metadata('global_classes_rules', []);
        return isset($global_classes_rules['flattening']['rules']) ? $global_classes_rules['flattening']['rules'] : $context->get_metadata('flattened_rules', []);
    }
}
