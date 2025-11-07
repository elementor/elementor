<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Variables_Processor implements Css_Processor_Interface {
	private $css_variable_definitions = [];

	public function get_processor_name(): string {
		return 'css_variables';
	}

	public function get_priority(): int {
		return 60; // After style collection, before global classes
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		return ! empty( $css_rules );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$log_file = WP_CONTENT_DIR . '/scoped-vars.log';

		$css_rules = $context->get_metadata( 'css_rules', [] );
		$css = $context->get_metadata( 'css', '' );
		$beautified_css = $context->get_metadata( 'beautified_css', '' );
		$cssToCheck = ! empty( $css ) ? $css : $beautified_css;
		$options = $context->get_metadata( 'options', [] );
		$enable_smart_filtering = $options['enable_smart_variable_filtering'] ?? false;

		$this->css_variable_definitions = $context->get_metadata( 'css_variable_definitions', [] );

		$tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents( $tracking_log, "\n" . str_repeat( '-', 80 ) . "\n", FILE_APPEND );
		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "CSS_VARIABLES_PROCESSOR: Started (LATE - filtering/merging)\n", FILE_APPEND );
		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . 'CSS_VARIABLES_PROCESSOR: Received ' . count( $this->css_variable_definitions ) . " variables from registry\n", FILE_APPEND );

		// CRITICAL FIX: Check if CSS rules have already been resolved by CSS Variable Resolver
		$has_resolved_variables = $this->detect_resolved_variables_in_rules( $css_rules );
		if ( $has_resolved_variables ) {
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "CSS_VARIABLES_PROCESSOR: SKIPPING - CSS rules already contain resolved variables from CSS Variable Resolver\n", FILE_APPEND );
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "CSS_VARIABLES_PROCESSOR: Preserving resolved CSS rules to prevent overwriting display:flex with var(--display)\n", FILE_APPEND );

			// Only process variable definitions, do not re-extract from CSS rules
			$this->process_variable_definitions_only( $context, $tracking_log );
			return $context;
		}

		if ( empty( $this->css_variable_definitions ) ) {
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "CSS_VARIABLES_PROCESSOR: WARNING - No variables from registry, performing fallback extraction\n", FILE_APPEND );

			$variables_extracted = $this->extract_css_variable_definitions_from_rules( $css_rules );

			if ( ! empty( $cssToCheck ) ) {
				$before_kit = count( $this->css_variable_definitions );
				$kitVariablesExtracted = $this->extract_kit_css_variables_from_raw_css( $cssToCheck );
				$after_kit = count( $this->css_variable_definitions );
				$variables_extracted += $kitVariablesExtracted;
				file_put_contents( $log_file, date( '[H:i:s] ' ) . "Kit variables: before=$before_kit, after=$after_kit, extracted=$kitVariablesExtracted\n", FILE_APPEND );
			}
		} else {
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "CSS_VARIABLES_PROCESSOR: Using variables from registry processor\n", FILE_APPEND );
		}

		$options = $context->get_metadata( 'options', [] );
		$target_selector = $options['selector'] ?? '';

		$log_file = WP_CONTENT_DIR . '/scoped-vars.log';
		file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Options: ' . json_encode( array_keys( $options ) ) . "\n", FILE_APPEND );
		file_put_contents( $log_file, date( '[H:i:s] ' ) . "Target selector: '$target_selector'\n", FILE_APPEND );
		file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Total CSS rules: ' . count( $css_rules ) . "\n", FILE_APPEND );

		if ( ! empty( $target_selector ) ) {
			$target_classes = $this->extract_classes_from_selector( $target_selector );
			$scoped_css_rules = $this->filter_css_rules_by_classes( $css_rules, $target_classes );
			file_put_contents( $log_file, date( '[H:i:s] ' ) . "SCOPED: Selector='$target_selector', classes=" . implode( ',', $target_classes ) . ', scoped rules=' . count( $scoped_css_rules ) . ' of ' . count( $css_rules ) . "\n", FILE_APPEND );

			if ( count( $scoped_css_rules ) === 0 && count( $css_rules ) > 0 ) {
				// DEBUG: Log sample rules for debugging when scoped rules are empty
				$sample_rules = array_slice( $css_rules, 0, 5 );
				foreach ( $sample_rules as $idx => $rule ) {
					$selector = $rule['selector'] ?? 'NO_SELECTOR_KEY';
					file_put_contents( $log_file, date( '[H:i:s] ' ) . "Rule $idx: selector='$selector'\n", FILE_APPEND );
				}
			}
		} else {
			// Use all CSS rules when no target selector is provided
			// This ensures we don't miss global variable definitions
			$scoped_css_rules = $css_rules;
			file_put_contents( $log_file, date( '[H:i:s] ' ) . 'FALLBACK: No target selector, using all CSS rules (' . count( $scoped_css_rules ) . ")\n", FILE_APPEND );
		}

		try {
			$referenced_variables_from_rules = $this->extract_variable_references_from_rules( $scoped_css_rules );

			$referenced_variables_from_css_string = [];
			if ( ! empty( $target_selector ) && ! empty( $target_classes ) && ! empty( $cssToCheck ) ) {
				$scoped_css_string = $this->extract_css_rules_containing_selector( $cssToCheck, $target_selector );

				$html = $context->get_metadata( 'html', '' );
				file_put_contents( $log_file, date( '[H:i:s] ' ) . 'HTML length: ' . strlen( $html ) . " bytes\n", FILE_APPEND );
				if ( strlen( $html ) > 0 ) {
					$sample = substr( $html, 0, 500 );
					file_put_contents( $log_file, date( '[H:i:s] ' ) . 'HTML sample: ' . $sample . "\n", FILE_APPEND );
				}
				$original_element_classes = $this->extract_classes_from_html_element( $html, $target_selector );
				file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Original HTML element classes: ' . implode( ', ', $original_element_classes ) . "\n", FILE_APPEND );

				$widgets = $context->get_widgets();
				$widget_types = $this->extract_widget_types_from_widgets( $widgets );

				file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Widget types found: ' . implode( ', ', $widget_types ) . "\n", FILE_APPEND );

				$widget_css = '';
				foreach ( $widget_types as $widget_type ) {
					$widget_class_name = 'elementor-widget-' . str_replace( '_', '-', $widget_type );
					$widget_css .= $this->extract_css_rules_containing_selector( $cssToCheck, $widget_class_name );
				}

				foreach ( $original_element_classes as $class ) {
					if ( strpos( $class, 'elementor-widget-' ) === 0 ) {
						$widget_css .= $this->extract_css_rules_containing_selector( $cssToCheck, '.' . $class );
						file_put_contents( $log_file, date( '[H:i:s] ' ) . "Adding CSS for original widget class: .$class\n", FILE_APPEND );
					}
				}

				$combined_css = $scoped_css_string . "\n" . $widget_css;

				file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Filtered CSS: scoped=' . strlen( $scoped_css_string ) . ', widget=' . strlen( $widget_css ) . ', total=' . strlen( $combined_css ) . " bytes\n", FILE_APPEND );
				if ( strlen( $combined_css ) > 0 && strlen( $combined_css ) < 2000 ) {
					file_put_contents( $log_file, date( '[H:i:s] ' ) . "Combined CSS:\n" . substr( $combined_css, 0, 1500 ) . "\n", FILE_APPEND );
				}

				$referenced_variables_from_css_string = $this->extract_variable_references_from_css_string( $combined_css );
				file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Found ' . count( $referenced_variables_from_css_string ) . " references in filtered CSS\n", FILE_APPEND );
			} else {
				$referenced_variables_from_css_string = $this->extract_variable_references_from_css_string( $cssToCheck );
			}

			$widget_variable_references = $context->get_metadata( 'widget_variable_references', [] );

			$all_referenced_variables = array_unique( array_merge(
				$referenced_variables_from_rules,
				$referenced_variables_from_css_string,
				$widget_variable_references
			) );

			file_put_contents( $log_file, date( '[H:i:s] ' ) . 'References: ' . count( $referenced_variables_from_rules ) . ' from scoped rules, ' . count( $referenced_variables_from_css_string ) . ' from CSS string, ' . count( $widget_variable_references ) . ' from widget properties, total=' . count( $all_referenced_variables ) . "\n", FILE_APPEND );
		} catch ( \Exception $e ) {
			error_log( 'Error extracting references: ' . $e->getMessage() );
			file_put_contents( $log_file, date( '[H:i:s] ' ) . 'ERROR extracting references: ' . $e->getMessage() . "\n", FILE_APPEND );
			$all_referenced_variables = [];
		}
		if ( ! empty( $all_referenced_variables ) ) {
			file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Sample references: ' . implode( ', ', array_slice( $all_referenced_variables, 0, 10 ) ) . "\n", FILE_APPEND );
		}
		$tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents( $tracking_log, "\n" . str_repeat( '-', 80 ) . "\n", FILE_APPEND );
		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "CSS_VARIABLES_PROCESSOR: Started\n", FILE_APPEND );
		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . 'Total CSS variable definitions extracted: ' . count( $this->css_variable_definitions ) . "\n", FILE_APPEND );

		// DEBUG: Filter for flexbox-related variables for debugging purposes only
		$relevant_vars = array_filter( $this->css_variable_definitions, function( $var ) {
			$name = $var['name'] ?? '';
			return strpos( $name, 'display' ) !== false ||
					strpos( $name, 'flex' ) !== false ||
					strpos( $name, 'gap' ) !== false ||
					strpos( $name, 'justify' ) !== false ||
					strpos( $name, 'align' ) !== false;
		} );

		if ( ! empty( $relevant_vars ) ) {
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . 'Relevant CSS variables extracted (' . count( $relevant_vars ) . "):\n", FILE_APPEND );
			foreach ( $relevant_vars as $var ) {
				file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "  {$var['name']}: {$var['value']}\n", FILE_APPEND );
			}
		}

		file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Before filter: ' . count( $this->css_variable_definitions ) . " definitions\n", FILE_APPEND );
		if ( count( $this->css_variable_definitions ) > 0 ) {
			$all_def_keys = array_keys( $this->css_variable_definitions );
			$sample_defs = array_slice( $all_def_keys, 0, 10 );
			file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Sample definitions: ' . implode( ', ', $sample_defs ) . "\n", FILE_APPEND );

			$ec_global_defs = array_filter( $all_def_keys, function( $key ) {
				return strpos( $key, 'e-global-color' ) !== false || strpos( $key, 'e-global-typography' ) !== false;
			} );
			file_put_contents( $log_file, date( '[H:i:s] ' ) . 'EC-global definitions found: ' . count( $ec_global_defs ) . ' (' . implode( ', ', array_slice( $ec_global_defs, 0, 10 ) ) . ")\n", FILE_APPEND );

			if ( ! empty( $all_referenced_variables ) ) {
				foreach ( $all_referenced_variables as $ref ) {
					$found = in_array( $ref, $all_def_keys, true );
					file_put_contents( $log_file, date( '[H:i:s] ' ) . "Reference '$ref': " . ( $found ? 'FOUND' : 'NOT FOUND' ) . " in definitions\n", FILE_APPEND );
				}
			}
		}

		if ( ! empty( $all_referenced_variables ) ) {
			$before_filter = count( $this->css_variable_definitions );

			foreach ( $all_referenced_variables as $ref_var ) {
				if ( ! isset( $this->css_variable_definitions[ $ref_var ] ) ) {
					$original_name = $ref_var;
					if ( strpos( $ref_var, '--' ) !== 0 ) {
						$original_name = '--' . $ref_var;
					}
					try {
						$this->store_css_variable_definition( $original_name, '', 'extracted_from_reference' );
					} catch ( \Exception $e ) {
						error_log( "Error storing variable '$original_name': " . $e->getMessage() );
					}
				}
			}

			try {
				$this->css_variable_definitions = $this->filter_by_references(
					$this->css_variable_definitions,
					$all_referenced_variables
				);
				$after_filter = count( $this->css_variable_definitions );
				file_put_contents( $log_file, date( '[H:i:s] ' ) . "After filter: $after_filter definitions (removed " . ( $before_filter - $after_filter ) . ")\n", FILE_APPEND );
				if ( $after_filter > 0 ) {
					$sample_vars = array_slice( array_keys( $this->css_variable_definitions ), 0, 10 );
					file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Sample variables: ' . implode( ', ', $sample_vars ) . "\n", FILE_APPEND );
				}
			} catch ( \Exception $e ) {
				error_log( 'Error filtering variables: ' . $e->getMessage() );
				file_put_contents( $log_file, date( '[H:i:s] ' ) . 'ERROR filtering: ' . $e->getMessage() . "\n", FILE_APPEND );
			}
		} else {
			file_put_contents( $log_file, date( '[H:i:s] ' ) . "WARNING: No referenced variables found!\n", FILE_APPEND );
		}

		// Merge widget-specific CSS variables with global ones
		$widget_variable_references = $context->get_metadata( 'widget_variable_references', [] );
		$widget_css_variable_definitions = $context->get_metadata( 'widget_css_variable_definitions', [] );
		$this->merge_widget_variables_with_definitions( $widget_variable_references, $widget_css_variable_definitions, $context );

		// Store results in context
		$context->set_metadata( 'css_variable_definitions', $this->css_variable_definitions );

		$tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . 'CSS_VARIABLES_PROCESSOR: Stored ' . count( $this->css_variable_definitions ) . " variable definitions in context\n", FILE_APPEND );

		// DEBUG: Filter for flexbox-related variables for debugging purposes only
		$relevant_stored = array_filter( $this->css_variable_definitions, function( $var ) {
			$name = is_array( $var ) ? ( $var['name'] ?? '' ) : '';
			if ( empty( $name ) && is_string( $var ) ) {
				return false;
			}
			return strpos( $name, 'display' ) !== false ||
					strpos( $name, 'flex' ) !== false ||
					strpos( $name, 'gap' ) !== false ||
					strpos( $name, 'justify' ) !== false ||
					strpos( $name, 'align' ) !== false;
		} );
		if ( ! empty( $relevant_stored ) ) {
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . 'CSS_VARIABLES_PROCESSOR: Relevant variables stored (' . count( $relevant_stored ) . "):\n", FILE_APPEND );
			foreach ( array_slice( $relevant_stored, 0, 20 ) as $var ) {
				$name = is_array( $var ) ? ( $var['name'] ?? 'unknown' ) : 'unknown';
				$value = is_array( $var ) ? ( $var['value'] ?? '' ) : '';
				file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "  {$name}: {$value}\n", FILE_APPEND );
			}
		}
		$variables_extracted = count( $this->css_variable_definitions );
		$context->add_statistic( 'css_variables_extracted', $variables_extracted );

		// DEBUG: Log CSS rules after processing (should be unchanged)
		$css_rules_after = $context->get_metadata( 'css_rules', [] );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'css_variables_extracted',
		];
	}

	private function extract_css_variable_definitions_from_rules( array $css_rules ): int {
		$variables_extracted = 0;

		$kitSelectors = array_filter( $css_rules, function( $rule ) {
			return strpos( $rule['selector'] ?? '', 'elementor-kit' ) !== false;
		} );

		if ( ! empty( $kitSelectors ) ) {
			error_log( 'CSS Variables DEBUG: Css_Variables_Processor found ' . count( $kitSelectors ) . ' Kit selectors in ' . count( $css_rules ) . ' total rules' );
			$firstKit = array_values( $kitSelectors )[0];
			error_log( "CSS Variables DEBUG: First Kit selector: '" . ( $firstKit['selector'] ?? 'unknown' ) . "' with " . count( $firstKit['properties'] ?? [] ) . ' properties' );
		} else {
			error_log( 'CSS Variables DEBUG: Css_Variables_Processor found NO Kit selectors in ' . count( $css_rules ) . ' total rules' );
		}

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];
				$variables_extracted += $this->process_css_variable_declarations_from_properties( $selector, $properties );
		}

		return $variables_extracted;
	}

	private function is_css_variable_definition_selector( string $selector ): bool {
		$selector = trim( $selector );

		// Common selectors that define CSS variables
		$variable_definition_selectors = [
			':root',
			'html',
			'body',
			'html:root',
			'body:root',
		];

		// Check for exact matches
		if ( in_array( $selector, $variable_definition_selectors, true ) ) {
			return true;
		}

		// Check for selectors that start with these patterns
		foreach ( $variable_definition_selectors as $pattern ) {
			if ( 0 === strpos( $selector, $pattern ) ) {
				return true;
			}
		}

		return false;
	}

	private function process_css_variable_declarations_from_properties( string $selector, array $properties ): int {
		$variables_processed = 0;
		$isKitSelector = strpos( $selector, 'elementor-kit' ) !== false;

		if ( $isKitSelector && ! empty( $properties ) ) {
			$varProps = array_filter( $properties, function( $prop ) {
				return strpos( $prop['property'] ?? '', '--' ) === 0;
			} );
			error_log( "CSS Variables DEBUG: Css_Variables_Processor processing Kit selector '$selector' with " . count( $properties ) . ' total properties, ' . count( $varProps ) . ' CSS variable properties' );
			if ( ! empty( $varProps ) ) {
				$firstVar = array_values( $varProps )[0];
				error_log( 'CSS Variables DEBUG: First Kit variable: ' . ( $firstVar['property'] ?? 'unknown' ) . " = '" . ( $firstVar['value'] ?? '' ) . "' (empty: " . ( empty( $firstVar['value'] ?? '' ) ? 'yes' : 'no' ) . ')' );
			}
		}

		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';

			if ( 0 === strpos( $property, '--' ) ) {
				if ( $isKitSelector ) {
					error_log( "CSS Variables DEBUG: Storing Kit variable '$property' = '$value' (empty: " . ( empty( $value ) ? 'yes' : 'no' ) . ')' );
				}
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

		if ( empty( $value ) && isset( $this->css_variable_definitions[ $clean_name ] ) ) {
			return;
		}

		// Calculate selector specificity to prioritize more specific selectors
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
			];
		} elseif ( empty( $this->css_variable_definitions[ $clean_name ]['value'] ) || $this->css_variable_definitions[ $clean_name ]['source'] === 'extracted_from_reference' ) {
			// Always update if existing is empty or from reference
			if ( ! empty( $value ) ) {
				$this->css_variable_definitions[ $clean_name ]['value'] = $value;
				$this->css_variable_definitions[ $clean_name ]['selector'] = $selector;
				$this->css_variable_definitions[ $clean_name ]['specificity'] = $new_specificity;
				$this->css_variable_definitions[ $clean_name ]['source'] = 'extracted_from_css';
			}
		} elseif ( $new_specificity > $existing_specificity ) {
			// Override with higher specificity selector
			$old_value = $this->css_variable_definitions[ $clean_name ]['value'];
			$this->css_variable_definitions[ $clean_name ]['value'] = $value;
			$this->css_variable_definitions[ $clean_name ]['selector'] = $selector;
			$this->css_variable_definitions[ $clean_name ]['specificity'] = $new_specificity;
			error_log( "CSS Variables: Overriding '$clean_name' with higher specificity: '$selector' (specificity: $new_specificity) > previous (specificity: $existing_specificity). Value: '$old_value' -> '$value'" );
		} else {
			// Lower specificity - keep existing
			if ( $clean_name === 'justify-content' || $clean_name === 'align-items' ) {
				error_log( "CSS Variables: Keeping existing '$clean_name' with higher specificity. Existing: '{$this->css_variable_definitions[ $clean_name ]['selector']}' (specificity: $existing_specificity), New: '$selector' (specificity: $new_specificity)" );
			}
		}
	}

	public function get_css_variable_definitions(): array {
		return $this->css_variable_definitions;
	}

	private function extract_kit_css_variables_from_raw_css( string $css ): int {
		$extracted = 0;

		$hasKitSelector = strpos( $css, '.elementor-kit-' ) !== false;
		$hasEGlobal = strpos( $css, '--e-global-' ) !== false;

		if ( ! $hasKitSelector && ! $hasEGlobal ) {
			return 0;
		}

		$log_file = WP_CONTENT_DIR . '/scoped-vars.log';

		file_put_contents( $log_file, date( '[H:i:s] ' ) . "Kit extraction: hasKitSelector=$hasKitSelector, hasEGlobal=$hasEGlobal\n", FILE_APPEND );
		file_put_contents( $log_file, date( '[H:i:s] ' ) . 'CSS length: ' . strlen( $css ) . " bytes\n", FILE_APPEND );
		if ( strlen( $css ) > 0 ) {
			$sample = substr( $css, 0, 300 );
			$trimmed_sample = trim( $sample );
			file_put_contents( $log_file, date( '[H:i:s] ' ) . 'CSS sample (first 300 chars): ' . $trimmed_sample . "\n", FILE_APPEND );

			$kit_pos = strpos( $css, '.elementor-kit-' );
			if ( $kit_pos !== false ) {
				$kit_sample = substr( $css, $kit_pos, 200 );
				file_put_contents( $log_file, date( '[H:i:s] ' ) . "Kit CSS found at position $kit_pos: " . $kit_sample . "\n", FILE_APPEND );
			} else {
				file_put_contents( $log_file, date( '[H:i:s] ' ) . "No .elementor-kit- found in CSS\n", FILE_APPEND );
			}
		}

		if ( $hasEGlobal ) {
			$patterns = [
				'/(--e-global-[a-zA-Z0-9-]+)\s*:\s*([^;]+);/',
				'/(--e-global-[a-zA-Z0-9-]+)\s*:\s*([^}]+?)(?=\s*--e-global-|\s*})/)',
			];

			$allVarMatches = [];
			foreach ( $patterns as $pattern ) {
				preg_match_all( $pattern, $css, $matches, PREG_SET_ORDER );
				if ( ! empty( $matches ) ) {
					$allVarMatches = $matches;
					break;
				}
			}

			file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Direct extraction: Found ' . count( $allVarMatches ) . " --e-global-* variables in CSS\n", FILE_APPEND );

			foreach ( $allVarMatches as $match ) {
				$varName = trim( $match[1] );
				$varValue = trim( $match[2] );

				if ( empty( $varName ) || empty( $varValue ) ) {
					continue;
				}

				$varValue = rtrim( $varValue, ';' );
				$varValue = trim( $varValue );

				// Keep original variable names

				$this->store_css_variable_definition( $varName, $varValue, 'css-direct' );
				++$extracted;
			}
		}

		if ( ! $hasKitSelector ) {
			return $extracted;
		}

		file_put_contents( $log_file, date( '[H:i:s] ' ) . "Kit extraction: Searching for .elementor-kit- selectors\n", FILE_APPEND );

		preg_match_all( '/\.elementor-kit-[^{]+\{([^}]+)\}/', $css, $kitMatches );

		if ( empty( $kitMatches[1] ) ) {
			preg_match_all( '/\.elementor-kit-[0-9]+\s*\{([^}]+)\}/', $css, $kitMatches );
		}

		if ( empty( $kitMatches[1] ) ) {
			return $extracted;
		}

		file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Kit extraction: Found ' . count( $kitMatches[1] ) . " Kit selector blocks\n", FILE_APPEND );

		foreach ( $kitMatches[1] as $kitIndex => $kitContent ) {
			$patterns = [
				'/(--[a-zA-Z0-9-]+):\s*([^;]+?)(?=\s*--[a-zA-Z0-9-]+|\s*;|\s*}|$)/',
				'/(--[a-zA-Z0-9-]+):\s*([^;}]+)/',
			];

			$varMatches = [];
			foreach ( $patterns as $pattern ) {
				preg_match_all( $pattern, $kitContent, $matches, PREG_SET_ORDER );
				if ( ! empty( $matches ) ) {
					$varMatches = $matches;
					break;
				}
			}

			foreach ( $varMatches as $match ) {
				$varName = trim( $match[1] );
				$varValue = trim( $match[2] );

				if ( empty( $varName ) || empty( $varValue ) ) {
					continue;
				}

				$varValue = rtrim( $varValue, ';' );
				$varValue = trim( $varValue );

				if ( ! isset( $this->css_variable_definitions[ $varName ] ) || empty( $this->css_variable_definitions[ $varName ]['value'] ) ) {
					$this->store_css_variable_definition( $varName, $varValue, '.elementor-kit-*' );
					++$extracted;
				}
			}
		}

		return $extracted;
	}

	private function extract_variable_references_from_rules( array $css_rules ): array {
		$referenced_variables = [];

		foreach ( $css_rules as $rule ) {
			$properties = $rule['properties'] ?? [];

			foreach ( $properties as $property => $value ) {
				if ( is_string( $value ) && strpos( $value, 'var(--' ) !== false ) {
					preg_match_all( '/var\(\s*(--[a-zA-Z0-9-]+)/', $value, $matches );

					if ( ! empty( $matches[1] ) ) {
						foreach ( $matches[1] as $var_name ) {
							$clean_name = $this->clean_variable_name( $var_name );
							$referenced_variables[ $clean_name ] = true;
						}
					}
				}
			}
		}

		return array_keys( $referenced_variables );
	}

	private function extract_variable_references_from_css_string( string $css ): array {
		if ( empty( $css ) ) {
			return [];
		}

		$referenced_variables = [];

		if ( preg_match_all( '/var\(\s*(--[a-zA-Z0-9-]+)/', $css, $matches ) ) {
			foreach ( $matches[1] as $var_name ) {
				$clean_name = $this->clean_variable_name( $var_name );
				$referenced_variables[ $clean_name ] = true;
			}
		}

		return array_keys( $referenced_variables );
	}

	private function clean_variable_name( string $var_name ): string {
		$clean_name = ltrim( $var_name, '-' );
		$clean_name = sanitize_key( $clean_name );
		return $clean_name;
	}


	private function extract_widget_types_from_widgets( array $widgets ): array {
		$log_file = WP_CONTENT_DIR . '/scoped-vars.log';
		file_put_contents( $log_file, date( '[H:i:s] ' ) . 'extract_widget_types: Received ' . count( $widgets ) . " widgets\n", FILE_APPEND );

		$widget_types = [];

		foreach ( $widgets as $idx => $widget ) {
			file_put_contents( $log_file, date( '[H:i:s] ' ) . "Widget $idx keys: " . implode( ', ', array_keys( $widget ) ) . "\n", FILE_APPEND );

			if ( isset( $widget['widget_type'] ) ) {
				$widget_types[] = $widget['widget_type'];
				file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Found widget_type: ' . $widget['widget_type'] . "\n", FILE_APPEND );
			}

			if ( isset( $widget['children'] ) && is_array( $widget['children'] ) ) {
				$child_types = $this->extract_widget_types_from_widgets( $widget['children'] );
				$widget_types = array_merge( $widget_types, $child_types );
			}
		}

		file_put_contents( $log_file, date( '[H:i:s] ' ) . 'extract_widget_types: Returning ' . count( $widget_types ) . ' types: ' . implode( ', ', $widget_types ) . "\n", FILE_APPEND );

		return array_unique( $widget_types );
	}

	private function extract_classes_from_selector( string $selector ): array {
		if ( empty( $selector ) ) {
			return [];
		}

		preg_match_all( '/\.([a-zA-Z0-9_-]+)/', $selector, $matches );
		return ! empty( $matches[1] ) ? $matches[1] : [];
	}

	private function filter_css_rules_by_classes( array $css_rules, array $target_classes ): array {
		if ( empty( $target_classes ) ) {
			return $css_rules;
		}

		$filtered_rules = [];

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			if ( empty( $selector ) ) {
				continue;
			}

			$matches_target = false;

			foreach ( $target_classes as $class ) {
				$class_escaped = preg_quote( $class, '/' );

				$patterns = [
					'/' . $class_escaped . '/',
					'/\.' . $class_escaped . '[^a-zA-Z0-9_-]/',
					'/\.' . $class_escaped . '$/',
					'/\.' . $class_escaped . '\./',
					'/\.' . $class_escaped . '\s/',
					'/\.' . $class_escaped . '>/',
					'/\.' . $class_escaped . '\{/',
				];

				foreach ( $patterns as $pattern ) {
					if ( preg_match( $pattern, $selector ) ) {
						$matches_target = true;
						break 2;
					}
				}
			}

			if ( $matches_target ) {
				$filtered_rules[] = $rule;
			}
		}

		return $filtered_rules;
	}

	private function extract_css_rules_containing_selector( string $css, string $target_selector ): string {
		if ( empty( $target_selector ) || empty( $css ) ) {
			return '';
		}

		$target_selector_clean = ltrim( $target_selector, '.' );
		$filtered_css = '';
		$length = strlen( $css );
		$pos = 0;
		$processed_rules = [];

		while ( ( $pos = strpos( $css, $target_selector_clean, $pos ) ) !== false ) {
			$start = $pos;

			while ( $start > 0 && $css[ $start - 1 ] !== '{' && $css[ $start - 1 ] !== ';' && $css[ $start - 1 ] !== '}' && $css[ $start - 1 ] !== "\n" ) {
				--$start;
			}

			$rule_start = $start;
			$rule_end = $start;
			$brace_level = 0;
			$found_opening_brace = false;

			for ( $i = $start; $i < $length; $i++ ) {
				$char = $css[ $i ];

				if ( $char === '{' ) {
					++$brace_level;
					$found_opening_brace = true;
				} elseif ( $char === '}' ) {
					--$brace_level;
					if ( $brace_level === 0 && $found_opening_brace ) {
						$rule_end = $i + 1;
						break;
					}
				}
			}

			if ( $brace_level === 0 && $rule_end > $rule_start ) {
				$rule = substr( $css, $rule_start, $rule_end - $rule_start );
				$rule_hash = md5( $rule );
				if ( ! isset( $processed_rules[ $rule_hash ] ) ) {
					$processed_rules[ $rule_hash ] = true;
					$filtered_css .= $rule . "\n";
				}
			}

			++$pos;
		}

		return $filtered_css;
	}

	private function filter_css_string_by_classes( string $css, array $target_classes ): string {
		if ( empty( $target_classes ) || empty( $css ) ) {
			return $css;
		}

		$filtered_css = '';
		$target_classes_pattern = implode( '|', array_map( function( $class ) {
			return preg_quote( $class, '/' );
		}, $target_classes ) );

		$pattern = '/([^{}]*\.(?:' . $target_classes_pattern . ')[^{}]*\{[^}]*\})/s';

		if ( preg_match_all( $pattern, $css, $matches ) ) {
			foreach ( $matches[0] as $match ) {
				if ( strpos( $filtered_css, $match ) === false ) {
					$filtered_css .= $match . "\n";
				}
			}
		}

		return $filtered_css;
	}


	private function filter_by_references( array $all_definitions, array $referenced_variables ): array {
		if ( empty( $referenced_variables ) ) {
			return [];
		}

		$filtered = [];
		$before_count = count( $all_definitions );

		foreach ( $all_definitions as $var_name => $var_data ) {
			if ( in_array( $var_name, $referenced_variables, true ) ) {
				$filtered[ $var_name ] = $var_data;
			}
		}

		$after_count = count( $filtered );

		if ( $before_count > 0 ) {
			error_log( "CSS Variables: Smart extraction - filtered from $before_count total variables to $after_count referenced variables (saved " . ( $before_count - $after_count ) . ' unused)' );
		}

		return $filtered;
	}

	private function extract_classes_from_html_element( string $html, string $selector ): array {
		if ( empty( $html ) || empty( $selector ) ) {
			return [];
		}

		$selector_class = ltrim( $selector, '.' );

		$doc = new \DOMDocument();
		@$doc->loadHTML( '<?xml encoding="UTF-8">' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );

		$xpath = new \DOMXPath( $doc );
		$elements = $xpath->query( "//*[contains(concat(' ', normalize-space(@class), ' '), ' $selector_class ')]" );

		if ( $elements->length === 0 ) {
			return [];
		}

		$element = $elements->item( 0 );
		$class_attr = $element->getAttribute( 'class' );

		if ( empty( $class_attr ) ) {
			return [];
		}

		$classes = preg_split( '/\s+/', trim( $class_attr ) );
		return array_filter( $classes );
	}

	/**
	 * Calculate CSS selector specificity
	 * Higher numbers = higher specificity = higher priority
	 */
	private function calculate_selector_specificity( string $selector ): int {
		$specificity = 0;

		// Count IDs (highest priority)
		$specificity += substr_count( $selector, '#' ) * 100;

		// Count classes, attributes, and pseudo-classes
		$specificity += preg_match_all( '/\.[\w-]+/', $selector ) * 10;
		$specificity += preg_match_all( '/\[[\w-]+/', $selector ) * 10;
		$specificity += preg_match_all( '/:[\w-]+/', $selector ) * 10;

		// Count elements and pseudo-elements
		$specificity += preg_match_all( '/\b[a-z]+\b/', $selector );

		// Penalty for generic selectors (like body, :root)
		if ( preg_match( '/^(body|:root|html)(\s|$)/', trim( $selector ) ) ) {
			$specificity -= 20; // Lower priority for generic rules
		}

		return $specificity;
	}

	/**
	 * Merge widget-specific CSS variables with global CSS variable definitions
	 * Widget variables have higher priority due to their element-specific nature
	 */
	private function merge_widget_variables_with_definitions( array $widget_variable_references, array $widget_css_variable_definitions, $context ): void {
		error_log( 'CSS Variables: merge_widget_variables_with_definitions called with ' . count( $widget_variable_references ) . ' references and ' . count( $widget_css_variable_definitions ) . ' widget definitions' );

		if ( empty( $widget_variable_references ) ) {
			error_log( 'CSS Variables: No widget variable references to merge' );
			return;
		}

		foreach ( $widget_variable_references as $var_name ) {
			$clean_name = $this->clean_variable_name( $var_name );

			// Find the widget-specific CSS variable definition
			if ( isset( $widget_css_variable_definitions[ $clean_name ] ) ) {
				$widget_definition = $widget_css_variable_definitions[ $clean_name ];
				$widget_value = $widget_definition['value'] ?? '';

				error_log( "CSS Variables: Processing widget reference '$var_name' -> clean: '$clean_name', value: '$widget_value' (from widget definitions)" );

				if ( ! empty( $widget_value ) ) {
					// Always override with widget values (they have element-specific context)
					$this->css_variable_definitions[ $clean_name ] = [
						'name' => $widget_definition['name'] ?? '--' . $clean_name,
						'value' => $widget_value,
						'selector' => 'widget-specific',
						'specificity' => 1000, // Highest priority for widget-specific
						'source' => 'widget_specific',
					];

					error_log( "CSS Variables: Widget override '$clean_name' = '$widget_value' from widget definitions" );
				}
			} else {
				error_log( "CSS Variables: No widget definition found for '$var_name' (clean: '$clean_name')" );
			}
		}
	}

	/**
	 * Detect if CSS rules contain resolved variables from CSS Variable Resolver
	 *
	 * This prevents overwriting resolved display:flex with unresolved var(--display)
	 */
	private function detect_resolved_variables_in_rules( array $css_rules ): bool {
		foreach ( $css_rules as $rule ) {
			$properties = $rule['properties'] ?? [];

			foreach ( $properties as $property_data ) {
				// Check if this property was resolved from a variable
				if ( isset( $property_data['resolved_from_variable'] ) && $property_data['resolved_from_variable'] === true ) {
					return true;
				}

				// Check for specific flex properties that are commonly resolved
				$property = $property_data['property'] ?? '';
				$value = $property_data['value'] ?? '';

				if ( in_array( $property, [ 'display', 'flex-direction', 'justify-content', 'align-items' ], true ) ) {
					// If we have a direct value (not var()) for these properties, likely resolved
					if ( ! empty( $value ) && strpos( $value, 'var(' ) === false ) {
						// Additional check: look for flex values that are commonly from variables
						if ( ( $property === 'display' && $value === 'flex' ) ||
							( $property === 'justify-content' && in_array( $value, [ 'space-between', 'center', 'flex-start', 'flex-end' ], true ) ) ||
							( $property === 'align-items' && in_array( $value, [ 'center', 'flex-start', 'flex-end', 'stretch' ], true ) ) ) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	/**
	 * Process only variable definitions without re-extracting CSS rules
	 *
	 * This preserves resolved CSS rules while still handling variable definitions
	 */
	private function process_variable_definitions_only( Css_Processing_Context $context, string $tracking_log ): void {
		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "CSS_VARIABLES_PROCESSOR: Processing variable definitions only (preserving resolved rules)\n", FILE_APPEND );

		// Update context with current variable definitions (no rule extraction)
		$context->set_metadata( 'css_variable_definitions', $this->css_variable_definitions );

		// Process widget variable references if they exist
		$widget_variable_references = $context->get_metadata( 'widget_variable_references', [] );
		if ( ! empty( $widget_variable_references ) ) {
			file_put_contents( $tracking_log, date( '[H:i:s] ' ) . 'CSS_VARIABLES_PROCESSOR: Processing ' . count( $widget_variable_references ) . " widget variable references\n", FILE_APPEND );

			// Only merge widget variables, don't re-extract CSS rules
			$this->merge_widget_variables_with_definitions( $widget_variable_references, [], $context );
		}

		file_put_contents( $tracking_log, date( '[H:i:s] ' ) . "CSS_VARIABLES_PROCESSOR: Completed (definitions only - rules preserved)\n", FILE_APPEND );
	}
}
