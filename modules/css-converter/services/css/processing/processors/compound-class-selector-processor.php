<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Compound_Class_Selector_Processor implements Css_Processor_Interface {

	private const PRIORITY = 20;
	private const PROCESSOR_NAME = 'compound_class_selector';
	private const MAX_COMPOUND_CLASSES = 5;

	private array $widget_class_cache = [];


	public function get_processor_name(): string {
		return self::PROCESSOR_NAME;
	}

	public function get_priority(): int {
		return self::PRIORITY;
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules' );
		$widgets = $context->get_widgets();

		$css_rules_count = is_array( $css_rules ) ? count( $css_rules ) : 0;
		$widgets_count = is_array( $widgets ) ? count( $widgets ) : 0;

		$supports = ! empty( $css_rules ) && ! empty( $widgets );

		return $supports;
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		if ( empty( $css_rules ) || empty( $widgets ) ) {
			return $context;
		}

		// Build widget class cache for efficient lookups
		$this->build_widget_class_cache( $widgets );

		// Transform compound selectors in css_rules in-place
		$result = $this->transform_compound_selectors_in_place( $css_rules, $widgets );

		// Update css_rules with transformed selectors
		$context->set_metadata( 'css_rules', $result['css_rules'] );

		// Store HTML modification instructions
		$css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );
		$css_class_modifiers[] = [
			'type' => 'compound',
			'mappings' => $result['compound_mappings'],
		];
		$context->set_metadata( 'css_class_modifiers', $css_class_modifiers );

		// Add statistics
		$context->add_statistic( 'compound_selectors_transformed', $result['transformed_count'] );
		$context->add_statistic( 'compound_selectors_processed', $result['processed_count'] );
		$context->add_statistic( 'compound_selectors_no_match', $result['no_match_count'] );

		// Clear cache
		$this->widget_class_cache = [];

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'compound_selectors_transformed',
			'compound_selectors_processed',
			'compound_selectors_no_match',
		];
	}

	private function transform_compound_selectors_in_place( array $css_rules, array $widgets ): array {
		$compound_mappings = [];
		$processed_count = 0;
		$transformed_count = 0;
		$no_match_count = 0;
		$used_names = [];
		$transformed_css_rules = [];

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			if ( empty( $selector ) ) {
				$transformed_css_rules[] = $rule;
				continue;
			}

			// Check if this is a compound class selector
			if ( ! $this->is_compound_class_selector( $selector ) ) {
				$transformed_css_rules[] = $rule;
				continue;
			}

			++$processed_count;

			// Extract compound classes
			$classes = $this->extract_compound_classes( $selector );

			if ( count( $classes ) < 2 ) {
				$transformed_css_rules[] = $rule;
				continue;
			}

			// Validate classes
			if ( ! $this->validate_compound_classes( $classes ) ) {
				$transformed_css_rules[] = $rule;
				continue;
			}

			// Check if any widget has ALL required classes (uses cache)
			if ( ! $this->has_widgets_with_all_classes( $classes ) ) {
				++$no_match_count;
				$transformed_css_rules[] = $rule;
				continue;
			}

			// Generate compound class name
			$compound_class_name = $this->generate_compound_class_name( $classes, $used_names );

			if ( empty( $compound_class_name ) ) {
				$transformed_css_rules[] = $rule;
				continue;
			}

			// Transform the selector in the rule: .first.second → .first-and-second
			$transformed_rule = $rule;
			$transformed_rule['selector'] = '.' . $compound_class_name;
			$transformed_css_rules[] = $transformed_rule;

			// Store HTML class mapping for modifier
			$compound_mappings[ $compound_class_name ] = [
				'requires' => $classes,
			];

			// Track used name
			$used_names[] = $compound_class_name;
			++$transformed_count;
		}

		return [
			'css_rules' => $transformed_css_rules,
			'compound_mappings' => $compound_mappings,
			'transformed_count' => $transformed_count,
			'processed_count' => $processed_count,
			'no_match_count' => $no_match_count,
		];
	}

	private function build_widget_class_cache( array $widgets ): void {
		$this->widget_class_cache = [];
		$this->extract_widget_classes_recursive( $widgets );
	}

	private function extract_widget_classes_recursive( array $widgets ): void {
		foreach ( $widgets as $widget ) {
			$widget_classes = $this->get_widget_classes( $widget );
			if ( ! empty( $widget_classes ) ) {
				$this->widget_class_cache[] = $widget_classes;
			}

			// Process children recursively
			if ( ! empty( $widget['children'] ) ) {
				$this->extract_widget_classes_recursive( $widget['children'] );
			}
		}
	}

	private function get_widget_classes( array $widget ): array {
		$classes = [];

		// Get classes from element (if element structure exists)
		if ( ! empty( $widget['element']['classes'] ) ) {
			$classes = array_merge( $classes, $widget['element']['classes'] );
		}

		// Get generated class (if element structure exists)
		if ( ! empty( $widget['element']['generated_class'] ) ) {
			$classes[] = $widget['element']['generated_class'];
		}

		// Get classes from element attributes (if element structure exists)
		if ( ! empty( $widget['element']['attributes']['class'] ) ) {
			$attr_classes = explode( ' ', $widget['element']['attributes']['class'] );
			$classes = array_merge( $classes, array_filter( $attr_classes ) );
		}

		// Get classes from direct attributes (for widgets without element structure)
		if ( ! empty( $widget['attributes']['class'] ) ) {
			$attr_classes = explode( ' ', $widget['attributes']['class'] );
			$classes = array_merge( $classes, array_filter( $attr_classes ) );
		}

		// Get classes from direct classes property
		if ( ! empty( $widget['classes'] ) ) {
			$classes = array_merge( $classes, $widget['classes'] );
		}

		return array_unique( array_filter( $classes ) );
	}

	private function is_compound_class_selector( string $selector ): bool {
		$trimmed = trim( $selector );

		// Must start with a dot
		if ( 0 !== strpos( $trimmed, '.' ) ) {
			return false;
		}

		// Must contain multiple dots without spaces between them
		$dot_count = substr_count( $trimmed, '.' );
		if ( $dot_count < 2 ) {
			return false;
		}

		// Check for compound pattern: .class1.class2 (no spaces)
		if ( preg_match( '/^\.[a-zA-Z_-][a-zA-Z0-9_-]*(\.[a-zA-Z_-][a-zA-Z0-9_-]*)+$/', $trimmed ) ) {
			return true;
		}

		return false;
	}

	private function extract_compound_classes( string $selector ): array {
		$trimmed = trim( $selector );

		// Remove leading dot and split by dots
		$without_leading_dot = ltrim( $trimmed, '.' );
		$classes = explode( '.', $without_leading_dot );

		// Filter out empty classes and validate
		$valid_classes = [];
		foreach ( $classes as $class ) {
			$class = trim( $class );
			if ( ! empty( $class ) && $this->is_valid_class_name( $class ) ) {
				$valid_classes[] = $class;
			}
		}

		return $valid_classes;
	}

	private function is_valid_class_name( string $class_name ): bool {
		// CSS class name validation
		return preg_match( '/^[a-zA-Z_-][a-zA-Z0-9_-]*$/', $class_name );
	}

	private function validate_compound_classes( array $classes ): bool {
		// Must have at least 2 classes
		if ( count( $classes ) < 2 ) {
			return false;
		}

		// Must not exceed maximum
		if ( count( $classes ) > self::MAX_COMPOUND_CLASSES ) {
			return false;
		}

		// All classes must be valid
		foreach ( $classes as $class ) {
			if ( ! $this->is_valid_class_name( $class ) ) {
				return false;
			}
		}

		return true;
	}

	private function has_widgets_with_all_classes( array $required_classes ): bool {
		foreach ( $this->widget_class_cache as $widget_classes ) {
			if ( $this->widget_has_all_classes( $widget_classes, $required_classes ) ) {
				return true;
			}
		}

		return false;
	}

	private function widget_has_all_classes( array $widget_classes, array $required_classes ): bool {
		foreach ( $required_classes as $required_class ) {
			if ( ! in_array( $required_class, $widget_classes, true ) ) {
				return false;
			}
		}

		return true;
	}


	private function generate_compound_class_name( array $classes, array $used_names ): string {
		// Sort classes for consistent naming
		$sorted_classes = $classes;
		sort( $sorted_classes );

		// Create base name
		$base_name = implode( '-and-', $sorted_classes );

		// Ensure uniqueness
		$final_name = $base_name;
		$suffix = 2;

		while ( in_array( $final_name, $used_names, true ) ) {
			$final_name = $base_name . '-' . $suffix;
			++$suffix;
		}

		return $final_name;
	}
}
