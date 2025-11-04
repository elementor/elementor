<?php

namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Variable_Resolver implements Css_Processor_Interface {

	public function get_processor_name(): string {
		return 'css_variable_resolver';
	}

	public function get_priority(): int {
		return 10;
	}

	public function get_statistics_keys(): array {
		return [];
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$variable_definitions = $context->get_metadata( 'css_variable_definitions', [] );
		
		return ! empty( $css_rules ) && ! empty( $variable_definitions );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents( $tracking_log, "\n" . str_repeat( '~', 80 ) . "\n", FILE_APPEND );
		file_put_contents( $tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Started\n", FILE_APPEND );
		
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$variable_definitions = $context->get_metadata( 'css_variable_definitions', [] );
		
		file_put_contents( $tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Processing " . count($css_rules) . " rules with " . count($variable_definitions) . " variable definitions\n", FILE_APPEND );
		
		$resolved_rules = $this->resolve_variables_in_rules( $css_rules, $variable_definitions );
		
		$context->set_metadata( 'css_rules', $resolved_rules );
		
		file_put_contents( $tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Completed\n", FILE_APPEND );
		
		return $context;
	}

	private function resolve_variables_in_rules( array $css_rules, array $variable_definitions ): array {
		$resolved_rules = [];
		$variables_resolved = 0;
		$tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		
		foreach ( $css_rules as $rule ) {
			$resolved_properties = [];
			
			foreach ( $rule['properties'] as $property_data ) {
				$property = $property_data['property'] ?? '';
				$value = $property_data['value'] ?? '';
				
				if ( strpos( $value, 'var(' ) !== false ) {
					$variable_type = $this->get_variable_type_from_value( $value, $variable_definitions );
					
					if ( $variable_type === 'local' || $variable_type === 'unsupported' ) {
						$resolved_value = $this->resolve_variable_reference( $value, $variable_definitions );
						if ( $resolved_value !== $value ) {
							$property_data['value'] = $resolved_value;
							$property_data['resolved_from_variable'] = true;
							$variables_resolved++;
							file_put_contents( $tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Resolved {$property}: {$value} -> {$resolved_value} (marked as resolved)\n", FILE_APPEND );
						}
					} else {
						file_put_contents( $tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Preserving {$property}: {$value} (type: {$variable_type})\n", FILE_APPEND );
					}
				}
				
				$resolved_properties[] = $property_data;
			}
			
			$rule['properties'] = $resolved_properties;
			$resolved_rules[] = $rule;
		}
		
		file_put_contents( $tracking_log, date('[H:i:s] ') . "CSS_VARIABLE_RESOLVER: Resolved {$variables_resolved} variable references\n", FILE_APPEND );
		
		return $resolved_rules;
	}

	private function resolve_variable_reference( string $value, array $variable_definitions ): string {
		return preg_replace_callback(
			'/var\s*\(\s*(--[a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\s*\)/',
			function( $matches ) use ( $variable_definitions ) {
				$var_name = trim( $matches[1] );
				$fallback = $matches[2] ?? '';
				
				$resolved_value = $this->get_variable_value( $var_name, $variable_definitions );
				
				if ( $resolved_value !== null ) {
					return $resolved_value;
				}
				
				return ! empty( $fallback ) ? trim( $fallback ) : $matches[0];
			},
			$value
		);
	}

	private function get_variable_value( string $var_name, array $variable_definitions ): ?string {
		$clean_name = ltrim( $var_name, '-' );
		
		if ( isset( $variable_definitions[ $clean_name ] ) ) {
			$var_value = $variable_definitions[ $clean_name ]['value'] ?? '';
			
			if ( ! empty( $var_value ) ) {
				return $var_value;
			}
		}
		
		return null;
	}

	private function get_variable_type_from_value( string $value, array $variable_definitions ): string {
		if ( preg_match( '/var\s*\(\s*(--[a-zA-Z0-9_-]+)/', $value, $matches ) ) {
			$var_name = $matches[1];
			return $this->get_variable_type( $var_name, $variable_definitions );
		}
		
		return 'unknown';
	}

	private function get_variable_type( string $var_name, array $variable_definitions ): string {
		$clean_name = ltrim( $var_name, '-' );
		
		if ( isset( $variable_definitions[ $clean_name ]['type'] ) ) {
			return $variable_definitions[ $clean_name ]['type'];
		}
		
		if ( $this->is_global_variable( $var_name ) ) {
			if ( strpos( $var_name, '--e-global-color-' ) === 0 ) {
				return 'color';
			}
			if ( strpos( $var_name, '--e-global-typography-' ) === 0 ) {
				return 'font';
			}
			if ( strpos( $var_name, '--e-global-size-' ) === 0 ) {
				return 'size';
			}
		}
		
		return 'local';
	}

	private function is_global_variable( string $var_name ): bool {
		$global_prefixes = [
			'--e-global-color-',
			'--e-global-typography-',
			'--e-global-size-',
		];
		
		foreach ( $global_prefixes as $prefix ) {
			if ( strpos( $var_name, $prefix ) === 0 ) {
				return true;
			}
		}
		
		return false;
	}
}
