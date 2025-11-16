<?php

namespace Elementor\Modules\CssConverter\Services\GlobalClasses\Unified;

if (! defined('ABSPATH') ) {
    exit;
}

class Global_Classes_Detection_Service
{

    const ELEMENTOR_CLASS_PREFIXES = [ 'e-con-', 'elementor-', 'e-' ];
    const FLATTENED_CLASS_PREFIX = 'e-con-';

    public function detect_css_class_selectors( array $css_rules ): array
    {
        $detected_classes = [];
        $intro_section_rules_found = 0;

        foreach ( $css_rules as $rule ) {
            $selector = $rule['selector'] ?? '';

            if ( strpos( $selector, 'brxe-section' ) !== false ) {
                error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Found .brxe-section selector: ' . $selector );
                error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Is compound: ' . ( $this->is_compound_class_selector($selector) ? 'YES' : 'NO' ) );
                $properties_count = count( $rule['properties'] ?? [] );
                error_log( 'CSS_CONVERTER_DEBUG: Detection Service - .brxe-section properties count: ' . $properties_count );
            }
            
            if ( strpos( $selector, 'brxw-intro-02' ) !== false ) {
                error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Found .brxw-intro-02 selector: ' . $selector );
                error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Is compound: ' . ( $this->is_compound_class_selector($selector) ? 'YES' : 'NO' ) );
                $properties_count = count( $rule['properties'] ?? [] );
                error_log( 'CSS_CONVERTER_DEBUG: Detection Service - .brxw-intro-02 properties count: ' . $properties_count );
                foreach ( $rule['properties'] ?? [] as $prop ) {
                    $prop_name = $prop['property'] ?? '';
                    $prop_value = $prop['value'] ?? '';
                    if ( in_array( $prop_name, [ 'display', 'grid-gap', 'grid-template-columns', 'align-items' ], true ) ) {
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - .brxw-intro-02 property: ' . $prop_name . ' = ' . $prop_value );
                    }
                }
            }
            
            if ( strpos( $selector, 'intro-section' ) !== false ) {
                $intro_section_rules_found++;
                error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Found .intro-section selector: ' . $selector );
                error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Is compound: ' . ( $this->is_compound_class_selector($selector) ? 'YES' : 'NO' ) );
            }

            // SKIP compound selectors (e.g., .class1.class2) - they should not become global classes
            if ($this->is_compound_class_selector($selector) ) {
                if ( strpos( $selector, 'intro-section' ) !== false ) {
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - SKIPPED .intro-section (compound selector)' );
                }
                continue;
            }

            // NEW: Extract all class names from complex selectors
            $class_names = $this->extract_all_class_names_from_selector($selector);

            if (empty($class_names) ) {
                if ( strpos( $selector, 'intro-section' ) !== false ) {
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - SKIPPED .intro-section (no class names extracted)' );
                }
                continue;
            }

            // Process each class name found in the selector
            foreach ( $class_names as $class_name ) {
                if ( 'brxe-section' === $class_name ) {
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Processing brxe-section class name' );
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Should skip: ' . ( $this->should_skip_class_name($class_name) ? 'YES' : 'NO' ) );
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Too long: ' . ( $this->is_class_name_too_long($class_name) ? 'YES' : 'NO' ) );
                    $is_simple = ( '.' . $class_name === $selector );
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Is simple selector: ' . ( $is_simple ? 'YES' : 'NO' ) );
                }
                
                if ( 'brxw-intro-02' === $class_name ) {
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Processing brxw-intro-02 class name' );
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Should skip: ' . ( $this->should_skip_class_name($class_name) ? 'YES' : 'NO' ) );
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Too long: ' . ( $this->is_class_name_too_long($class_name) ? 'YES' : 'NO' ) );
                    $is_simple = ( '.' . $class_name === $selector );
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Is simple selector: ' . ( $is_simple ? 'YES' : 'NO' ) );
                }
                
                if ( 'intro-section' === $class_name ) {
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Processing intro-section class name' );
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Should skip: ' . ( $this->should_skip_class_name($class_name) ? 'YES' : 'NO' ) );
                    error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Too long: ' . ( $this->is_class_name_too_long($class_name) ? 'YES' : 'NO' ) );
                }
                
                if ($this->should_skip_class_name($class_name) ) {
                    if ( 'intro-section' === $class_name ) {
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - SKIPPED intro-section (should_skip_class_name)' );
                    }
                    continue;
                }

                if ($this->is_class_name_too_long($class_name) ) {
                    if ( 'intro-section' === $class_name ) {
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - SKIPPED intro-section (too long)' );
                    }
                    continue;
                }

                $is_simple_selector = ( '.' . $class_name === $selector );
                
                if ($is_simple_selector ) {
                    if ( isset( $detected_classes[ $class_name ] ) ) {
                        if ( 'brxe-section' === $class_name ) {
                            $existing_props = count( $detected_classes[ $class_name ]['properties'] ?? [] );
                            $new_props = count( $rule['properties'] ?? [] );
                            error_log( 'CSS_CONVERTER_DEBUG: Detection Service - brxe-section already detected, merging simple selector (Existing: ' . $existing_props . ', New: ' . $new_props . ')' );
                        }
                        
                        $existing_properties = $detected_classes[ $class_name ]['properties'] ?? [];
                        $new_properties = $rule['properties'] ?? [];
                        
                        $merged_properties = $this->merge_properties( $existing_properties, $new_properties );
                        
                        $detected_classes[ $class_name ] = [
                            'selector' => $selector,
                            'properties' => $merged_properties,
                            'source' => 'css-converter',
                        ];
                    } else {
                        if ( 'class-color-test' === $class_name ) {
                            foreach ( $rule['properties'] ?? [] as $prop ) {
                                error_log( 'DETECTION_SERVICE: Class ' . $class_name . ' - Property ' . ( $prop['property'] ?? '' ) . ' = ' . ( $prop['value'] ?? '' ) );
                            }
                        }
                        
                        $detected_classes[ $class_name ] = [
                            'selector' => $selector,
                            'properties' => $rule['properties'] ?? [],
                            'source' => 'css-converter',
                        ];
                    }
                    
                    if ( 'brxe-section' === $class_name ) {
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - ADDED brxe-section (simple selector)' );
                        $props_count = count( $rule['properties'] ?? [] );
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - brxe-section properties added: ' . $props_count );
                        foreach ( $rule['properties'] ?? [] as $prop ) {
                            $prop_name = $prop['property'] ?? '';
                            $prop_value = $prop['value'] ?? '';
                            if ( in_array( $prop_name, [ 'display', 'flex-direction', 'align-items', 'margin-left', 'margin-right', 'width' ], true ) ) {
                                error_log( 'CSS_CONVERTER_DEBUG: Detection Service - brxe-section property: ' . $prop_name . ' = ' . $prop_value );
                            }
                        }
                    }
                    
                    if ( 'brxw-intro-02' === $class_name ) {
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - ADDED brxw-intro-02 (simple selector)' );
                        $props_count = count( $rule['properties'] ?? [] );
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - brxw-intro-02 properties added: ' . $props_count );
                        foreach ( $rule['properties'] ?? [] as $prop ) {
                            $prop_name = $prop['property'] ?? '';
                            $prop_value = $prop['value'] ?? '';
                            if ( in_array( $prop_name, [ 'display', 'grid-gap', 'grid-template-columns', 'align-items' ], true ) ) {
                                error_log( 'CSS_CONVERTER_DEBUG: Detection Service - brxw-intro-02 property in detected: ' . $prop_name . ' = ' . $prop_value );
                            }
                        }
                    }
                    
                    if ( 'intro-section' === $class_name ) {
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - ADDED intro-section (simple selector)' );
                    }
                    
                    if ( 'copy' === $class_name ) {
                    }
                } elseif (! isset($detected_classes[ $class_name ]) ) {
                    $detected_classes[ $class_name ] = [
                    'selector' => $selector,
                    'properties' => $rule['properties'] ?? [],
                    'source' => 'css-converter',
                    ];
                    
                    if ( 'brxe-section' === $class_name ) {
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - ADDED brxe-section (complex selector, first time)' );
                        $props_count = count( $rule['properties'] ?? [] );
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - brxe-section properties added: ' . $props_count );
                    }
                    
                    if ( 'intro-section' === $class_name ) {
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - ADDED intro-section (complex selector, first time)' );
                    }
                    
                    if ( 'copy' === $class_name ) {
                    }
                } else {
                    if ( 'brxe-section' === $class_name ) {
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - SKIPPED brxe-section (already detected, merging properties)' );
                        $existing_props = count( $detected_classes[ $class_name ]['properties'] ?? [] );
                        $new_props = count( $rule['properties'] ?? [] );
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Existing: ' . $existing_props . ', New: ' . $new_props );
                    }
                    
                    if ( 'intro-section' === $class_name ) {
                        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - SKIPPED intro-section (already detected)' );
                    }
                    if ( 'copy' === $class_name ) {
                    }
                }
            }
        }

        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - Total .intro-section rules found: ' . $intro_section_rules_found );
        error_log( 'CSS_CONVERTER_DEBUG: Detection Service - intro-section in detected_classes: ' . ( isset( $detected_classes['intro-section'] ) ? 'YES' : 'NO' ) );

        return $detected_classes;
    }

    private function is_compound_class_selector( string $selector ): bool
    {
        $trimmed = trim($selector);
        $parts = preg_split('/\s+/', $trimmed);
        $first_part = $parts[0] ?? '';
        $class_count = substr_count($first_part, '.');
        return $class_count > 1;
    }

    private function is_valid_class_selector( string $selector ): bool
    {
        $trimmed_selector = trim($selector);

        if (empty($trimmed_selector) ) {
            return false;
        }

        if (0 !== strpos($trimmed_selector, '.') ) {
            return false;
        }

        $class_name = ltrim($trimmed_selector, '.');

        return ! empty($class_name);
    }

    private function should_skip_selector( string $selector ): bool
    {
        $class_name = $this->extract_class_name($selector);

        foreach ( self::ELEMENTOR_CLASS_PREFIXES as $prefix ) {
            if (0 === strpos($class_name, $prefix) ) {
                return true;
            }
        }

        return false;
    }

    private function extract_class_name( string $selector ): string
    {
        return ltrim(trim($selector), '.');
    }

    private function extract_all_class_names_from_selector( string $selector ): array
    {
        $class_names = [];
        
        // Use regex to find all class names in the selector
        // Pattern: \.([a-zA-Z0-9_-]+) - matches .classname
        preg_match_all('/\.([a-zA-Z0-9_-]+)/', $selector, $matches);
        
        
        if (! empty($matches[1]) ) {
            $class_names = array_unique($matches[1]);
        }
        
        
        return $class_names;
    }

    private function should_skip_class_name( string $class_name ): bool
    {
        foreach ( self::ELEMENTOR_CLASS_PREFIXES as $prefix ) {
            if (0 === strpos($class_name, $prefix) ) {
                return true;
            }
        }

        return false;
    }

    private function is_class_name_too_long( string $class_name ): bool
    {
        $max_class_name_length = 50;

        return strlen($class_name) > $max_class_name_length;
    }

    public function filter_classes_by_usage( array $detected_classes, array $used_classes ): array
    {
        $filtered = [];
        $filtered_out_count = 0;


        foreach ( $detected_classes as $class_name => $class_data ) {
            if (in_array($class_name, $used_classes, true) ) {
                $filtered[ $class_name ] = $class_data;
            } else {
                ++$filtered_out_count;
            }
        }


        return $filtered;
    }

    private function merge_properties( array $existing_properties, array $new_properties ): array {
        $merged = [];
        $property_map = [];
        
        foreach ( $existing_properties as $prop ) {
            $property_name = $prop['property'] ?? '';
            if ( ! empty( $property_name ) ) {
                $property_map[ $property_name ] = $prop;
            }
        }
        
        foreach ( $new_properties as $prop ) {
            $property_name = $prop['property'] ?? '';
            if ( ! empty( $property_name ) ) {
                $property_map[ $property_name ] = $prop;
            }
        }
        
        return array_values( $property_map );
    }

    public function get_detection_stats( array $css_rules ): array
    {
        $total_rules = count($css_rules);
        $class_selectors = 0;
        $valid_classes = 0;
        $skipped_elementor = 0;
        $skipped_invalid = 0;
        $skipped_too_long = 0;

        foreach ( $css_rules as $rule ) {
            $selector = $rule['selector'] ?? '';

            if (0 === strpos(trim($selector), '.') ) {
                ++$class_selectors;

                if (! $this->is_valid_class_selector($selector) ) {
                    ++$skipped_invalid;
                    continue;
                }

                if ($this->should_skip_selector($selector) ) {
                    ++$skipped_elementor;
                    continue;
                }

                $class_name = $this->extract_class_name($selector);
                if ($this->is_class_name_too_long($class_name) ) {
                    ++$skipped_too_long;
                    continue;
                }

                ++$valid_classes;
            }
        }

        return [
        'total_rules' => $total_rules,
        'class_selectors' => $class_selectors,
        'valid_classes' => $valid_classes,
        'skipped_elementor' => $skipped_elementor,
        'skipped_invalid' => $skipped_invalid,
        'skipped_too_long' => $skipped_too_long,
        ];
    }
}
