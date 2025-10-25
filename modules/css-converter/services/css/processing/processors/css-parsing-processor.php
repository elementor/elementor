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
		return 100; // High priority - parsing should happen first
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

		// Parse CSS and extract rules
		$css_rules = $this->parse_css_and_extract_rules( $css );
		
		// Store results in context
		$context->set_metadata( 'css_rules', $css_rules );
		$context->add_statistic( 'css_rules_parsed', count( $css_rules ) );
		$context->add_statistic( 'css_size_bytes', strlen( $css ) );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'css_rules_parsed',
			'css_size_bytes',
		];
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

		foreach ( $all_rule_sets as $rule_set ) {
			if ( ! method_exists( $rule_set, 'getSelectors' ) ) {
				continue;
			}

			$selectors = $rule_set->getSelectors();
			$declarations = $rule_set->getRules();

			$extracted_rules = $this->extract_rules_from_selectors( $selectors, $declarations );
			$rules = array_merge( $rules, $extracted_rules );
		}

		return $rules;
	}

	private function extract_rules_from_selectors( array $selectors, array $declarations ): array {
		$rules = [];

		foreach ( $selectors as $selector ) {
			$selector_string = (string) $selector;
			$properties = $this->extract_properties_from_declarations( $declarations );

			if ( ! empty( $properties ) ) {
				$rules[] = [
					'selector' => $selector_string,
					'properties' => $properties,
				];
			}
		}

		return $rules;
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
