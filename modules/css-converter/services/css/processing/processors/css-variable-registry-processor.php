<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Variable_Registry_Processor implements Css_Processor_Interface {
	private $css_variable_definitions = [];

	public function get_processor_name(): string {
		return 'css_variable_registry';
	}

	public function get_priority(): int {
		return 9; // Right after CSS parsing
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$css = $context->get_metadata( 'css', '' );
		return ! empty( $css_rules ) || ! empty( $css );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents( $tracking_log, "\n" . str_repeat( '=', 80 ) . "\n", FILE_APPEND );
		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "CSS_VARIABLE_REGISTRY_PROCESSOR: Started (EARLY)\n", FILE_APPEND );

		$css_rules = $context->get_metadata( 'css_rules', [] );
		$css = $context->get_metadata( 'css', '' );
		$beautified_css = $context->get_metadata( 'beautified_css', '' );

		$this->css_variable_definitions = [];

		$variables_extracted = $this->extract_css_variable_definitions_from_rules( $css_rules );

		$cssToCheck = ! empty( $css ) ? $css : $beautified_css;

		if ( ! empty( $cssToCheck ) ) {
			$has_e66ebc9 = strpos( $cssToCheck, 'e66ebc9' ) !== false;
			if ( $has_e66ebc9 ) {
				$pos = strpos( $cssToCheck, 'e66ebc9' );
				$sample = substr( $cssToCheck, max(0, $pos - 100), 250 );
				$sample = str_replace( "\n", ' ', $sample );
				file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG: CSS contains e66ebc9 at position $pos. Sample: " . $sample . "\n", FILE_APPEND );
			}
			
			$before_kit = count( $this->css_variable_definitions );
			$kitVariablesExtracted = $this->extract_kit_css_variables_from_raw_css( $cssToCheck );
			$after_kit = count( $this->css_variable_definitions );
			$variables_extracted += $kitVariablesExtracted;
			
			if ( $has_e66ebc9 ) {
				$found = false;
				foreach ( $this->css_variable_definitions as $key => $def ) {
					if ( strpos( $key, 'e66ebc9' ) !== false ) {
						$found = true;
						file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG: Found e66ebc9 in definitions as key '{$key}' with value '{$def['value']}'\n", FILE_APPEND );
					}
				}
				if ( ! $found ) {
					file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG: e66ebc9 NOT found in extracted variables\n", FILE_APPEND );
					file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG: Sample keys: " . implode(', ', array_slice(array_keys($this->css_variable_definitions), 0, 10)) . "\n", FILE_APPEND );
				}
			}
		}

		$existing_definitions = $context->get_metadata( 'css_variable_definitions', [] );
		if ( ! empty( $existing_definitions ) ) {
			$this->css_variable_definitions = array_merge( $existing_definitions, $this->css_variable_definitions );
		}

		$context->set_metadata( 'css_variable_definitions', $this->css_variable_definitions );

		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . 'CSS_VARIABLE_REGISTRY_PROCESSOR: Extracted ' . count( $this->css_variable_definitions ) . " variable definitions\n", FILE_APPEND );

		// DEBUG: Filter for flexbox-related variables for debugging purposes only
		$relevant_vars = array_filter( $this->css_variable_definitions, function( $var ) {
			$name = is_array( $var ) ? ( $var['name'] ?? '' ) : '';
			return strpos( $name, 'display' ) !== false ||
					strpos( $name, 'flex' ) !== false ||
					strpos( $name, 'gap' ) !== false ||
					strpos( $name, 'justify' ) !== false ||
					strpos( $name, 'align' ) !== false;
		} );

		if ( ! empty( $relevant_vars ) ) {
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . 'CSS_VARIABLE_REGISTRY_PROCESSOR: Relevant variables (' . count( $relevant_vars ) . "):\n", FILE_APPEND );
			foreach ( array_slice( $relevant_vars, 0, 10 ) as $var ) {
				$name = is_array( $var ) ? ( $var['name'] ?? 'unknown' ) : 'unknown';
				$value = is_array( $var ) ? ( $var['value'] ?? '' ) : '';
				file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "  {$name}: {$value}\n", FILE_APPEND );
			}
		}

		$context->add_statistic( 'css_variables_registered', $variables_extracted );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'css_variables_registered',
		];
	}

	private function extract_css_variable_definitions_from_rules( array $css_rules ): int {
		$variables_extracted = 0;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];
			$variables_extracted += $this->process_css_variable_declarations_from_properties( $selector, $properties );
		}

		return $variables_extracted;
	}

	private function process_css_variable_declarations_from_properties( string $selector, array $properties ): int {
		$variables_processed = 0;

		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';

			if ( 0 === strpos( $property, '--' ) ) {
				$this->store_css_variable_definition( $property, $value, $selector );
				++$variables_processed;
			} else {
				$extracted = $this->extract_variable_references_from_value( $value, $selector );
				$variables_processed += $extracted;
			}
		}

		return $variables_processed;
	}

	private function extract_variable_references_from_value( string $value, string $selector ): int {
		$extracted = 0;
		if ( preg_match_all( '/var\s*\(\s*(--[a-zA-Z0-9_-]+)/', $value, $matches ) ) {
			foreach ( $matches[1] as $variable_name ) {
				$variable_name = trim( $variable_name );

				if ( ! isset( $this->css_variable_definitions[ $variable_name ] ) ) {
					$this->store_css_variable_definition( $variable_name, '', $selector );
					++$extracted;
				}
			}
		}
		return $extracted;
	}

	private function store_css_variable_definition( string $variable_name, string $value, string $selector ): void {
		$clean_name = $this->clean_variable_name( $variable_name );

		// Skip if empty value and variable already exists WITH a non-empty value
		if ( empty( $value ) && isset( $this->css_variable_definitions[ $clean_name ] ) ) {
			$existing_value = $this->css_variable_definitions[ $clean_name ]['value'] ?? '';
			if ( ! empty( $existing_value ) ) {
				return; // Don't overwrite existing non-empty value
			}
			// Continue if existing value is also empty (we'll update other metadata)
		}

		$new_specificity = $this->calculate_selector_specificity( $selector );
		$existing_specificity = 0;

		if ( isset( $this->css_variable_definitions[ $clean_name ] ) ) {
			$existing_specificity = $this->calculate_selector_specificity( $this->css_variable_definitions[ $clean_name ]['selector'] );
		}

		if ( ! isset( $this->css_variable_definitions[ $clean_name ] ) ) {
			$this->css_variable_definitions[ $clean_name ] = [
				'name' => $variable_name,
				'value' => $value,
				'selector' => $selector,
				'specificity' => $new_specificity,
				'source' => empty( $value ) ? 'extracted_from_reference' : 'extracted_from_css',
				'type' => $this->classify_variable( $variable_name, $value ),
			];
		} elseif ( empty( $this->css_variable_definitions[ $clean_name ]['value'] ) || $this->css_variable_definitions[ $clean_name ]['source'] === 'extracted_from_reference' ) {
			if ( ! empty( $value ) ) {
				$this->css_variable_definitions[ $clean_name ]['value'] = $value;
				$this->css_variable_definitions[ $clean_name ]['selector'] = $selector;
				$this->css_variable_definitions[ $clean_name ]['specificity'] = $new_specificity;
				$this->css_variable_definitions[ $clean_name ]['source'] = 'extracted_from_css';
			}
		} elseif ( $new_specificity > $existing_specificity ) {
			$this->css_variable_definitions[ $clean_name ]['value'] = $value;
			$this->css_variable_definitions[ $clean_name ]['selector'] = $selector;
			$this->css_variable_definitions[ $clean_name ]['specificity'] = $new_specificity;
			$this->css_variable_definitions[ $clean_name ]['type'] = $this->classify_variable( $variable_name, $value );
		}
	}

	private function clean_variable_name( string $variable_name ): string {
		$clean = trim( $variable_name );
		if ( 0 === strpos( $clean, '--' ) ) {
			$clean = substr( $clean, 2 );
		}
		return $clean;
	}

	private function calculate_selector_specificity( string $selector ): int {
		$id_count = substr_count( $selector, '#' );
		$class_count = substr_count( $selector, '.' );
		$element_count = preg_match_all( '/\b[a-z]+\b/', $selector );
		return ( $id_count * 100 ) + ( $class_count * 10 ) + $element_count;
	}

	private function extract_kit_css_variables_from_raw_css( string $css ): int {
		$extracted = 0;

		$hasVariables = strpos( $css, '--' ) !== false;

		$tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		
		if ( ! $hasVariables ) {
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG KIT: No variables found in CSS (size: " . strlen($css) . ")\n", FILE_APPEND );
			return 0;
		}
		
		// Check if CSS contains Kit selector
		$hasKitSelector = strpos( $css, '.elementor-kit-' ) !== false;
		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG KIT: hasVariables=true, hasKitSelector=" . ($hasKitSelector ? 'true' : 'false') . "\n", FILE_APPEND );
		
		if ( $hasKitSelector ) {
			$kit_pos = strpos( $css, '.elementor-kit-' );
			$kit_sample = substr( $css, $kit_pos, 200 );
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG KIT: Kit CSS found at position $kit_pos: " . str_replace("\n", ' ', $kit_sample) . "\n", FILE_APPEND );
		}

		$patterns = [
			'/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/',
			'/(--[a-zA-Z0-9-]+)\s*:\s*([^}]+?)(?=\s*--[a-zA-Z0-9-]+|\s*})/)',
			'/(--[a-zA-Z0-9-]+):([^;]+);/',
		];

		$allVarMatches = [];
		$tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		foreach ( $patterns as $pattern_idx => $pattern ) {
			preg_match_all( $pattern, $css, $matches, PREG_SET_ORDER );
			if ( ! empty( $matches ) ) {
				file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG KIT PATTERN $pattern_idx matched " . count($matches) . " variables\n", FILE_APPEND );
				$allVarMatches = array_merge( $allVarMatches, $matches );
			}
		}
		
		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG KIT: Total matches = " . count($allVarMatches) . "\n", FILE_APPEND );

		$e66ebc9_found = false;
		foreach ( $allVarMatches as $match ) {
			$varName = trim( $match[1] );
			$varValue = trim( $match[2] ?? '' );

			$clean_name = $this->clean_variable_name( $varName );
			
			// DEBUG: Check if this is e66ebc9
			if ( strpos( $varName, 'e66ebc9' ) !== false || strpos( $clean_name, 'e66ebc9' ) !== false ) {
				$e66ebc9_found = true;
				file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG EXTRACTION: Found '{$varName}' = '{$varValue}' -> clean: '{$clean_name}'\n", FILE_APPEND );
			}

			// Store variable definition, overwriting if current value is empty
			$existing_value = $this->css_variable_definitions[ $clean_name ]['value'] ?? null;
			if ( $existing_value === null || $existing_value === '' ) {
				$this->css_variable_definitions[ $clean_name ] = [
					'name' => $varName,
					'value' => $varValue,
					'selector' => 'kit-css',
					'specificity' => 1000,
					'source' => 'extracted_from_kit_css',
				];
				++$extracted;
				
				if ( strpos( $clean_name, 'e66ebc9' ) !== false ) {
					file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG STORED: '{$clean_name}' = '{$varValue}' (was: '{$existing_value}')\n", FILE_APPEND );
				}
			} else {
				if ( strpos( $clean_name, 'e66ebc9' ) !== false ) {
					file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG SKIPPED: '{$clean_name}' already has value '{$existing_value}' (new: '{$varValue}')\n", FILE_APPEND );
				}
			}
		}
		
		if ( ! $e66ebc9_found ) {
			$totalMatches = count($allVarMatches);
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "DEBUG KIT: e66ebc9 NOT found in $totalMatches matches. First 5 matches:\n", FILE_APPEND );
			for ( $i = 0; $i < min(5, $totalMatches); $i++ ) {
				$sample_name = trim($allVarMatches[$i][1] ?? '');
				$sample_value = trim($allVarMatches[$i][2] ?? '');
				file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "  Match $i: '{$sample_name}' = '{$sample_value}'\n", FILE_APPEND );
			}
		}

		return $extracted;
	}

	private function classify_variable( string $var_name, string $value ): string {
		$VARIABLE_TYPE_COLOR = 'color';
		$VARIABLE_TYPE_FONT = 'font';
		$VARIABLE_TYPE_SIZE = 'size';
		$VARIABLE_TYPE_LOCAL = 'local';
		$VARIABLE_TYPE_UNSUPPORTED = 'unsupported';

		if ( $this->is_color_variable( $var_name, $value ) ) {
			return $VARIABLE_TYPE_COLOR;
		}

		if ( $this->is_font_variable( $var_name, $value ) ) {
			return $VARIABLE_TYPE_FONT;
		}

		if ( $this->is_size_variable( $var_name, $value ) ) {
			return $VARIABLE_TYPE_SIZE;
		}

		if ( $this->is_local_variable( $var_name ) ) {
			return $VARIABLE_TYPE_LOCAL;
		}

		return $VARIABLE_TYPE_UNSUPPORTED;
	}

	private function is_color_variable( string $var_name, string $value ): bool {
		if ( strpos( $var_name, '--e-global-color-' ) === 0 ) {
			return true;
		}

		if ( $this->is_color_value( $value ) ) {
			return true;
		}

		return false;
	}

	private function is_font_variable( string $var_name, string $value ): bool {
		if ( strpos( $var_name, '-font-family' ) !== false ) {
			return true;
		}

		if ( strpos( $var_name, '--e-global-typography-' ) === 0 && strpos( $var_name, '-font-family' ) !== false ) {
			return true;
		}

		return false;
	}

	private function is_size_variable( string $var_name, string $value ): bool {
		if ( strpos( $var_name, '--e-global-size-' ) === 0 ) {
			return true;
		}

		if ( ! class_exists( 'ElementorPro\\Plugin' ) ) {
			return false;
		}

		return false;
	}

	private function is_size_value( string $value ): bool {
		return (bool) preg_match( '/^-?\d+\.?\d*(px|em|rem|%|vh|vw|vmin|vmax|auto)$/', trim( $value ) );
	}

	private function is_color_value( string $value ): bool {
		$value = trim( $value );

		if ( preg_match( '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/', $value ) ) {
			return true;
		}

		if ( preg_match( '/^rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/', $value ) ) {
			return true;
		}

		if ( preg_match( '/^rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/', $value ) ) {
			return true;
		}

		$named_colors = [
			'red',
			'blue',
			'green',
			'yellow',
			'orange',
			'purple',
			'pink',
			'brown',
			'black',
			'white',
			'gray',
			'grey',
			'transparent',
			'currentColor',
		];

		return in_array( strtolower( $value ), $named_colors, true );
	}

	private function is_local_variable( string $var_name ): bool {
		$local_variable_patterns = [
			'display',
			'flex-direction',
			'justify-content',
			'align-items',
			'align-content',
			'flex-wrap',
			'text-align',
			'font-weight',
			'position',
			'z-index',
			'padding-top',
			'padding-right',
			'padding-bottom',
			'padding-left',
			'padding-block-start',
			'padding-block-end',
			'padding-inline-start',
			'padding-inline-end',
			'margin-top',
			'margin-right',
			'margin-bottom',
			'margin-left',
			'margin-block-start',
			'margin-block-end',
			'margin-inline-start',
			'margin-inline-end',
			'border-radius',
			'border-top-width',
			'border-right-width',
			'border-bottom-width',
			'border-left-width',
			'border-block-start-width',
			'border-block-end-width',
			'border-inline-start-width',
			'border-inline-end-width',
			'width',
			'height',
			'gap',
			'row-gap',
			'column-gap',
			'widgets-spacing-row',
			'widgets-spacing-column',
			'container-max-width',
			'container-widget-flex-grow',
			'background-overlay',
		];

		foreach ( $local_variable_patterns as $pattern ) {
			if ( strpos( $var_name, '--' . $pattern ) === 0 ) {
				return true;
			}
		}

		return false;
	}
}
