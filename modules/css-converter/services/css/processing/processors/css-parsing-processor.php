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
		
		$hasKitBefore = strpos( $css, '.elementor-kit-' ) !== false;
		$hasKitAfter = strpos( $beautified_css, '.elementor-kit-' ) !== false;
		if ( $hasKitBefore || $hasKitAfter ) {
			error_log( "CSS Variables DEBUG: CSS beautify - had Kit selectors before: " . ( $hasKitBefore ? 'yes' : 'no' ) . ", after: " . ( $hasKitAfter ? 'yes' : 'no' ) );
			if ( $hasKitBefore && ! $hasKitAfter ) {
				$kitPos = strpos( $css, '.elementor-kit-' );
				error_log( "CSS Variables DEBUG: Kit CSS lost during beautify! Sample: " . substr( $css, $kitPos, 200 ) );
			}
		}

		// Parse beautified CSS and extract rules
		$css_rules = $this->parse_css_and_extract_rules( $beautified_css );

		// Store results in context
		$context->set_metadata( 'css_rules', $css_rules );
		$context->add_statistic( 'css_rules_parsed', count( $css_rules ) );
		$context->add_statistic( 'css_size_bytes', strlen( $css ) );
		$context->add_statistic( 'beautified_css_size_bytes', strlen( $beautified_css ) );

		$log_file = WP_CONTENT_DIR . '/css-property-tracking.log';
		file_put_contents( $log_file, "\n" . str_repeat( '=', 80 ) . "\n", FILE_APPEND );
		file_put_contents( $log_file, date('[H:i:s] ') . "CSS_PARSING_PROCESSOR: Started\n", FILE_APPEND );
		file_put_contents( $log_file, date('[H:i:s] ') . "Total CSS rules parsed: " . count( $css_rules ) . "\n", FILE_APPEND );

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
			file_put_contents( $log_file, date('[H:i:s] ') . "Found " . count( $matching_rules ) . " rules matching target patterns\n", FILE_APPEND );
			foreach ( $matching_rules as $match ) {
				$property_names = array_map( function( $prop ) {
					return ( $prop['property'] ?? 'unknown' ) . ': ' . ( $prop['value'] ?? '' );
				}, $match['properties'] );
				
				file_put_contents( $log_file, date('[H:i:s] ') . "  Rule #{$match['index']}: {$match['selector']}\n", FILE_APPEND );
				file_put_contents( $log_file, date('[H:i:s] ') . "    Properties ({$match['property_count']}): " . implode( ', ', array_slice( $property_names, 0, 10 ) ) . "\n", FILE_APPEND );
				
				$css_vars_in_rule = array_filter( $match['properties'], function( $prop ) {
					return strpos( $prop['property'] ?? '', '--' ) === 0;
				} );
				if ( ! empty( $css_vars_in_rule ) ) {
					$var_names = array_map( function( $prop ) {
						return ( $prop['property'] ?? '' ) . ': ' . ( $prop['value'] ?? '' );
					}, $css_vars_in_rule );
					file_put_contents( $log_file, date('[H:i:s] ') . "    CSS Variables: " . implode( ', ', $var_names ) . "\n", FILE_APPEND );
				}
			}
		} else {
			file_put_contents( $log_file, date('[H:i:s] ') . "No rules found matching target patterns\n", FILE_APPEND );
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

	private function parse_css_and_extract_rules( string $css ): array {
		try {
			$parsed_css = $this->css_parser->parse( $css );
			$document = $parsed_css->get_document();
			return $this->extract_rules_from_document( $document );
		} catch ( \Exception $e ) {
			// Return empty array on parse failure
			return [];
		}
	}

	private function extract_rules_from_document( $document ): array {
		$rules = [];
		$all_rule_sets = $document->getAllRuleSets();
		$kitRuleSets = 0;
		$kitSelectors = [];

		foreach ( $all_rule_sets as $rule_set ) {
			if ( ! method_exists( $rule_set, 'getSelectors' ) ) {
				continue;
			}

			$selectors = $rule_set->getSelectors();
			$declarations = $rule_set->getRules();
			
			foreach ( $selectors as $sel ) {
				$selStr = (string) $sel;
				if ( strpos( $selStr, 'elementor-kit' ) !== false ) {
					$kitRuleSets++;
					$kitSelectors[] = $selStr;
					if ( count( $kitSelectors ) <= 3 ) {
						error_log( "CSS Variables DEBUG: Found Kit selector in document: '$selStr' with " . count( $declarations ) . " declarations" );
					}
				}
			}

			// Check if this rule set is inside a media query
			$is_media_query = $this->is_rule_set_in_media_query( $rule_set );

			$extracted_rules = $this->extract_rules_from_selectors( $selectors, $declarations, $is_media_query );
			$rules = array_merge( $rules, $extracted_rules );
		}
		
		if ( $kitRuleSets > 0 ) {
			error_log( "CSS Variables DEBUG: Found $kitRuleSets Kit rule sets in document, but only " . count( array_filter( $rules, function( $r ) { return strpos( $r['selector'] ?? '', 'elementor-kit' ) !== false; } ) ) . " in extracted rules" );
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
				$element_selectors = ['html', 'body', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'abbr', 'address', 'cite', 'code', 'del', 'dfn', 'em', 'img', 'ins', 'kbd', 'q', 'samp', 'small', 'strong', 'sub', 'sup', 'var', 'b', 'i', 'dl', 'dt', 'dd', 'ol', 'ul', 'li', 'fieldset', 'form', 'label', 'legend', 'table', 'caption', 'tbody', 'tfoot', 'thead', 'tr', 'th', 'td', 'article', 'aside', 'canvas', 'details', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'menu', 'nav', 'section', 'summary', 'time', 'mark', 'audio', 'video'];
				
				if ( in_array( trim( $selector_string ), $element_selectors, true ) ) {
					if ( count( $properties ) > 0 ) {
						$property_names = array_map( function( $prop ) { return $prop['property'] ?? 'unknown'; }, $properties );
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
