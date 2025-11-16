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

        foreach ( $css_rules as $rule ) {
            $selector = $rule['selector'] ?? '';

            // SKIP compound selectors (e.g., .class1.class2) - they should not become global classes
            if ($this->is_compound_class_selector($selector) ) {
                continue;
            }

            // NEW: Extract all class names from complex selectors
            $class_names = $this->extract_all_class_names_from_selector($selector);

            if (empty($class_names) ) {
                continue;
            }

            // Process each class name found in the selector
            foreach ( $class_names as $class_name ) {
                if ($this->should_skip_class_name($class_name) ) {
                    continue;
                }

                if ($this->is_class_name_too_long($class_name) ) {
                    continue;
                }

                $is_simple_selector = ( '.' . $class_name === $selector );
                
                if ($is_simple_selector ) {
                    if ( isset( $detected_classes[ $class_name ] ) ) {
                        $existing_properties = $detected_classes[ $class_name ]['properties'] ?? [];
                        $new_properties = $rule['properties'] ?? [];
                        
                        $merged_properties = $this->merge_properties( $existing_properties, $new_properties );
                        
                        $detected_classes[ $class_name ] = [
                            'selector' => $selector,
                            'properties' => $merged_properties,
                            'source' => 'css-converter',
                        ];
                    } else {
                        $detected_classes[ $class_name ] = [
                            'selector' => $selector,
                            'properties' => $rule['properties'] ?? [],
                            'source' => 'css-converter',
                        ];
                    }
                } elseif (! isset($detected_classes[ $class_name ]) ) {
                    $detected_classes[ $class_name ] = [
                    'selector' => $selector,
                    'properties' => $rule['properties'] ?? [],
                    'source' => 'css-converter',
                    ];
                }
            }
        }

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
