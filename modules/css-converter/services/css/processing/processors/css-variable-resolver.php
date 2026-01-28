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
        
        return ! empty($css_rules) && ! empty($variable_definitions);
    }

    public function process( Css_Processing_Context $context ): Css_Processing_Context
    {
        $css_rules = $context->get_metadata('css_rules', []);
        $variable_definitions = $context->get_metadata('css_variable_definitions', []);

        $resolved_rules = $this->resolve_variables_in_rules($css_rules, $variable_definitions);

        $context->set_metadata('css_rules', $resolved_rules);

        return $context;
    }

    private function resolve_variables_in_rules( array $css_rules, array $variable_definitions ): array
    {
        $resolved_rules = [];

        foreach ( $css_rules as $rule ) {
            $resolved_properties = [];

            foreach ( $rule['properties'] as $property_data ) {
                $property = $property_data['property'] ?? '';
                $value = $property_data['value'] ?? '';

                if (strpos($value, 'var(') !== false ) {
                    $should_resolve = $this->should_resolve_variable($value);
                    if ( strpos( $rule['selector'] ?? '', 'class-color-test' ) !== false ) {
                    }
                    if ($should_resolve ) {
                        $resolved_value = $this->resolve_variable_reference($value, $variable_definitions);
                        if ($resolved_value !== $value ) {
                            $property_data['value'] = $resolved_value;
                            $property_data['resolved_from_variable'] = true;
                            if ( strpos( $rule['selector'] ?? '', 'class-color-test' ) !== false ) {
                            }
                        }
                    } else {
                        if ( strpos( $rule['selector'] ?? '', 'class-color-test' ) !== false ) {
                        }
                    }
                }

                $resolved_properties[] = $property_data;
            }

            $rule['properties'] = $resolved_properties;
            $resolved_rules[] = $rule;
        }

        return $resolved_rules;
    }

    private function resolve_variable_reference( string $value, array $variable_definitions ): string
    {
        return preg_replace_callback(
            '/var\s*\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\s*\)/',
            function ( $matches ) use ( $variable_definitions ) {
                $var_name = trim($matches[1]);
                $fallback = $matches[2] ?? '';
                $original_var = $matches[0];

                $resolved_value = $this->get_variable_value($var_name, $variable_definitions);

                if ($resolved_value !== null ) {
                    return $resolved_value;
                }

                if (! empty($fallback) ) {
                    return trim($fallback);
                }

                return $original_var;
            },
            $value
        );
    }

    private function get_variable_value( string $var_name, array $variable_definitions ): ?string
    {
        $clean_name = $this->clean_variable_name($var_name);

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

    private function should_resolve_variable( string $value ): bool
    {
        if (preg_match('/var\s*\(\s*(--[a-zA-Z0-9_-]+)/', $value, $matches) ) {
            $var_name = $matches[1];
            return $this->is_global_variable($var_name);
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
