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
	private $property_converter;

	public function __construct( $property_converter = null ) {
		$this->property_converter = $property_converter;
	}

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

		error_log( 'DEBUG: Compound processor process() called with ' . count( $css_rules ) . ' CSS rules and ' . count( $widgets ) . ' widgets' );

		if ( empty( $css_rules ) || empty( $widgets ) ) {
			error_log( 'DEBUG: Compound processor early return - empty css_rules or widgets' );
			return $context;
		}

		// Build widget class cache for efficient lookups
		$this->build_widget_class_cache( $widgets );

		// Process compound selectors
		$result = $this->process_compound_selectors( $css_rules, $widgets );

		// Validate result
		$this->validate_compound_result( $result );

		// Register compound classes with Elementor (within registry pattern)
		$registration_result = $this->register_compound_classes_with_elementor( $result['compound_global_classes'] );

		// Store results in context
		$context->set_metadata( 'compound_global_classes', $result['compound_global_classes'] );
		$context->set_metadata( 'compound_mappings', $result['compound_mappings'] );
		$context->set_metadata( 'compound_selectors_filtered', $result['filtered_count'] );
		$context->set_metadata( 'compound_registration_result', $registration_result );

		// Add statistics
		$context->add_statistic( 'compound_classes_created', count( $result['compound_global_classes'] ) );
		$context->add_statistic( 'compound_classes_registered', $registration_result['registered'] ?? 0 );
		$context->add_statistic( 'compound_selectors_processed', $result['processed_count'] );
		$context->add_statistic( 'compound_selectors_filtered', $result['filtered_count'] );
		$context->add_statistic( 'compound_selectors_no_match', $result['no_match_count'] );

		// Clear cache
		$this->widget_class_cache = [];

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'compound_classes_created',
			'compound_classes_registered',
			'compound_selectors_processed',
			'compound_selectors_filtered',
			'compound_selectors_no_match',
		];
	}

	private function register_compound_classes_with_elementor( array $compound_classes ): array {
		if ( empty( $compound_classes ) ) {
			return [
				'registered' => 0,
				'skipped' => 0,
				'error' => null,
			];
		}

		// Use the same global classes integration service as regular CSS classes

		$provider = \Elementor\Modules\CssConverter\Services\GlobalClasses\Unified\Global_Classes_Service_Provider::instance();

		if ( ! $provider->is_available() ) {
			return [
				'registered' => 0,
				'skipped' => count( $compound_classes ),
				'error' => 'Global Classes Module not available',
			];
		}

		// Convert compound classes to CSS rules format
		$css_rules = $this->convert_compound_classes_to_css_rules( $compound_classes );

		// Process through the same integration service as regular classes
		$integration_service = $provider->get_integration_service();
		$result = $integration_service->process_css_rules( $css_rules );

		return [
			'registered' => $result['registered'] ?? 0,
			'skipped' => $result['skipped'] ?? 0,
			'error' => $result['error'] ?? null,
		];
	}

	private function convert_compound_classes_to_css_rules( array $compound_classes ): array {
		$css_rules = [];

		foreach ( $compound_classes as $class_name => $class_data ) {
			// Extract properties from compound class data
			$properties = $class_data['properties'] ?? [];

			if ( empty( $properties ) ) {
				continue;
			}

			// Create CSS rule in the format expected by the integration service
			$css_rules[] = [
				'selector' => '.' . $class_name,
				'properties' => $properties,
			];
		}

		return $css_rules;
	}

	private function process_compound_selectors( array $css_rules, array $widgets ): array {
		$compound_global_classes = [];
		$compound_mappings = [];
		$processed_count = 0;
		$filtered_count = 0;
		$no_match_count = 0;

		// Get existing class names to prevent collisions
		$existing_names = $this->get_existing_class_names();
		$used_names = $existing_names;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			if ( empty( $selector ) ) {
				continue;
			}

			// Check if this is a compound class selector
			if ( ! $this->is_compound_class_selector( $selector ) ) {
				continue;
			}

			++$processed_count;

			// Filter core Elementor selectors
			if ( $this->is_core_elementor_selector( $selector ) ) {
				++$filtered_count;
				continue;
			}

			// Extract compound classes
			$classes = $this->extract_compound_classes( $selector );

			if ( count( $classes ) < 2 ) {
				continue;
			}

			// Validate classes
			if ( ! $this->validate_compound_classes( $classes ) ) {
				continue;
			}

			// Check if any widget has ALL required classes (uses cache)
			if ( ! $this->has_widgets_with_all_classes( $classes ) ) {
				++$no_match_count;
				continue;
			}

			// Create compound global class
			$compound_result = $this->create_compound_global_class(
				$selector,
				$classes,
				$rule['properties'] ?? [],
				$used_names
			);

			if ( null === $compound_result ) {
				continue;
			}

			// Store results
			$compound_class_name = $compound_result['class_name'];
			$compound_global_classes[ $compound_class_name ] = $compound_result['class_data'];
			$compound_mappings[ $selector ] = $compound_class_name;

			// Track used name
			$used_names[] = $compound_class_name;
		}

		// Build HTML class modifier mappings
		$html_class_mappings = $this->build_html_class_mappings( $compound_global_classes );

		return [
			'compound_global_classes' => $compound_global_classes,
			'compound_mappings' => $html_class_mappings,
			'processed_count' => $processed_count,
			'filtered_count' => $filtered_count,
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

	private function create_compound_global_class( string $selector, array $classes, array $properties, array $used_names ): ?array {
		// Generate compound class name
		$compound_class_name = $this->generate_compound_class_name( $classes, $used_names );

		if ( empty( $compound_class_name ) ) {
			return null;
		}

		// Convert properties if converter is available
		$atomic_props = [];
		if ( $this->property_converter && ! empty( $properties ) ) {
			try {
				// Convert properties format from [{property: 'x', value: 'y'}] to ['x' => 'y']
				$formatted_properties = [];
				foreach ( $properties as $prop ) {
					if ( isset( $prop['property'] ) && isset( $prop['value'] ) ) {
						$formatted_properties[ $prop['property'] ] = $prop['value'];
					}
				}

					$atomic_props = $this->property_converter->convert_properties_to_v4_atomic( $formatted_properties );
			} catch ( \Exception $e ) {
				// Fallback to empty props if conversion fails
				$atomic_props = [];
			}
		}

		// Create class data
		$class_data = [
			'id' => $compound_class_name,
			'label' => $compound_class_name,
			'original_selector' => $selector,
			'compound_classes' => $classes,
			'properties' => $properties,
			'atomic_props' => $atomic_props,
			'type' => 'compound',
		];

		return [
			'class_name' => $compound_class_name,
			'class_data' => $class_data,
		];
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

	private function build_html_class_mappings( array $compound_global_classes ): array {
		$html_class_mappings = [];

		error_log( 'DEBUG: build_html_class_mappings input: ' . print_r( $compound_global_classes, true ) );

		foreach ( $compound_global_classes as $compound_class_name => $class_data ) {
			$compound_classes = $class_data['compound_classes'] ?? [];

			error_log( "DEBUG: Processing compound class '$compound_class_name' with data: " . print_r( $class_data, true ) );
			error_log( 'DEBUG: Extracted compound_classes: ' . print_r( $compound_classes, true ) );

			if ( ! empty( $compound_classes ) ) {
				$html_class_mappings[ $compound_class_name ] = [
					'requires' => $compound_classes,
				];
				error_log( "DEBUG: Added to HTML mappings: $compound_class_name => " . print_r( $compound_classes, true ) );
			} else {
				error_log( "DEBUG: Skipping '$compound_class_name' - no compound_classes found" );
			}
		}

		error_log( 'DEBUG: Final HTML class mappings: ' . print_r( $html_class_mappings, true ) );
		return $html_class_mappings;
	}

	private function is_core_elementor_selector( string $selector ): bool {
		$core_patterns = [
			'/\.elementor-element\.elementor-/',
			'/\.elementor-widget\.elementor-/',
			'/\.elementor-container\.elementor-/',
			'/\.elementor-section\.elementor-/',
			'/\.elementor-column\.elementor-/',
			'/\.e-con\.e-/',
			'/\.e-flex\.e-/',
		];

		foreach ( $core_patterns as $pattern ) {
			if ( preg_match( $pattern, $selector ) ) {
				return true;
			}
		}

		return false;
	}

	private function get_existing_class_names(): array {
		// This would typically get existing global class names from the repository
		// For now, return empty array - this can be enhanced later
		return [];
	}

	private function validate_compound_result( array $result ): void {
		$required_keys = [
			'compound_global_classes',
			'compound_mappings',
			'processed_count',
			'filtered_count',
			'no_match_count',
		];

		foreach ( $required_keys as $key ) {
			if ( ! isset( $result[ $key ] ) ) {
				throw new \Exception(
					esc_html( "Compound processing result missing required key: {$key}" )
				);
			}
		}

		// Validate types
		if ( ! is_array( $result['compound_global_classes'] ) ) {
			throw new \Exception( esc_html( 'compound_global_classes must be an array' ) );
		}

		if ( ! is_array( $result['compound_mappings'] ) ) {
			throw new \Exception( esc_html( 'compound_mappings must be an array' ) );
		}

		if ( ! is_int( $result['processed_count'] ) || $result['processed_count'] < 0 ) {
			throw new \Exception( esc_html( 'processed_count must be a non-negative integer' ) );
		}
	}
}
