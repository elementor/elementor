<?php

namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if (! defined('ABSPATH') ) {
    exit;
}

class Css_Variable_Resolver implements Css_Processor_Interface
{

    public function get_processor_name(): string
    {
        return 'css_variable_resolver';
    }

    public function get_priority(): int
    {
        return 9.5; // Run AFTER CSS Variable Registry (priority 9) but BEFORE Widget Class Processor (priority 11)
    }

    public function get_statistics_keys(): array
    {
        return [];
    }

    public function supports_context( Css_Processing_Context $context ): bool
    {
        $css_rules = $context->get_metadata('css_rules', []);
        $variable_definitions = $context->get_metadata('css_variable_definitions', []);

        // Require both css_rules and variable_definitions (populated by CSS Variable Registry at priority 9)
        return ! empty($css_rules) && ! empty($variable_definitions);
    }

    public function process( Css_Processing_Context $context ): Css_Processing_Context
    {
        $tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
        $debug_log = WP_CONTENT_DIR . '/processor-data-flow.log';
        
        file_put_contents($tracking_log, "\n" . str_repeat('~', 80) . "\n", FILE_APPEND);
        file_put_contents($tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Started\n", FILE_APPEND);

        $css_rules = $context->get_metadata('css_rules', []);
        $variable_definitions = $context->get_metadata('css_variable_definitions', []);

        // DEBUG: Track specific target rule at START
        $target_rule_before = $this->find_target_rule($css_rules, 'elementor-element-9856e95', 'elementor-heading-title');
        file_put_contents(
            $debug_log,
            date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER START: Target rule font-weight = " . 
            ($target_rule_before['font-weight'] ?? 'NOT_FOUND') . "\n",
            FILE_APPEND
        );

        file_put_contents($tracking_log, date('[H:i:s] ') . 'CSS_VARIABLE_RESOLVER: Processing ' . count($css_rules) . ' rules with ' . count($variable_definitions) . " variable definitions\n", FILE_APPEND);

        $resolved_rules = $this->resolve_variables_in_rules($css_rules, $variable_definitions);

        // DEBUG: Track specific target rule at END
        $target_rule_after = $this->find_target_rule($resolved_rules, 'elementor-element-9856e95', 'elementor-heading-title');
        file_put_contents(
            $debug_log,
            date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER END: Target rule font-weight = " . 
            ($target_rule_after['font-weight'] ?? 'NOT_FOUND') . "\n",
            FILE_APPEND
        );

        $context->set_metadata('css_rules', $resolved_rules);

        file_put_contents($tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Completed\n", FILE_APPEND);

        return $context;
    }

    private function resolve_variables_in_rules( array $css_rules, array $variable_definitions ): array
    {
        $resolved_rules = [];
        $variables_resolved = 0;
        $tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';

        foreach ( $css_rules as $rule ) {
            $resolved_properties = [];

            foreach ( $rule['properties'] as $property_data ) {
                $property = $property_data['property'] ?? '';
                $value = $property_data['value'] ?? '';

                if (strpos($value, 'var(') !== false ) {
                    $variable_type = $this->get_variable_type_from_value($value, $variable_definitions);

                    // CRITICAL FIX: Process ALL variable types, not just 'local' and 'unsupported'
                    $resolved_value = $this->resolve_variable_reference($value, $variable_definitions);
                    if ($resolved_value !== $value ) {
                        $property_data['value'] = $resolved_value;
                        $property_data['resolved_from_variable'] = true;
                        ++$variables_resolved;
                        file_put_contents($tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Resolved {$property}: {$value} -> {$resolved_value} (type: {$variable_type})\n", FILE_APPEND);
                    } else {
                        file_put_contents($tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Could not resolve {$property}: {$value} (type: {$variable_type})\n", FILE_APPEND);
                    }
                }

                $resolved_properties[] = $property_data;
            }

            $rule['properties'] = $resolved_properties;
            $resolved_rules[] = $rule;
        }

        file_put_contents($tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Resolved {$variables_resolved} variable references\n", FILE_APPEND);

        return $resolved_rules;
    }

    private function resolve_variable_reference( string $value, array $variable_definitions ): string
    {
        $log_path = WP_CONTENT_DIR . '/css-variable-resolution.log';
        
        return preg_replace_callback(
            '/var\s*\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\s*\)/',
            function ( $matches ) use ( $variable_definitions, $log_path ) {
                $var_name = trim($matches[1]);
                $fallback = $matches[2] ?? '';
                $original_var = $matches[0];

                // Try definitions first
                $resolved_value = $this->get_variable_value($var_name, $variable_definitions);

                if ($resolved_value !== null ) {
                    file_put_contents(
                        $log_path,
                        date('Y-m-d H:i:s') . " RESOLVED (definitions): {$original_var} → {$resolved_value}\n",
                        FILE_APPEND
                    );
                    return $resolved_value;
                }

                // Try WordPress fetch for global variables
                if ($this->is_global_variable($var_name) ) {
                    $wp_resolved = $this->fetch_global_variable_from_wp($var_name);
                    if ($wp_resolved !== null ) {
                        file_put_contents(
                            $log_path,
                            date('Y-m-d H:i:s') . " RESOLVED (WordPress): {$original_var} → {$wp_resolved}\n",
                            FILE_APPEND
                        );
                        return $wp_resolved;
                    }
                    
                    // Use sensible default for global variables
                    $default_value = $this->get_global_variable_default($var_name);
                    file_put_contents(
                        $log_path,
                        date('Y-m-d H:i:s') . " RESOLVED (default): {$original_var} → {$default_value}\n",
                        FILE_APPEND
                    );
                    return $default_value;
                }

                // Use fallback if provided
                if (! empty($fallback) ) {
                    file_put_contents(
                        $log_path,
                        date('Y-m-d H:i:s') . " RESOLVED (fallback): {$original_var} → {$fallback}\n",
                        FILE_APPEND
                    );
                    return trim($fallback);
                }

                file_put_contents(
                    $log_path,
                    date('Y-m-d H:i:s') . " UNRESOLVED: {$original_var} (keeping as variable)\n",
                    FILE_APPEND
                );

                return $original_var;
            },
            $value
        );
    }

    private function get_variable_value( string $var_name, array $variable_definitions ): ?string
    {
        $clean_name = ltrim($var_name, '-');

        if (isset($variable_definitions[ $clean_name ]) ) {
            $var_value = $variable_definitions[ $clean_name ]['value'] ?? '';

            if (! empty($var_value) ) {
                return $var_value;
            }
        }

        if (strpos($clean_name, 'ec-global-') === 0 ) {
            $original_name = str_replace('ec-global-', 'e-global-', $clean_name);
            if (isset($variable_definitions[ $original_name ]) ) {
                $var_value = $variable_definitions[ $original_name ]['value'] ?? '';

                if (! empty($var_value) ) {
                    return $var_value;
                }
            }
        }

        return null;
    }

    private function get_variable_type_from_value( string $value, array $variable_definitions ): string
    {
        if (preg_match('/var\s*\(\s*(--[a-zA-Z0-9_-]+)/', $value, $matches) ) {
            $var_name = $matches[1];
            return $this->get_variable_type($var_name, $variable_definitions);
        }

        return 'unknown';
    }

    private function get_variable_type( string $var_name, array $variable_definitions ): string
    {
        $clean_name = ltrim($var_name, '-');

        if (isset($variable_definitions[ $clean_name ]['type']) ) {
            return $variable_definitions[ $clean_name ]['type'];
        }

        if ($this->is_global_variable($var_name) ) {
            if (strpos($var_name, '--e-global-color-') === 0 || strpos($var_name, '--ec-global-color-') === 0 ) {
                return 'color';
            }
            if (strpos($var_name, '--e-global-typography-') === 0 || strpos($var_name, '--ec-global-typography-') === 0 ) {
                return 'font';
            }
            if (strpos($var_name, '--e-global-size-') === 0 || strpos($var_name, '--ec-global-size-') === 0 ) {
                return 'size';
            }
        }

        return 'local';
    }

    private function is_global_variable( string $var_name ): bool
    {
        $global_prefixes = [
        '--e-global-color-',
        '--e-global-typography-',
        '--e-global-size-',
        '--ec-global-color-',
        '--ec-global-typography-',
        '--ec-global-size-',
        ];

        foreach ( $global_prefixes as $prefix ) {
            if (strpos($var_name, $prefix) === 0 ) {
                return true;
            }
        }

        return false;
    }

    private function fetch_global_variable_from_wp( string $var_name ): ?string
    {
        $clean_name = ltrim($var_name, '-');
        $clean_name = str_replace('ec-global-', 'e-global-', $clean_name);
        
        if (preg_match('/e-global-color-([a-zA-Z0-9]+)/', $clean_name, $matches) ) {
            return $this->fetch_global_color($matches[1]);
        }
        
        if (preg_match('/e-global-typography-([a-zA-Z0-9]+)-([a-z-]+)/', $clean_name, $matches) ) {
            return $this->fetch_global_typography($matches[1], $matches[2]);
        }
        
        return null;
    }

    private function fetch_global_color( string $color_id ): ?string
    {
        $kit_id = get_option('elementor_active_kit');
        if (! $kit_id ) {
            return null;
        }
        
        $kit_settings = get_post_meta($kit_id, '_elementor_page_settings', true);
        if (! isset($kit_settings['system_colors']) ) {
            return null;
        }
        
        foreach ( $kit_settings['system_colors'] as $color ) {
            if ($color['_id'] === $color_id ) {
                return $color['color'] ?? null;
            }
        }
        
        return null;
    }

    private function fetch_global_typography( string $typo_id, string $property ): ?string
    {
        $kit_id = get_option('elementor_active_kit');
        if (! $kit_id ) {
            return null;
        }
        
        $kit_settings = get_post_meta($kit_id, '_elementor_page_settings', true);
        if (! isset($kit_settings['system_typography']) ) {
            return null;
        }
        
        foreach ( $kit_settings['system_typography'] as $typo ) {
            if ($typo['_id'] === $typo_id ) {
                switch ( $property ) {
                case 'font-weight':
                    return $typo['typography_font_weight'] ?? null;
                case 'font-size':
                    if (isset($typo['typography_font_size']) ) {
                        $size = $typo['typography_font_size'];
                        return $size['size'] . ( $size['unit'] ?? 'px' );
                    }
                    return null;
                case 'font-family':
                    return $typo['typography_font_family'] ?? null;
                case 'line-height':
                    if (isset($typo['typography_line_height']) ) {
                         $line_height = $typo['typography_line_height'];
                         return $line_height['size'] . ( $line_height['unit'] ?? '' );
                    }
                    return null;
                }
            }
        }
        
        return null;
    }

    private function get_global_variable_default( string $var_name ): string
    {
        $clean_name = ltrim($var_name, '-');
        
        // Color defaults
        if (strpos($clean_name, 'global-color-') !== false ) {
            return '#000000';  // Default to black
        }
        
        // Typography defaults
        if (strpos($clean_name, 'typography') !== false ) {
            if (strpos($clean_name, 'font-weight') !== false ) {
                return '400';  // Default font weight
            }
            if (strpos($clean_name, 'font-size') !== false ) {
                return '16px';  // Default font size
            }
            if (strpos($clean_name, 'font-family') !== false ) {
                return 'Arial, sans-serif';  // Default font family
            }
            if (strpos($clean_name, 'line-height') !== false ) {
                return '1.5';  // Default line height
            }
        }
        
        return 'initial';  // CSS initial value
    }

    private function find_target_rule( array $css_rules, string $element_id, string $class_name ): array
    {
        foreach ( $css_rules as $rule ) {
            $selector = $rule['selector'] ?? '';
            
            // Look for our target selector
            if (strpos($selector, $element_id) !== false && strpos($selector, $class_name) !== false ) {
                $properties = [];
                foreach ( $rule['properties'] ?? [] as $prop ) {
                    $prop_name = $prop['property'] ?? '';
                    $prop_value = $prop['value'] ?? '';
                    if (in_array($prop_name, ['font-weight', 'color', 'font-size']) ) {
                        $properties[$prop_name] = $prop_value;
                    }
                }
                return $properties;
            }
        }
        
        return [];
    }
}
