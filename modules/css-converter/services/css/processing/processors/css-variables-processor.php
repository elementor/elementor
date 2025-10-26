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
		$css_rules = $context->get_metadata( 'css_rules', [] );

		// Reset variable definitions for fresh processing
		$this->css_variable_definitions = [];

		// Extract CSS variable definitions from rules
		$variables_extracted = $this->extract_css_variable_definitions_from_rules( $css_rules );

		// Store results in context
		$context->set_metadata( 'css_variable_definitions', $this->css_variable_definitions );
		$context->add_statistic( 'css_variables_extracted', $variables_extracted );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'css_variables_extracted',
		];
	}

	private function extract_css_variable_definitions_from_rules( array $css_rules ): int {
		$variables_extracted = 0;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];

			// Check if this rule contains CSS variable definitions
			if ( $this->is_css_variable_definition_selector( $selector ) ) {
				$variables_extracted += $this->process_css_variable_declarations_from_properties( $selector, $properties );
			}
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

		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';

			// Check if this is a CSS variable definition (starts with --)
			if ( 0 === strpos( $property, '--' ) ) {
				$this->store_css_variable_definition( $property, $value, $selector );
				++$variables_processed;
			}
		}

		return $variables_processed;
	}

	private function store_css_variable_definition( string $variable_name, string $value, string $selector ): void {
		// Only store Elementor global variables to avoid bloat
		if ( $this->should_preserve_css_variable( $variable_name ) ) {
			$this->css_variable_definitions[ $variable_name ] = [
				'name' => $variable_name,
				'value' => $value,
				'selector' => $selector,
				'source' => 'extracted_from_css',
			];
		}
	}

	private function should_preserve_css_variable( string $var_name ): bool {
		// Always preserve Elementor global variables
		if ( false !== strpos( $var_name, '--e-global-' ) ) {
			return true;
		}

		if ( false !== strpos( $var_name, '--elementor-' ) ) {
			return true;
		}

		// Preserve Elementor theme variables
		if ( false !== strpos( $var_name, '--e-theme-' ) ) {
			return true;
		}

		return false;
	}

	public function get_css_variable_definitions(): array {
		return $this->css_variable_definitions;
	}
}
