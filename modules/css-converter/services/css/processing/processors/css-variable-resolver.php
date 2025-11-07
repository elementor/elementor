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
        
        $log_path = WP_CONTENT_DIR . '/css-variable-resolution.log';
        $rules_count = count($css_rules);
        $defs_count = count($variable_definitions);
        $has_e66ebc9 = isset($variable_definitions['e-global-color-e66ebc9']);
        file_put_contents($log_path, date('Y-m-d H:i:s') . " SUPPORTS_CONTEXT: css_rules={$rules_count}, variable_definitions={$defs_count}, has_e66ebc9=" . ($has_e66ebc9 ? 'yes' : 'no') . "\n", FILE_APPEND);

        // Require both css_rules and variable_definitions (populated by CSS Variable Registry at priority 9)
        $supports = ! empty($css_rules) && ! empty($variable_definitions);
        file_put_contents($log_path, date('Y-m-d H:i:s') . " SUPPORTS_CONTEXT RESULT: " . ($supports ? 'YES' : 'NO') . "\n", FILE_APPEND);
        return $supports;
    }

    public function process( Css_Processing_Context $context ): Css_Processing_Context
    {
        $log_path = WP_CONTENT_DIR . '/css-variable-resolution.log';
        file_put_contents($log_path, date('Y-m-d H:i:s') . " CSS_VARIABLE_RESOLVER: Starting process()\n", FILE_APPEND);
        
        $tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
        $debug_log = WP_CONTENT_DIR . '/processor-data-flow.log';
        
        file_put_contents($tracking_log, "\n" . str_repeat('~', 80) . "\n", FILE_APPEND);
        file_put_contents($tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Started\n", FILE_APPEND);

        $css_rules = $context->get_metadata('css_rules', []);
        
        // DEBUG: Check what rules the resolver is processing
        file_put_contents($log_path, date('Y-m-d H:i:s') . " CSS_VARIABLE_RESOLVER: Processing " . count($css_rules) . " rules\n", FILE_APPEND);
        foreach ($css_rules as $i => $rule) {
            $selector = $rule['selector'] ?? 'NO_SELECTOR';
            $prop_count = count($rule['properties'] ?? []);
            file_put_contents($log_path, date('Y-m-d H:i:s') . " RULE {$i}: '{$selector}' with {$prop_count} properties\n", FILE_APPEND);
            
            // Check if this rule has var() references
            $has_var_refs = false;
            foreach ($rule['properties'] ?? [] as $prop) {
                $value = $prop['value'] ?? '';
                if (strpos($value, 'var(') !== false) {
                    $has_var_refs = true;
                    file_put_contents($log_path, date('Y-m-d H:i:s') . "   VAR REF: {$prop['property']} = {$value}\n", FILE_APPEND);
                }
            }
            if (!$has_var_refs && $i < 3) {
                file_put_contents($log_path, date('Y-m-d H:i:s') . "   NO VAR REFS in rule {$i}\n", FILE_APPEND);
            }
        }
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
        $clean_name = $this->clean_variable_name($var_name);
        
        // DEBUG: Check if e66ebc9 variable is being resolved
        if ( strpos( $var_name, 'e66ebc9' ) !== false || strpos( $clean_name, 'e66ebc9' ) !== false ) {
            $log_path = WP_CONTENT_DIR . '/css-variable-resolution.log';
            $has_definition = isset( $variable_definitions[ $clean_name ] );
            $def_value = $has_definition ? ( $variable_definitions[ $clean_name ]['value'] ?? 'EMPTY' ) : 'NOT_FOUND';
            $total_defs = count( $variable_definitions );
            file_put_contents( $log_path, date('Y-m-d H:i:s') . " DEBUG RESOLVE e66ebc9: var_name='{$var_name}', clean_name='{$clean_name}', has_definition=" . ($has_definition ? 'yes' : 'no') . ", value='{$def_value}', total_definitions={$total_defs}\n", FILE_APPEND );
        }

        if (isset($variable_definitions[ $clean_name ]) ) {
            $var_value = $variable_definitions[ $clean_name ]['value'] ?? '';

            if (! empty($var_value) ) {
                return $var_value;
            }
        }

        return null;
    }

    private function clean_variable_name( string $variable_name ): string
    {
        $clean = trim($variable_name);
        if (0 === strpos($clean, '--') ) {
            $clean = substr($clean, 2);
        }
        return $clean;
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
        $clean_name = $this->clean_variable_name($var_name);

        if (isset($variable_definitions[ $clean_name ]['type']) ) {
            return $variable_definitions[ $clean_name ]['type'];
        }

        if ($this->is_global_variable($var_name) ) {
            if (strpos($var_name, '--e-global-color-') === 0 ) {
                return 'color';
            }
            if (strpos($var_name, '--e-global-typography-') === 0 ) {
                return 'font';
            }
            if (strpos($var_name, '--e-global-size-') === 0 ) {
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
        ];

        foreach ( $global_prefixes as $prefix ) {
            if (strpos($var_name, $prefix) === 0 ) {
                return true;
            }
        }

        return false;
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
