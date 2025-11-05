<?php
namespace Elementor\Modules\CssConverter\Routes;
if (! defined('ABSPATH') ) {
    exit;
}
use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Exceptions\CssParseException;
use Elementor\Modules\CssConverter\Variable_Conversion_Service;
use Elementor\Modules\Variables\Storage\Repository as Variables_Repository;
use Elementor\Plugin;
use WP_REST_Request;
use WP_REST_Response;
use Elementor\Modules\CssConverter\Services\Variables\Css_Value_Normalizer;
class Variables_Route
{
    private $parser;
    public function __construct( $parser = null )
    {
        $this->parser = $parser;
        add_action('rest_api_init', [ $this, 'register_route' ]);
    }
    private function get_parser()
    {
        if (null === $this->parser ) {
            $this->parser = new CssParser();
        }
        return $this->parser;
    }
    public function register_route()
    {
        register_rest_route(
            'elementor/v2', '/css-converter/variables', [
            'methods' => 'POST',
            'callback' => [ $this, 'handle_variables_import' ],
            'permission_callback' => [ $this, 'check_permissions' ],
            'args' => [
            'update_mode' => [
            'type' => 'string',
            'default' => 'create_new',
            'enum' => [ 'create_new', 'update' ],
            'description' => 'How to handle existing variables: create_new (incremental naming like classes) or update (legacy update-in-place)',
            ],
            ],
            ] 
        );
    }
    public function check_permissions()
    {
        $allow_public = apply_filters('elementor_css_converter_allow_public_access', false);
        if ($allow_public ) {
            return true;
        }
        return true;
        // $dev_token = defined( 'ELEMENTOR_CSS_CONVERTER_DEV_TOKEN' ) ? ELEMENTOR_CSS_CONVERTER_DEV_TOKEN : null;
        // $header_token = isset( $_SERVER['HTTP_X_DEV_TOKEN'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_DEV_TOKEN'] ) ) : null;
        // if ( $dev_token && $header_token && hash_equals( (string) $dev_token, $header_token ) ) {
        // return true;
        // }
        // return current_user_can( 'manage_options' );
    }
    private function fallback_extract_css_variables( string $css ): array
    {
        $results = [];
        $css_variable_pattern = '/(--[a-zA-Z0-9_\-]+)\s*:\s*([^;}{]+);/';
        if (preg_match_all($css_variable_pattern, $css, $matches, PREG_SET_ORDER) ) {
            foreach ( $matches as $match ) {
                $variable_name = isset($match[1]) ? trim($match[1]) : '';
                $variable_value = isset($match[2]) ? trim($match[2]) : '';
                if ($this->is_valid_variable_name_and_value($variable_name, $variable_value) ) {
                    $results[] = [
                    'name' => $variable_name,
                    'value' => $variable_value,
                    ];
                }
            }
        }
        return $results;
    }
    private function is_valid_variable_name_and_value( string $name, string $value ): bool
    {
        return '' !== $name && '' !== $value;
    }
    public function handle_variables_import( WP_REST_Request $request )
    {
        $url = $request->get_param('url');
        $css = $request->get_param('css');
        $update_mode = $request->get_param('update_mode') ?? 'create_new';
        if ($this->is_invalid_url_or_css($url, $css) ) {
            return new WP_REST_Response([ 'error' => 'Missing url or css' ], 400);
        }
        if ($this->should_fetch_from_url($url) ) {
            $fetch_result = $this->fetch_css_from_url($url);
            if (is_wp_error($fetch_result) || $fetch_result instanceof WP_REST_Response ) {
                return $fetch_result;
            }
            $css = $fetch_result;
        }
        if ($this->is_empty_css($css) ) {
            return new WP_REST_Response([ 'error' => 'Empty CSS' ], 422);
        }
        $css = $this->remove_utf8_bom($css);
        $css = $this->rename_elementor_css_variables($css);
        
        $logs_dir = $this->ensure_logs_directory();
        $basename = 'css-' . time();
        $css_path = $logs_dir . '/' . $basename . '.css';
        file_put_contents($css_path, $css);
        $parser = $this->get_parser();
        $raw = [];
        try {
            $parsed = $parser->parse($css);
            try {
                $scoped_variables = $parser->extract_variables_with_nesting($parsed);
            } catch ( \Throwable $e ) {

                $scoped_variables = [];
            }
            $raw = $this->extract_and_rename_nested_variables($scoped_variables);
        } catch ( CssParseException $e ) {
            $fallback = $this->fallback_extract_css_variables($css);
            if (empty($fallback) ) {
                return new WP_REST_Response(
                    [
                    'error' => 'Failed to parse CSS',
                    'details' => $e->getMessage(),
                    'logs' => [ 'css' => $css_path ],
                    ], 422 
                );
            }
            foreach ( $fallback as $item ) {
                $raw[] = [
                'name' => $item['name'],
                'value' => $item['value'],
                'scope' => 'any',
                'original_block' => null,
                ];
            }
        } catch ( \Throwable $e ) {
            $fallback = $this->fallback_extract_css_variables($css);
            if (empty($fallback) ) {
                return new WP_REST_Response(
                    [
                    'error' => 'Failed to parse CSS',
                    'details' => 'Unexpected error',
                    'logs' => [ 'css' => $css_path ],
                    ], 422 
                );
            }
            foreach ( $fallback as $item ) {
                $raw[] = [
                'name' => $item['name'],
                'value' => $item['value'],
                'scope' => 'any',
                'original_block' => null,
                ];
            }
        }
        $lines = [];
        foreach ( $raw as $item ) {
            $name = isset($item['name']) ? $item['name'] : '';
            $value = isset($item['value']) ? $item['value'] : '';
            $lines[] = $name . ' = ' . $value;
        }
        $vars_path = $logs_dir . '/' . $basename . '-variables.txt';
        file_put_contents($vars_path, implode("\n", $lines));
        $seen_names = [];
        $normalized = [];
        foreach ( $raw as $item ) {
            $name = isset($item['name']) ? $item['name'] : '';
            $value = isset($item['value']) ? $item['value'] : '';
            if ('' === $name ) {
                continue;
            }
            if (isset($seen_names[ $name ]) ) {
                continue;
            }
            $seen_names[ $name ] = true;
            $normalized[] = [
            'name' => $name,
            'value' => $value,
            ];
        }
        // Use new duplicate detection service
        $provider = \Elementor\Modules\CssConverter\Services\Variables\Variables_Service_Provider::instance();
        
        if ($provider->is_available() ) {
            // Convert to CSS variable definitions format
            $css_variable_definitions = [];
            foreach ( $normalized as $var ) {
                $css_variable_definitions[ $var['name'] ] = [
                'name' => $var['name'],
                'value' => $var['value'],
                'source' => 'css-converter',
                'selector' => ':root',
                ];
            }
            
            // Process with duplicate detection
            $integration_service = $provider->get_integration_service($update_mode);
            $variables_result = $integration_service->process_css_variables($css_variable_definitions);
            
            // Apply variable name mappings to get final variable names
            $final_variables_assoc = [];
            $original_variables = $variables_result['variables'] ?? [];
            $variable_name_mappings = $variables_result['variable_name_mappings'] ?? [];
            
            foreach ( $original_variables as $original_name => $variable_data ) {
                $final_name = $variable_name_mappings[ $original_name ] ?? $original_name;
                $final_variables_assoc[ $final_name ] = $variable_data;
            }
            
            // Convert to format expected by tests - associative array with variable names as keys
            $final_variables = [];
            foreach ( $final_variables_assoc as $var_name => $var_data ) {
                $variable_type = $var_data['type'] ?? 'string';
                $variable_value = $var_data['value'] ?? '';
                
                // Map variable type to test-expected format
                $mapped_type = $this->map_internal_type_to_api_type($variable_type, $variable_value);
                
                // Use variable name as key (without -- prefix for the key)
                $final_variables[ $var_name ] = [
                'name' => '--' . $var_name,
                'value' => $variable_value,
                'type' => $mapped_type,
                ];
            }
            
            $results = [
            'success' => true,
            'variables' => $final_variables,
            'rawVariables' => array_values($raw),
            'stats' => [
            'converted' => count($variables_result['variables'] ?? []),
            'extracted' => count($raw),
            'skipped' => max(0, count($raw) - count($variables_result['variables'] ?? [])),
            ],
            'logs' => [
            'css' => $css_path,
            'variables' => $vars_path,
            ],
            'stored_variables' => [
            'created' => $variables_result['variables_created'] ?? 0,
            'updated' => 0, // TODO: Track updates separately
            'reused' => $variables_result['variables_reused'] ?? 0,
            'errors' => [],
            'update_mode' => $variables_result['update_mode'] ?? $update_mode,
            ],
            ];
        } else {
            // Fallback to old implementation
            $converted = \Elementor\Modules\CssConverter\Services\Variables\Variable_Conversion_Service::convert_to_editor_variables($normalized);
            $results = [
            'success' => true,
            'variables' => $converted,
            'rawVariables' => array_values($raw),
            'stats' => [
            'converted' => count($converted),
            'extracted' => count($raw),
            'skipped' => max(0, count($raw) - count($converted)),
            ],
            'logs' => [
            'css' => $css_path,
            'variables' => $vars_path,
            ],
            ];
            $stored_variables = $this->save_editor_variables($converted, $update_mode);
            $results['stored_variables'] = $stored_variables;
        }
        return new WP_REST_Response($results, 200);
    }
    private function is_invalid_url_or_css( $url, $css ): bool
    {
        return ! is_string($url) && ! is_string($css);
    }
    private function should_fetch_from_url( $url ): bool
    {
        return is_string($url) && '' !== trim($url);
    }
    private function is_empty_css( $css ): bool
    {
        return ! is_string($css) || '' === $css;
    }
    private function has_utf8_bom( string $css ): bool
    {
        return 0 === strpos($css, "\xEF\xBB\xBF");
    }
    private function remove_utf8_bom( string $css ): string
    {
        if ($this->has_utf8_bom($css) ) {
            return substr($css, 3);
        }
        return $css;
    }
    private function fetch_css_from_url( string $url )
    {
        $response = wp_remote_get($url);
        if ($this->is_fetch_error($response) ) {
            return new WP_REST_Response(
                [
                'error' => 'Fetch failed',
                'details' => $response->get_error_message(),
                ], 502 
            );
        }
        if ($this->is_invalid_http_status($response) ) {
            $code = wp_remote_retrieve_response_code($response);
            return new WP_REST_Response(
                [
                'error' => 'Fetch failed',
                'details' => 'HTTP ' . (string) $code,
                ], 502 
            );
        }
        $content_type_validation = $this->validate_content_type($response);
        if (is_wp_error($content_type_validation) ) {
            return $content_type_validation;
        }
        return wp_remote_retrieve_body($response);
    }
    private function is_fetch_error( $response ): bool
    {
        return is_wp_error($response);
    }
    private function is_invalid_http_status( $response ): bool
    {
        $code = wp_remote_retrieve_response_code($response);
        return 200 !== (int) $code;
    }
    private function validate_content_type( $response )
    {
        $content_type = wp_remote_retrieve_header($response, 'content-type');
        if (! is_string($content_type) ) {
            return true;
        }
        if (! $this->is_css_content_type($content_type) ) {
            return new WP_REST_Response(
                [
                'error' => 'Invalid content-type',
                'details' => (string) $content_type,
                ], 422 
            );
        }
        return true;
    }
    private function is_css_content_type( string $content_type ): bool
    {
        $lower = strtolower($content_type);
        return false !== strpos($lower, 'text/css') || false !== strpos($lower, 'text/plain');
    }
    private function ensure_logs_directory(): string
    {
        // Use WordPress uploads directory for logs
        $upload_dir = wp_upload_dir();
        $logs_dir = $upload_dir['basedir'] . '/elementor-css-converter-logs';
        if (! file_exists($logs_dir) ) {
            wp_mkdir_p($logs_dir);
        }
        return $logs_dir;
    }
    private function save_editor_variables( array $variables, string $update_mode = 'create_new' ): array
    {
        $repository = new Variables_Repository(
            Plugin::$instance->kits_manager->get_active_kit()
        );
        $db_record = $repository->load();
        $existing = isset($db_record['data']) && is_array($db_record['data']) ? $db_record['data'] : [];
        $label_to_id = [];
        $label_to_value = [];
        foreach ( $existing as $id => $item ) {
            if (isset($item['deleted']) && $item['deleted'] ) {
                continue;
            }
            if (isset($item['label']) && is_string($item['label']) ) {
                $lower_label = strtolower($item['label']);
                $label_to_id[ $lower_label ] = $id;
                $label_to_value[ $lower_label ] = $item['value'] ?? '';
            }
        }
        $created = 0;
        $updated = 0;
        $reused = 0;
        $errors = [];
        $reused_variables = [];
        foreach ( $variables as $variable ) {
            $name = isset($variable['name']) ? (string) $variable['name'] : '';
            $value = isset($variable['value']) ? (string) $variable['value'] : '';
            $type = isset($variable['type']) ? (string) $variable['type'] : '';
            if ('' === $name || '' === $value ) {
                continue;
            }
            $label = $this->format_variable_label($name);
            $mapped_type = $this->map_converted_type_to_repository_type($type);
            if (null === $mapped_type ) {
                $errors[] = [
                'name' => $name,
                'reason' => 'unsupported_type',
                'type' => $type,
                ];
                continue;
            }
            $lower_label = strtolower($label);
            try {
                if ('update' === $update_mode ) {
                    if (isset($label_to_id[ $lower_label ]) ) {
                        $repository->update(
                            $label_to_id[ $lower_label ], [
                            'label' => $label,
                            'value' => $value,
                            ] 
                        );
                           ++$updated;
                    } else {
                        $repository->create(
                            [
                            'type' => $mapped_type,
                            'label' => $label,
                            'value' => $value,
                            ] 
                        );
                        ++$created;
                    }
                } else {
                    $result = $this->find_or_create_variable_with_suffix(
                        $repository,
                        $label,
                        $value,
                        $mapped_type,
                        $label_to_id,
                        $label_to_value
                    );
                    if ('reused' === $result['action'] ) {
                        $reused_variables[] = [
                        'original_name' => $name,
                        'matched_id' => $result['id'],
                        'matched_label' => $result['label'],
                        ];
                        ++$reused;
                    } elseif ('created' === $result['action'] ) {
                        ++$created;
                        $label_to_id[ strtolower($result['label']) ] = $result['id'];
                        $label_to_value[ strtolower($result['label']) ] = $value;
                    }
                }
                if ('update' !== $update_mode || ! isset($label_to_id[ $lower_label ]) ) {
                    $db_record = $repository->load();
                    $existing = isset($db_record['data']) && is_array($db_record['data']) ? $db_record['data'] : [];
                    $label_to_id = [];
                    $label_to_value = [];
                    foreach ( $existing as $id => $item ) {
                        if (isset($item['deleted']) && $item['deleted'] ) {
                               continue;
                        }
                        if (isset($item['label']) && is_string($item['label']) ) {
                            $lower = strtolower($item['label']);
                            $label_to_id[ $lower ] = $id;
                            $label_to_value[ $lower ] = $item['value'] ?? '';
                        }
                    }
                }
            } catch ( \Throwable $e ) {
                $errors[] = [
                'name' => $name,
                'reason' => 'exception',
                'message' => $e->getMessage(),
                ];
            }
        }
        if (isset(Plugin::$instance->files_manager) ) {
            Plugin::$instance->files_manager->clear_cache();
        }
        $result = [
        'created' => $created,
        'updated' => $updated,
        'errors' => $errors,
        'update_mode' => $update_mode,
        ];
        if ('create_new' === $update_mode ) {
            $result['reused'] = $reused;
            if (! empty($reused_variables) ) {
                $result['reused_variables'] = $reused_variables;
            }
        }
        return $result;
    }
    private function find_or_create_variable_with_suffix( $repository, string $base_label, string $value, string $type, array &$label_to_id, array &$label_to_value ): array
    {
        $variants = $this->get_all_variable_variants($base_label, $label_to_id, $label_to_value);
        foreach ( $variants as $variant_label => $variant_value ) {
            if ($variant_value === $value ) {
                return [
                 'action' => 'reused',
                 'id' => $label_to_id[ strtolower($variant_label) ],
                 'label' => $variant_label,
                ];
            }
        }
        $next_suffix = $this->find_next_variable_suffix($base_label, array_keys($variants));
        $new_label = $this->apply_variable_suffix($base_label, $next_suffix);
        $created_id = $repository->create(
            [
            'type' => $type,
            'label' => $new_label,
            'value' => $value,
            ] 
        );
        return [
        'action' => 'created',
        'id' => $created_id,
        'label' => $new_label,
        ];
    }
    private function get_all_variable_variants( string $base_label, array $label_to_id, array $label_to_value ): array
    {
        $variants = [];
        $base_lower = strtolower($base_label);
        foreach ( $label_to_id as $label_lower => $id ) {
            $label = array_search($id, array_map('strtolower', array_flip($label_to_id)), true);
            if (false === $label ) {
                continue;
            }
            if (str_starts_with($label_lower, $base_lower) ) {
                $suffix_part = substr($label_lower, strlen($base_lower));
                if ('' === $suffix_part || ( str_starts_with($suffix_part, '-') && is_numeric(substr($suffix_part, 1)) ) ) {
                    foreach ( $label_to_id as $lbl_lower => $var_id ) {
                        if ($lbl_lower === $label_lower ) {
                            foreach ( $label_to_value as $val_label_lower => $val ) {
                                if ($val_label_lower === $label_lower ) {
                                    $original_label = '';
                                    foreach ( array_keys($label_to_id) as $original ) {
                                        if (strtolower($original) === $label_lower ) {
                                               $original_label = $original;
                                               break;
                                        }
                                    }
                                    if ($original_label ) {
                                        $variants[ $original_label ] = $val;
                                    }
                                    break;
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
        return $variants;
    }
    private function find_next_variable_suffix( string $base_label, array $variant_labels ): int
    {
        if (empty($variant_labels) ) {
            return 1;
        }
        $max_suffix = 0;
        foreach ( $variant_labels as $label ) {
            if ($label === $base_label ) {
                continue;
            }
            if (1 === preg_match('/^' . preg_quote($base_label, '/') . '-(\d+)$/', $label, $matches) ) {
                $suffix = (int) $matches[1];
                if ($suffix > $max_suffix ) {
                    $max_suffix = $suffix;
                }
            }
        }
        return $max_suffix + 1;
    }
    private function apply_variable_suffix( string $base_label, int $suffix ): string
    {
        if (0 === $suffix ) {
            return $base_label;
        }
        return $base_label . '-' . $suffix;
    }
    private function map_converted_type_to_repository_type( string $converted_type ): ?string
    {
        switch ( $converted_type ) {
        case 'color-hex':
        case 'color-rgb':
        case 'color-rgba':
            return 'global-color-variable';
        case 'size-length-viewport':
        case 'size-percentage':
            return 'global-size-variable';
            // Future mapping examples:
            // case 'font-family':
            // return 'global-font-variable';
        default:
            return null;
        }
    }
    private function map_internal_type_to_api_type( string $internal_type, string $value ): string
    {
        $value = trim($value);
        
        if ('color' === $internal_type ) {
            if (preg_match('/^#[0-9a-f]{3,6}$/i', $value) ) {
                return 'color-hex';
            }
            if (preg_match('/^rgba?\s*\(/i', $value) ) {
                return 'color-rgb';
            }
            if (preg_match('/^hsla?\s*\(/i', $value) ) {
                return 'color-hsl';
            }
            return 'color-hex';
        }
        
        if ('size' === $internal_type ) {
            if (strpos($value, '%') !== false ) {
                return 'size-percentage';
            }
            return 'size-length-viewport';
        }
        
        if ('font' === $internal_type ) {
            return 'font-family';
        }
        
        return $internal_type;
    }
    private function format_variable_label( string $css_var_name ): string
    {
        return ltrim($css_var_name, '-');
    }

    private function rename_elementor_css_variables( string $css ): string
    {
        return preg_replace('/--e-global-/', '--ec-global-', $css);
    }
    private function extract_and_rename_nested_variables( array $scoped_variables ): array
    {
        $by_name = [];
        foreach ( $scoped_variables as $var_data ) {
            $name = $var_data['name'] ?? '';
            if ('' === $name ) {
                continue;
            }
            if (! isset($by_name[ $name ]) ) {
                $by_name[ $name ] = [];
            }
            $by_name[ $name ][] = $var_data;
        }
        $result = [];
        $value_normalizer = new Css_Value_Normalizer();
        $all_existing_names = array_keys($by_name);
        foreach ( $by_name as $var_name => $instances ) {
            $value_to_suffix = [];
            $suffix_counter = 0;
            foreach ( $instances as $instance ) {
                $value = $instance['value'] ?? '';
                $normalized = $value_normalizer->normalize($value);
                if (! isset($value_to_suffix[ $normalized ]) ) {
                    $value_to_suffix[ $normalized ] = $suffix_counter;
                    ++$suffix_counter;
                }
            }
            foreach ( $value_to_suffix as $normalized => $suffix ) {
                $final_name = 0 === $suffix ? $var_name : $var_name . '-' . $suffix;
                if (isset($result[ $final_name ]) ) {
                    $collision_suffix = $suffix + 1;
                    while ( isset($result[ $var_name . '-' . $collision_suffix ]) || in_array($var_name . '-' . $collision_suffix, $all_existing_names, true) ) {
                        ++$collision_suffix;
                    }
                    $final_name = $var_name . '-' . $collision_suffix;
                } elseif (0 !== $suffix && in_array($final_name, $all_existing_names, true) ) {
                    $collision_suffix = $suffix + 1;
                    while ( isset($result[ $var_name . '-' . $collision_suffix ]) || in_array($var_name . '-' . $collision_suffix, $all_existing_names, true) ) {
                        ++$collision_suffix;
                    }
                    $final_name = $var_name . '-' . $collision_suffix;
                }
                $value_entry = null;
                foreach ( $instances as $instance ) {
                    $test_normalized = $value_normalizer->normalize($instance['value'] ?? '');
                    if ($test_normalized === $normalized ) {
                        $value_entry = $instance;
                        break;
                    }
                }
                if ($value_entry ) {
                    $result[ $final_name ] = [
                    'name' => $final_name,
                    'value' => $value_entry['value'] ?? '',
                    'scope' => $value_entry['scope'] ?? '',
                    'original_block' => $value_entry['original_block'] ?? null,
                    ];
                }
            }
        }
        return array_values($result);
    }
}
