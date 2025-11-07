<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Parsing_Processor implements Css_Processor_Interface {
	private $css_parser;

	public function __construct( $css_parser = null ) {
		$this->css_parser = $css_parser;
		if ( null === $this->css_parser ) {
			$this->initialize_css_parser();
		}
	}

	private function initialize_css_parser(): void {
		$this->css_parser = new \Elementor\Modules\CssConverter\Parsers\CssParser();
	}

	public function get_processor_name(): string {
		return 'css_parsing';
	}

	public function get_priority(): int {
		return 8; // First step - parsing should happen first
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css = $context->get_metadata( 'css', '' );
		return ! empty( $css ) && null !== $this->css_parser;
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css = $context->get_metadata( 'css', '' );
		
		$debug_file = WP_CONTENT_DIR . '/unified-processor-trace.log';
		$has_kit_css = strpos($css, '.elementor-kit-') !== false;
		$has_e66ebc9_def = strpos($css, '--e-global-color-e66ebc9:#222A5A') !== false;
		file_put_contents($debug_file, "STEP 4 - CSS_PARSING_PROCESSOR START: hasKitCSS=$has_kit_css, hasE66ebc9Definition=$has_e66ebc9_def\n", FILE_APPEND);

		if ( empty( $css ) ) {
			$context->add_statistic( 'css_rules_parsed', 0 );
			return $context;
		}

		// DEBUG: Check if reset CSS is in the raw CSS
		$has_reset_css = strpos( $css, 'html, body, div, span' ) !== false;

		if ( $has_reset_css ) {
			// Extract a sample of the reset CSS for debugging
			$reset_start = strpos( $css, 'html, body, div, span' );
			$reset_sample = substr( $css, $reset_start, 200 );
		}

		// Beautify CSS before parsing for better readability and debugging
		$beautified_css = $this->beautify_css( $css );
		$context->set_metadata( 'beautified_css', $beautified_css );

		$debug_file = WP_CONTENT_DIR . '/unified-processor-trace.log';
		$hasKitBefore = strpos( $css, '.elementor-kit-' ) !== false;
		$hasKitAfter = strpos( $beautified_css, '.elementor-kit-' ) !== false;
		file_put_contents($debug_file, "STEP 4.0 - BEAUTIFY: hasKitBefore=$hasKitBefore, hasKitAfter=$hasKitAfter\n", FILE_APPEND);
		
		if ( $hasKitBefore && ! $hasKitAfter ) {
			$kitPos = strpos( $css, '.elementor-kit-' );
			$kitSample = substr( $css, $kitPos, 300 );
			file_put_contents($debug_file, "STEP 4.0 - KIT CSS LOST DURING BEAUTIFY! Sample: " . str_replace(["\n", "\r"], [' ', ' '], $kitSample) . "\n", FILE_APPEND);
		}
		
		if ( $hasKitAfter ) {
			$kitPosAfter = strpos( $beautified_css, '.elementor-kit-' );
			$kitSampleAfter = substr( $beautified_css, $kitPosAfter, 300 );
			file_put_contents($debug_file, "STEP 4.0 - KIT CSS AFTER BEAUTIFY: " . str_replace(["\n", "\r"], [' ', ' '], $kitSampleAfter) . "\n", FILE_APPEND);
		}

		// Extract Kit CSS rules manually BEFORE parsing (in case parser fails)
		$manual_kit_rules = [];
		if ( $hasKitBefore ) {
			$manual_kit_rules = $this->extract_kit_css_rules_manually( $css );
			file_put_contents($debug_file, "STEP 4.0 - MANUAL EXTRACTION: Found " . count($manual_kit_rules) . " Kit CSS rules\n", FILE_APPEND);
		}
		
		// Parse beautified CSS and extract rules
		// If parsing fails, try original CSS (beautification might have corrupted it)
		$css_rules = $this->parse_css_and_extract_rules( $beautified_css );
		
		// If parsing failed and we have Kit CSS, try original CSS
		if ( empty( $css_rules ) && $hasKitBefore ) {
			file_put_contents($debug_file, "STEP 4.0 - PARSE FAILED, TRYING ORIGINAL CSS\n", FILE_APPEND);
			$css_rules = $this->parse_css_and_extract_rules( $css );
		}
		
		// CRITICAL FIX: If parsing still failed, extract rules manually from CSS chunks
		if ( empty( $css_rules ) ) {
			file_put_contents($debug_file, "STEP 4.0 - BOTH PARSING ATTEMPTS FAILED, USING MANUAL EXTRACTION\n", FILE_APPEND);
			$css_rules = $this->extract_css_rules_manually( $css );
		}
		
		// Merge manually extracted Kit CSS rules with parsed rules
		if ( ! empty( $manual_kit_rules ) ) {
			// Remove any Kit rules that were already parsed (to avoid duplicates)
			$css_rules = array_filter( $css_rules, function( $rule ) {
				return strpos( $rule['selector'] ?? '', 'elementor-kit-' ) === false;
			} );
			// Add manually extracted Kit rules
			$css_rules = array_merge( $css_rules, $manual_kit_rules );
			file_put_contents($debug_file, "STEP 4.0 - MERGED: Total rules after merge: " . count($css_rules) . "\n", FILE_APPEND);
		}
		
		// STEP 4: Check if Kit CSS rules are parsed correctly
		$kit_rules_count = 0;
		$e66ebc9_rules_count = 0;
		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( strpos( $selector, 'elementor-kit-' ) !== false ) {
				$kit_rules_count++;
				foreach ( $rule['properties'] ?? [] as $prop ) {
					if ( strpos( $prop['property'] ?? '', 'e66ebc9' ) !== false ) {
						$e66ebc9_rules_count++;
						file_put_contents($debug_file, "STEP 4 - FOUND: Kit rule '{$selector}' has e66ebc9 property: {$prop['property']} = {$prop['value']}\n", FILE_APPEND);
					}
				}
			}
		}
		file_put_contents($debug_file, "STEP 4 - CSS_PARSING_PROCESSOR END: {$kit_rules_count} Kit rules, {$e66ebc9_rules_count} e66ebc9 properties\n", FILE_APPEND);

		// Store results in context
		$context->set_metadata( 'css_rules', $css_rules );
		$context->add_statistic( 'css_rules_parsed', count( $css_rules ) );
		$context->add_statistic( 'css_size_bytes', strlen( $css ) );
		$context->add_statistic( 'beautified_css_size_bytes', strlen( $beautified_css ) );

		$log_file = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents( $log_file, "\n" . str_repeat( '=', 80 ) . "\n", FILE_APPEND );
		file_put_contents( $log_file, date( '[H:i:s] ' ) . "CSS_PARSING_PROCESSOR: Started\n", FILE_APPEND );
		file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Total CSS rules parsed: ' . count( $css_rules ) . "\n", FILE_APPEND );

		// DEBUG: Filter and log CSS rules matching hardcoded target patterns for debugging purposes only
		$target_patterns = [
			'e-con-inner',
			'089b111',
			'a431a3a',
			'6aaaa11',
			'bb20798',
			'elementor-element-089b111',
			'elementor-element-a431a3a',
		];

		$matching_rules = [];
		foreach ( $css_rules as $index => $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];

			foreach ( $target_patterns as $pattern ) {
				if ( false !== strpos( $selector, $pattern ) ) {
					$matching_rules[] = [
						'index' => $index,
						'selector' => $selector,
						'properties' => $properties,
						'property_count' => count( $properties ),
					];
					break;
				}
			}
		}

		if ( ! empty( $matching_rules ) ) {
			file_put_contents( $log_file, date( '[H:i:s] ' ) . 'Found ' . count( $matching_rules ) . " rules matching target patterns\n", FILE_APPEND );
			foreach ( $matching_rules as $match ) {
				$property_names = array_map( function( $prop ) {
					return ( $prop['property'] ?? 'unknown' ) . ': ' . ( $prop['value'] ?? '' );
				}, $match['properties'] );

				file_put_contents( $log_file, date( '[H:i:s] ' ) . "  Rule #{$match['index']}: {$match['selector']}\n", FILE_APPEND );
				file_put_contents( $log_file, date( '[H:i:s] ' ) . "    Properties ({$match['property_count']}): " . implode( ', ', array_slice( $property_names, 0, 10 ) ) . "\n", FILE_APPEND );

				$css_vars_in_rule = array_filter( $match['properties'], function( $prop ) {
					return strpos( $prop['property'] ?? '', '--' ) === 0;
				} );
				if ( ! empty( $css_vars_in_rule ) ) {
					$var_names = array_map( function( $prop ) {
						return ( $prop['property'] ?? '' ) . ': ' . ( $prop['value'] ?? '' );
					}, $css_vars_in_rule );
					file_put_contents( $log_file, date( '[H:i:s] ' ) . '    CSS Variables: ' . implode( ', ', $var_names ) . "\n", FILE_APPEND );
				}
			}
		} else {
			file_put_contents( $log_file, date( '[H:i:s] ' ) . "No rules found matching target patterns\n", FILE_APPEND );
		}

		// DEBUG: Check for .loading selectors
		$loading_selectors = [];
		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( false !== strpos( $selector, 'loading' ) ) {
				$loading_selectors[] = $selector;
			}
		}
		file_put_contents( '/tmp/css_parsing_debug.log', 'CSS_PARSING: Found ' . count( $loading_selectors ) . ' loading selectors: ' . implode( ', ', array_slice( $loading_selectors, 0, 10 ) ) . "\n", FILE_APPEND );

		foreach ( $css_rules as $index => $rule ) {
			$selector = $rule['selector'] ?? 'unknown';
			$properties_count = count( $rule['properties'] ?? [] );

		}

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'css_rules_parsed',
			'css_size_bytes',
			'beautified_css_size_bytes',
		];
	}

	private function beautify_css( string $css ): string {
		if ( empty( trim( $css ) ) ) {
			return $css;
		}

		$original_size = strlen( $css );

		try {
			$parsed_css = $this->css_parser->parse( $css );
			$document = $parsed_css->get_document();

			$format = \Sabberworm\CSS\OutputFormat::createPretty();
			$beautified_css = $document->render( $format );

			$beautified_size = strlen( $beautified_css );

			return $beautified_css;
		} catch ( \Exception $e ) {

			return $css;
		}
	}

	private function extract_css_rules_manually( string $css ): array {
		$rules = [];
		
		// Extract rules using regex patterns for common CSS structures
		// Pattern 1: Standard CSS rules with selectors and properties
		$pattern = '/([^{}]+)\s*\{([^{}]*)\}/';
		
		if ( preg_match_all( $pattern, $css, $matches, PREG_SET_ORDER ) ) {
			foreach ( $matches as $match ) {
				$selector = trim( $match[1] );
				$declarations_block = $match[2];
				
				// Skip @import, @media, and other @ rules for now
				if ( strpos( $selector, '@' ) === 0 ) {
					continue;
				}
				
				// Extract properties from declarations block
				$properties = [];
				
				// Pattern to match CSS properties: property: value;
				$property_pattern = '/([a-zA-Z0-9-]+)\s*:\s*([^;]+);?/';
				if ( preg_match_all( $property_pattern, $declarations_block, $prop_matches, PREG_SET_ORDER ) ) {
					foreach ( $prop_matches as $prop_match ) {
						$prop_name = trim( $prop_match[1] );
						$prop_value = trim( $prop_match[2] );
						
						// Skip empty properties
						if ( empty( $prop_name ) || empty( $prop_value ) ) {
							continue;
						}
						
						$properties[] = [
							'property' => $prop_name,
							'value' => $prop_value,
						];
					}
				}
				
				if ( ! empty( $properties ) && ! empty( $selector ) ) {
					$rules[] = [
						'selector' => $selector,
						'properties' => $properties,
					];
				}
			}
		}
		
		return $rules;
	}

	private function extract_kit_css_rules_manually( string $css ): array {
		$rules = [];
		
		// Pattern to match: .elementor-kit-XXX { --variable: value; ... }
		// Handles both minified and formatted CSS
		$pattern = '/\.elementor-kit-\d+\s*\{([^}]+)\}/';
		
		if ( preg_match_all( $pattern, $css, $matches, PREG_SET_ORDER | PREG_OFFSET_CAPTURE ) ) {
			foreach ( $matches as $match ) {
				$selector = trim( $match[0][0] );
				$selector = preg_replace( '/\{.*$/', '', $selector ); // Extract just the selector part
				$declarations_block = $match[1][0];
				
				// Extract properties from declarations block
				$properties = [];
				
				// Pattern to match CSS custom properties: --name: value;
				$property_pattern = '/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);?/';
				if ( preg_match_all( $property_pattern, $declarations_block, $prop_matches, PREG_SET_ORDER ) ) {
					foreach ( $prop_matches as $prop_match ) {
						$prop_name = trim( $prop_match[1] );
						$prop_value = trim( $prop_match[2] );
						$properties[] = [
							'property' => $prop_name,
							'value' => $prop_value,
						];
					}
				}
				
				if ( ! empty( $properties ) ) {
					$rules[] = [
						'selector' => $selector,
						'properties' => $properties,
					];
				}
			}
		}
		
		return $rules;
	}

	private function parse_css_and_extract_rules( string $css ): array {
		$debug_file = WP_CONTENT_DIR . '/unified-processor-trace.log';
		
		// Check if Kit CSS is in the input
		$has_kit_before_parse = strpos( $css, '.elementor-kit-' ) !== false;
		$has_e66ebc9_before_parse = strpos( $css, '--e-global-color-e66ebc9' ) !== false;
		file_put_contents($debug_file, "STEP 4.1 - PARSE INPUT: hasKitCSS=$has_kit_before_parse, hasE66ebc9=$has_e66ebc9_before_parse, CSS length=" . strlen($css) . "\n", FILE_APPEND);
		
		if ( $has_kit_before_parse ) {
			$kit_pos = strpos( $css, '.elementor-kit-' );
			$kit_sample = substr( $css, $kit_pos, 500 );
			file_put_contents($debug_file, "STEP 4.1 - KIT CSS SAMPLE: " . str_replace(["\n", "\r"], [' ', ' '], $kit_sample) . "\n", FILE_APPEND);
		}
		
		try {
			$parsed_css = $this->css_parser->parse( $css );
			$document = $parsed_css->get_document();
			$rules = $this->extract_rules_from_document( $document );
			
			// Check if Kit CSS rules were extracted
			$kit_rules_after = 0;
			foreach ( $rules as $rule ) {
				if ( strpos( $rule['selector'] ?? '', 'elementor-kit-' ) !== false ) {
					$kit_rules_after++;
				}
			}
			file_put_contents($debug_file, "STEP 4.2 - PARSE SUCCESS: Extracted " . count($rules) . " total rules, {$kit_rules_after} Kit rules\n", FILE_APPEND);
			
			return $rules;
		} catch ( \Exception $e ) {
			// Log the exception instead of silently failing
			file_put_contents($debug_file, "STEP 4.2 - PARSE FAILED: " . $e->getMessage() . "\n", FILE_APPEND);
			file_put_contents($debug_file, "STEP 4.2 - PARSE FAILED: Stack trace: " . $e->getTraceAsString() . "\n", FILE_APPEND);
			error_log( 'CSS Parsing Processor: Failed to parse CSS - ' . $e->getMessage() );
			// Return empty array on parse failure
			return [];
		}
	}

	private function extract_rules_from_document( $document ): array {
		$debug_file = WP_CONTENT_DIR . '/unified-processor-trace.log';
		$rules = [];
		$all_rule_sets = $document->getAllRuleSets();
		$kitRuleSets = 0;
		$kitSelectors = [];
		
		file_put_contents($debug_file, "STEP 4.3 - EXTRACT FROM DOCUMENT: Total rule sets: " . count($all_rule_sets) . "\n", FILE_APPEND);

		foreach ( $all_rule_sets as $rule_set ) {
			if ( ! method_exists( $rule_set, 'getSelectors' ) ) {
				continue;
			}

			$selectors = $rule_set->getSelectors();
			$declarations = $rule_set->getRules();

			foreach ( $selectors as $sel ) {
				$selStr = (string) $sel;
				if ( strpos( $selStr, 'elementor-kit' ) !== false ) {
					++$kitRuleSets;
					$kitSelectors[] = $selStr;
					$declaration_count = count( $declarations );
					file_put_contents($debug_file, "STEP 4.3 - KIT SELECTOR FOUND: '$selStr' with {$declaration_count} declarations\n", FILE_APPEND);
					
					// Log first few declarations to see if e66ebc9 is there
					if ( $declaration_count > 0 && count( $kitSelectors ) <= 1 ) {
						$first_decls = array_slice( $declarations, 0, 5 );
						foreach ( $first_decls as $decl ) {
							$declStr = (string) $decl;
							if ( strpos( $declStr, 'e66ebc9' ) !== false ) {
								file_put_contents($debug_file, "STEP 4.3 - E66EBC9 DECLARATION: $declStr\n", FILE_APPEND);
							}
						}
					}
				}
			}

			// Check if this rule set is inside a media query
			$is_media_query = $this->is_rule_set_in_media_query( $rule_set );

			$extracted_rules = $this->extract_rules_from_selectors( $selectors, $declarations, $is_media_query );
			
			// Check if Kit rules were extracted
			$kit_extracted = 0;
			foreach ( $extracted_rules as $extracted_rule ) {
				if ( strpos( $extracted_rule['selector'] ?? '', 'elementor-kit' ) !== false ) {
					$kit_extracted++;
				}
			}
			if ( $kit_extracted > 0 ) {
				file_put_contents($debug_file, "STEP 4.3 - KIT RULES EXTRACTED: {$kit_extracted} rules from selector set\n", FILE_APPEND);
			}
			
			$rules = array_merge( $rules, $extracted_rules );
		}

		if ( $kitRuleSets > 0 ) {
			$final_kit_rules = count( array_filter( $rules, function( $r ) {
				return strpos( $r['selector'] ?? '', 'elementor-kit' ) !== false;
			} ) );
			file_put_contents($debug_file, "STEP 4.3 - EXTRACT SUMMARY: Found {$kitRuleSets} Kit rule sets in document, but only {$final_kit_rules} in extracted rules\n", FILE_APPEND);
			error_log( "CSS Variables DEBUG: Found $kitRuleSets Kit rule sets in document, but only $final_kit_rules in extracted rules" );
		}

		return $rules;
	}

	private function extract_rules_from_selectors( array $selectors, array $declarations, bool $is_media_query = false ): array {
		$rules = [];

		foreach ( $selectors as $selector ) {
			$selector_string = (string) $selector;
			$properties = $this->extract_properties_from_declarations( $declarations );

			// CRITICAL FIX: Handle comma-separated selectors by splitting them into individual rules
			if ( strpos( $selector_string, ',' ) !== false ) {
				$individual_selectors = array_map( 'trim', explode( ',', $selector_string ) );

				foreach ( $individual_selectors as $individual_selector ) {
					if ( ! empty( $individual_selector ) && ! empty( $properties ) ) {
						$individual_rule = [
							'selector' => $individual_selector,
							'properties' => $properties,
						];

						// Mark media query rules for filtering
						if ( $is_media_query ) {
							$individual_rule['media_query'] = true;
						}

						$rules[] = $individual_rule;
					}
				}
			} else {
				// Single selector - use existing logic
				// DEBUG: Log all parsed CSS rules
				$media_debug = $is_media_query ? ' [MEDIA QUERY]' : '';

				// Special debug for element selectors
				$element_selectors = [ 'html', 'body', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'abbr', 'address', 'cite', 'code', 'del', 'dfn', 'em', 'img', 'ins', 'kbd', 'q', 'samp', 'small', 'strong', 'sub', 'sup', 'var', 'b', 'i', 'dl', 'dt', 'dd', 'ol', 'ul', 'li', 'fieldset', 'form', 'label', 'legend', 'table', 'caption', 'tbody', 'tfoot', 'thead', 'tr', 'th', 'td', 'article', 'aside', 'canvas', 'details', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'menu', 'nav', 'section', 'summary', 'time', 'mark', 'audio', 'video' ];

				if ( in_array( trim( $selector_string ), $element_selectors, true ) ) {
					if ( count( $properties ) > 0 ) {
						$property_names = array_map( function( $prop ) {
							return $prop['property'] ?? 'unknown';
						}, $properties );
					}
				} else {
				}

				if ( ! empty( $properties ) ) {
					$rule = [
						'selector' => $selector_string,
						'properties' => $properties,
					];

					// Mark media query rules for filtering
					if ( $is_media_query ) {
						$rule['media_query'] = true;
					}

					$rules[] = $rule;
				} else {
					// DEBUG: Log selectors with no properties (might be reset CSS)
					if ( strpos( $selector_string, 'html' ) !== false || strpos( $selector_string, 'body' ) !== false ) {
					}
				}
			}
		}

		return $rules;
	}

	private function is_rule_set_in_media_query( $rule_set ): bool {
		// Check if the rule set has a parent that is a media query
		if ( method_exists( $rule_set, 'getParent' ) ) {
			$parent = $rule_set->getParent();

			// Walk up the parent chain to find media queries
			while ( $parent ) {
				// Check if parent is a media query (AtRule with media type)
				if ( method_exists( $parent, 'atRuleName' ) && $parent->atRuleName() === 'media' ) {
					return true;
				}

				// Check class name as fallback
				$class_name = get_class( $parent );
				if ( strpos( $class_name, 'Media' ) !== false || strpos( $class_name, 'AtRule' ) !== false ) {
					// Additional check for media-specific at-rules
					if ( method_exists( $parent, 'getRule' ) ) {
						$rule_name = $parent->getRule();
						if ( 'media' === $rule_name ) {
							return true;
						}
					}
				}

				// Move to next parent
				$parent = method_exists( $parent, 'getParent' ) ? $parent->getParent() : null;
			}
		}

		return false;
	}

	private function extract_properties_from_declarations( array $declarations ): array {
		$properties = [];

		foreach ( $declarations as $declaration ) {
			if ( $this->is_valid_declaration( $declaration ) ) {
				$property = $this->create_property_from_declaration( $declaration );

				// Skip empty properties (filtered out)
				if ( ! empty( $property ) ) {
					$properties[] = $property;
				}
			}
		}

		return $properties;
	}

	private function is_valid_declaration( $declaration ): bool {
		return method_exists( $declaration, 'getRule' ) && method_exists( $declaration, 'getValue' );
	}

	private function create_property_from_declaration( $declaration ): array {
		$property = $declaration->getRule();
		$value = (string) $declaration->getValue();
		$important = method_exists( $declaration, 'getIsImportant' ) ? $declaration->getIsImportant() : false;

		// FILTER: Skip font-family properties (not supported in current implementation)
		if ( 'font-family' === $property ) {
			return []; // Return empty array to skip this property
		}

		return [
			'property' => $property,
			'value' => $value,
			'important' => $important,
		];
	}
}
