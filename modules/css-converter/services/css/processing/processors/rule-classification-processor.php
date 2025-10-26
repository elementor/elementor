<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Rule_Classification_Processor implements Css_Processor_Interface {
	public function get_processor_name(): string {
		return 'rule_classification';
	}

	public function get_priority(): int {
		return 25; // After parsing and compound processing, before style collection
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		return ! empty( $css_rules );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$flattened_rules = $context->get_metadata( 'flattened_rules', $css_rules );
		$options = $context->get_metadata( 'options', [] );

		// Split CSS rules to prevent duplicate styling
		$rule_split = $this->split_rules_for_processing( $flattened_rules, $options );

		// Store classification results in context
		$context->set_metadata( 'atomic_rules', $rule_split['atomic_rules'] );
		$context->set_metadata( 'global_class_rules', $rule_split['global_class_rules'] );

		// Add statistics
		$context->add_statistic( 'atomic_rules_classified', count( $rule_split['atomic_rules'] ) );
		$context->add_statistic( 'global_class_rules_classified', count( $rule_split['global_class_rules'] ) );
		$context->add_statistic( 'total_rules_classified', count( $flattened_rules ) );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'atomic_rules_classified',
			'global_class_rules_classified',
			'total_rules_classified',
		];
	}

	private function split_rules_for_processing( array $flattened_rules, array $options = [] ): array {
		$atomic_rules = [];
		$global_class_rules = [];

		foreach ( $flattened_rules as $rule ) {
			if ( $this->should_create_global_class_for_rule( $rule, $options ) ) {
				$global_class_rules[] = $rule;
			} else {
				$atomic_rules[] = $rule;
			}
		}

		return [
			'atomic_rules' => $atomic_rules,
			'global_class_rules' => $global_class_rules,
		];
	}

	private function should_create_global_class_for_rule( array $rule, array $options = [] ): bool {
		$selector = $rule['selector'] ?? '';
		$properties = $rule['properties'] ?? [];

		// Skip empty rules
		if ( empty( $selector ) || empty( $properties ) ) {
			return false;
		}

		// createGlobalClasses defaults to true (global classes are the default behavior)
		$create_global_classes = $options['createGlobalClasses'] ?? true;
		
		// If createGlobalClasses is explicitly false, use atomic properties for simple class selectors
		if ( false === $create_global_classes && $this->is_simple_class_selector( $selector ) ) {
			return false;
		}

		// Default behavior: Create global classes for simple class selectors
		if ( $this->is_simple_class_selector( $selector ) ) {
			return true;
		}

		// Create global classes for complex selectors that benefit from CSS specificity
		if ( $this->is_complex_reusable_selector( $selector ) ) {
			return true;
		}

		// Create global classes for rules with many properties (5+ properties benefit from global classes)
		if ( count( $properties ) >= 5 ) {
			return true;
		}

		// Default to atomic properties for other cases
		return false;
	}

	private function is_simple_class_selector( string $selector ): bool {
		$trimmed = trim( $selector );

		// Must start with a dot
		if ( 0 !== strpos( $trimmed, '.' ) ) {
			return false;
		}

		// Remove the leading dot
		$class_name = substr( $trimmed, 1 );

		// Should not contain spaces, combinators, or pseudo-selectors
		if ( preg_match( '/[\s>+~:]/', $class_name ) ) {
			return false;
		}

		// Should be a valid class name
		return preg_match( '/^[a-zA-Z_-][a-zA-Z0-9_-]*$/', $class_name );
	}

	private function has_multiple_properties( array $rule ): bool {
		$properties = $rule['properties'] ?? [];
		return count( $properties ) >= 3; // 3+ properties benefit from global classes
	}

	private function is_complex_reusable_selector( string $selector ): bool {
		// Pseudo-selectors (:hover, :focus, etc.) benefit from global classes
		if ( false !== strpos( $selector, ':' ) ) {
			return true;
		}

		// Attribute selectors benefit from global classes
		if ( false !== strpos( $selector, '[' ) ) {
			return true;
		}

		// Complex combinators benefit from global classes
		if ( preg_match( '/[>+~]/', $selector ) ) {
			return true;
		}

		return false;
	}
}
