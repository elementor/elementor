<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Processor implements Css_Processor_Interface {
	private $css_output_optimizer;

	public function __construct( $css_output_optimizer = null ) {
		$this->css_output_optimizer = $css_output_optimizer;

		if ( null === $this->css_output_optimizer ) {
			$this->initialize_css_output_optimizer();
		}
	}

	private function initialize_css_output_optimizer(): void {
		$this->css_output_optimizer = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Output_Optimizer();
	}

	public function get_processor_name(): string {
		return 'global_classes';
	}

	public function get_priority(): int {
		return 40; // After style collection, before HTML modifications
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$global_class_rules = $context->get_metadata( 'global_class_rules', [] );
		$flattening_results = $context->get_metadata( 'flattening_results', [] );
		$compound_results = $context->get_metadata( 'compound_results', [] );

		return ! empty( $global_class_rules ) || ! empty( $css_rules ) || ! empty( $flattening_results ) || ! empty( $compound_results );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$css = $context->get_metadata( 'css', '' );
		$global_class_rules = $context->get_metadata( 'global_class_rules', [] );
		$flattening_results = $context->get_metadata( 'flattening_results', [] );
		$compound_results = $context->get_metadata( 'compound_results', [] );

		// Use the already classified global class rules instead of re-parsing CSS
		$css_class_rules = $global_class_rules;
		
		// If no classified rules, fall back to extracting from CSS (for backward compatibility)
		if ( empty( $css_class_rules ) ) {
			$css_class_rules = $this->extract_css_class_rules_for_global_classes( $css, $flattening_results );
		}

		// Process global classes with duplicate detection
		$global_classes_result = $this->process_global_classes_with_duplicate_detection(
			$css_class_rules,
			$flattening_results,
			$compound_results
		);

		// Store results in context
		$context->set_metadata( 'css_class_rules', $css_class_rules );
		$context->set_metadata( 'global_classes', $global_classes_result['global_classes'] );
		$context->set_metadata( 'class_name_mappings', $global_classes_result['class_name_mappings'] );
		$context->set_metadata( 'debug_duplicate_detection', $global_classes_result['debug_duplicate_detection'] );

		// Add statistics
		$context->add_statistic( 'css_class_rules_extracted', count( $css_class_rules ) );
		$context->add_statistic( 'global_classes_created', count( $global_classes_result['global_classes'] ) );
		$context->add_statistic( 'class_name_mappings_created', count( $global_classes_result['class_name_mappings'] ) );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'css_class_rules_extracted',
			'global_classes_created',
			'class_name_mappings_created',
		];
	}

	private function extract_css_class_rules_for_global_classes( string $css, array $flattening_results = [] ): array {
		if ( empty( $css ) ) {
			return [];
		}

		// Parse CSS to extract class rules
		$css_class_rules = $this->parse_css_for_class_rules( $css );

		// Optimize CSS rules before returning
		if ( ! empty( $css_class_rules ) ) {
			$css_class_rules = $this->optimize_css_class_rules( $css_class_rules );
		}

		// Include flattened classes for global class registration
		if ( ! empty( $flattening_results['flattened_classes'] ) ) {
			$css_class_rules = array_merge( $css_class_rules, $this->convert_flattened_classes_to_css_rules( $flattening_results['flattened_classes'] ) );
		}

		return $css_class_rules;
	}

	private function parse_css_for_class_rules( string $css ): array {
		// This would use the existing CSS parser logic
		// For now, return empty array as placeholder
		// In real implementation, this would parse CSS and extract class-based rules
		return [];
	}

	private function optimize_css_class_rules( array $css_class_rules ): array {
		$optimized_rules = [];

		foreach ( $css_class_rules as $rule ) {
			$selector = $rule['selector'];
			$properties_array = [];

			// Convert properties format for optimizer
			foreach ( $rule['properties'] as $prop ) {
				$property = $prop['property'] ?? '';
				$value = $prop['value'] ?? '';
				if ( ! empty( $property ) && ! empty( $value ) ) {
					$properties_array[ $property ] = $value;
				}
			}

			// Optimize using CSS Output Optimizer
			$optimized_selector_rules = $this->css_output_optimizer->optimize_css_output( [
				$selector => $properties_array,
			] );

			// Convert back to original format if not empty
			foreach ( $optimized_selector_rules as $opt_selector => $opt_properties ) {
				if ( ! empty( $opt_properties ) ) {
					$converted_properties = [];
					foreach ( $opt_properties as $property => $value ) {
						$converted_properties[] = [
							'property' => $property,
							'value' => $value,
						];
					}
					$optimized_rules[] = [
						'selector' => $opt_selector,
						'properties' => $converted_properties,
					];
				}
			}
		}

		return $optimized_rules;
	}

	private function convert_flattened_classes_to_css_rules( array $flattened_classes ): array {
		$css_rules = [];

		foreach ( $flattened_classes as $class_id => $class_data ) {
			$properties = $class_data['properties'] ?? [];
			if ( ! empty( $properties ) ) {
				$css_rules[] = [
					'selector' => '.' . $class_id,
					'properties' => $properties,
					'flattened' => true,
					'original_selector' => $class_data['css_converter_original_selector'] ?? '',
				];
			}
		}

		return $css_rules;
	}

	private function process_global_classes_with_duplicate_detection( array $css_class_rules, array $flattening_results, array $compound_results = [] ): array {
		$provider = \Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider::instance();

		if ( ! $provider->is_available() ) {
			return [
				'global_classes' => [],
				'class_name_mappings' => [],
				'debug_duplicate_detection' => null,
			];
		}

		// Process regular CSS class rules
		$integration_service = $provider->get_integration_service();
		$regular_classes_result = $integration_service->process_css_rules( $css_class_rules );

		$all_global_classes = $regular_classes_result['global_classes'] ?? [];
		$class_name_mappings = $regular_classes_result['class_name_mappings'] ?? [];
		$debug_duplicate_detection = $regular_classes_result['debug_duplicate_detection'] ?? null;

		// Process flattened classes (if any)
		$flattened_classes = $flattening_results['flattened_classes'] ?? [];
		if ( ! empty( $flattened_classes ) ) {
			$filtered_flattened_classes = $this->filter_flattened_classes_for_widgets( $flattened_classes );
			$all_global_classes = array_merge( $all_global_classes, $filtered_flattened_classes );
		}

		// Process compound classes (if any)
		$compound_classes = $compound_results['compound_global_classes'] ?? [];
		if ( ! empty( $compound_classes ) ) {
			$all_global_classes = array_merge( $all_global_classes, $compound_classes );
		}

		return [
			'global_classes' => $all_global_classes,
			'class_name_mappings' => $class_name_mappings,
			'debug_duplicate_detection' => $debug_duplicate_detection,
		];
	}

	private function filter_flattened_classes_for_widgets( array $flattened_classes ): array {
		$filtered_flattened_classes = [];

		foreach ( $flattened_classes as $class_id => $class_data ) {
			$original_selector = $class_data['css_converter_original_selector'] ?? '';

			// Skip core Elementor selectors to avoid conflicts
			if ( $this->is_core_elementor_flattened_selector( $original_selector ) ) {
				continue;
			}

			$filtered_flattened_classes[ $class_id ] = $class_data;
		}

		return $filtered_flattened_classes;
	}

	private function is_core_elementor_flattened_selector( string $selector ): bool {
		$elementor_prefixes = [
			'.elementor-',
			'.e-con-',
			'.e-',
		];

		foreach ( $elementor_prefixes as $prefix ) {
			if ( 0 === strpos( $selector, $prefix ) ) {
				return true;
			}
		}

		return false;
	}
}
