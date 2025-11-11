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

		$beautified_css = $this->beautify_css( $css );
		$context->set_metadata( 'beautified_css', $beautified_css );

		$hasKitBefore = strpos( $css, '.elementor-kit-' ) !== false;

		$manual_kit_rules = [];
		if ( $hasKitBefore ) {
			$manual_kit_rules = $this->extract_kit_css_rules_manually( $css );
		}
		
		$css_rules = $this->parse_css_and_extract_rules( $beautified_css );
		
		if ( empty( $css_rules ) && $hasKitBefore ) {
			$css_rules = $this->parse_css_and_extract_rules( $css );
		}
		
		if ( empty( $css_rules ) ) {
			$css_rules = $this->extract_css_rules_manually( $css );
		}
		
		if ( ! empty( $manual_kit_rules ) ) {
			$css_rules = array_filter( $css_rules, function( $rule ) {
				return strpos( $rule['selector'] ?? '', 'elementor-kit-' ) === false;
			} );
			$css_rules = array_merge( $css_rules, $manual_kit_rules );
		}

		// Store results in context
		$context->set_metadata( 'css_rules', $css_rules );
		$context->add_statistic( 'css_rules_parsed', count( $css_rules ) );
		$context->add_statistic( 'css_size_bytes', strlen( $css ) );
		$context->add_statistic( 'beautified_css_size_bytes', strlen( $beautified_css ) );

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
				
				// CRITICAL FIX: Handle compound selectors (comma-separated)
				if ( strpos( $selector, ',' ) !== false ) {
					$individual_selectors = array_map( 'trim', explode( ',', $selector ) );
					
					foreach ( $individual_selectors as $individual_selector ) {
						if ( ! empty( $individual_selector ) && ! empty( $properties ) ) {
							$rules[] = [
								'selector' => $individual_selector,
								'properties' => $properties,
							];
							
						}
					}
				} else {
					if ( ! empty( $properties ) && ! empty( $selector ) ) {
						$rules[] = [
							'selector' => $selector,
							'properties' => $properties,
						];
					}
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
		try {
			$parsed_css = $this->css_parser->parse( $css );
			$document = $parsed_css->get_document();
			$rules = $this->extract_rules_from_document( $document );
			return $rules;
		} catch ( \Exception $e ) {
			return [];
		}
	}

	private function extract_rules_from_document( $document ): array {
		$rules = [];
		$all_rule_sets = $document->getAllRuleSets();

		foreach ( $all_rule_sets as $rule_set ) {
			if ( ! method_exists( $rule_set, 'getSelectors' ) ) {
				continue;
			}

			$selectors = $rule_set->getSelectors();
			$declarations = $rule_set->getRules();

			$is_media_query = $this->is_rule_set_in_media_query( $rule_set );

			$extracted_rules = $this->extract_rules_from_selectors( $selectors, $declarations, $is_media_query );
			
			$rules = array_merge( $rules, $extracted_rules );
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
				if ( ! empty( $properties ) ) {
					$rule = [
						'selector' => $selector_string,
						'properties' => $properties,
					];

					if ( $is_media_query ) {
						$rule['media_query'] = true;
					}

					$rules[] = $rule;
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
