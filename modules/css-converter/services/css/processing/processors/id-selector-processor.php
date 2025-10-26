<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Id_Selector_Processor implements Css_Processor_Interface {

	private $property_converter;

	public function __construct( $property_converter = null ) {
		$this->property_converter = $property_converter;
	}

	public function get_processor_name(): string {
		return 'id_selector';
	}

	public function get_priority(): int {
		return 55; // After Style Collection (60), before Global Classes (50)
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		return $this->has_id_selectors( $css_rules );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		$id_rules = $this->extract_id_selectors( $css_rules );
		$remaining_rules = $this->remove_id_selectors( $css_rules );


		// CRITICAL: Use the EXISTING unified style manager from context (created by Style Collection Processor)
		// This ensures all styles (inline, ID, CSS selectors) are in the same manager for proper specificity resolution
		$unified_style_manager = $context->get_metadata( 'unified_style_manager' );

		if ( ! $unified_style_manager ) {
			// This should NEVER happen - the Style Collection Processor should have created it
			throw new \Exception( 'ID_SELECTOR_PROCESSOR: No unified style manager in context. Style Collection Processor must run before ID Selector Processor.' );
		}


		$this->collect_id_styles_in_manager( $id_rules, $widgets, $unified_style_manager );

		$processed_widgets = $this->remove_id_attributes_from_widgets( $widgets );

		$context->set_widgets( $processed_widgets );
		$context->set_metadata( 'css_rules', $remaining_rules );

		// IMPORTANT: Don't overwrite the unified style manager - just add to it
		// The Style Collection Processor already set it, we're just adding our ID styles to it
		// $context->set_metadata( 'unified_style_manager', $unified_style_manager ); // ← REMOVED

		$context->add_statistic( 'id_selectors_processed', count( $id_rules ) );


		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'id_selectors_processed',
		];
	}

	private function has_id_selectors( array $css_rules ): bool {
		foreach ( $css_rules as $rule ) {
			if ( strpos( $rule['selector'] ?? '', '#' ) !== false ) {
				return true;
			}
		}
		return false;
	}

	private function extract_id_selectors( array $css_rules ): array {
		return array_filter( $css_rules, function( $rule ) {
			return strpos( $rule['selector'] ?? '', '#' ) !== false;
		} );
	}

	private function remove_id_selectors( array $css_rules ): array {
		return array_filter( $css_rules, function( $rule ) {
			return strpos( $rule['selector'] ?? '', '#' ) === false;
		} );
	}

	private function collect_id_styles_in_manager( array $id_rules, array $widgets, $unified_style_manager ): void {

		foreach ( $id_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];

			// Find widgets that match this ID selector
			$matched_elements = $this->find_widgets_matching_id_selector( $selector, $widgets );

			if ( ! empty( $matched_elements ) ) {
				// Convert properties to the format expected by unified style manager
				$converted_properties = $this->convert_rule_properties_to_atomic( $properties );

				// Collect the ID styles in the unified style manager
				$unified_style_manager->collect_id_selector_styles( $selector, $converted_properties, $matched_elements );

			}
		}
	}

	private function remove_id_attributes_from_widgets( array $widgets ): array {
		foreach ( $widgets as &$widget ) {
			$widget = $this->remove_id_attributes_recursively( $widget );
		}
		return $widgets;
	}

	private function remove_id_attributes_recursively( array $widget ): array {
		// Remove ID attribute if it exists
		if ( isset( $widget['attributes']['id'] ) ) {
			unset( $widget['attributes']['id'] );
		}

		// Process children recursively
		if ( ! empty( $widget['children'] ) && is_array( $widget['children'] ) ) {
			foreach ( $widget['children'] as &$child ) {
				$child = $this->remove_id_attributes_recursively( $child );
			}
		}

		return $widget;
	}

	private function find_widgets_matching_id_selector( string $selector, array $widgets ): array {
		$matched_elements = [];

		// Check if this is a descendant selector (e.g., "#outer #inner")
		if ( $this->is_descendant_selector( $selector ) ) {
			return $this->find_widgets_matching_descendant_selector( $selector, $widgets );
		}

		// Simple ID selector (e.g., "#header")
		$id = ltrim( $selector, '#' );

		// Handle compound selectors like "#header.class"
		if ( strpos( $id, '.' ) !== false ) {
			$id = substr( $id, 0, strpos( $id, '.' ) );
		}

		$this->find_widgets_by_id_recursively( $widgets, $id, $matched_elements );

		return $matched_elements;
	}

	private function is_descendant_selector( string $selector ): bool {
		// Check if selector has spaces (indicating descendant relationship)
		// e.g., "#outer #inner" or "#outer .class #inner"
		$trimmed = trim( $selector );
		return strpos( $trimmed, ' ' ) !== false;
	}

	private function find_widgets_matching_descendant_selector( string $selector, array $widgets ): array {
		// Parse the descendant selector into parts
		// e.g., "#outer #inner" -> ["#outer", "#inner"]
		$parts = preg_split( '/\s+/', trim( $selector ) );

		if ( empty( $parts ) ) {
			return [];
		}

		// Start with all widgets
		$current_matches = $widgets;

		// Process each part of the selector
		foreach ( $parts as $index => $part ) {
			$is_last_part = ( $index === count( $parts ) - 1 );

			if ( strpos( $part, '#' ) === 0 ) {
				// ID selector
				$id = ltrim( $part, '#' );

				// Handle compound selectors like "#header.class"
				if ( strpos( $id, '.' ) !== false ) {
					$id = substr( $id, 0, strpos( $id, '.' ) );
				}

				if ( $is_last_part ) {
					// For the last part, collect element_ids
					$matched_elements = [];
					$this->find_descendant_widgets_by_id( $current_matches, $id, $matched_elements );
					return $matched_elements;
				} else {
					// For intermediate parts, find matching widgets and search their children
					$next_matches = [];
					$this->find_widgets_with_id_for_descendant_search( $current_matches, $id, $next_matches );
					$current_matches = $next_matches;
				}
			}
		}

		return [];
	}

	private function find_widgets_with_id_for_descendant_search( array $widgets, string $target_id, array &$matched_widgets ): void {
		foreach ( $widgets as $widget ) {
			$widget_id = $widget['attributes']['id'] ?? null;

			if ( $widget_id === $target_id ) {
				// This widget matches - add its children to search space
				if ( ! empty( $widget['children'] ) && is_array( $widget['children'] ) ) {
					$matched_widgets = array_merge( $matched_widgets, $widget['children'] );
				}
			}

			// Continue searching in children
			if ( ! empty( $widget['children'] ) && is_array( $widget['children'] ) ) {
				$this->find_widgets_with_id_for_descendant_search( $widget['children'], $target_id, $matched_widgets );
			}
		}
	}

	private function find_descendant_widgets_by_id( array $widgets, string $target_id, array &$matched_elements ): void {
		foreach ( $widgets as $widget ) {
			$widget_id = $widget['attributes']['id'] ?? null;
			$element_id = $widget['element_id'] ?? null;

			if ( $widget_id === $target_id && $element_id ) {
				$matched_elements[] = $element_id;
			}

			// Continue searching in children
			if ( ! empty( $widget['children'] ) && is_array( $widget['children'] ) ) {
				$this->find_descendant_widgets_by_id( $widget['children'], $target_id, $matched_elements );
			}
		}
	}

	private function find_widgets_by_id_recursively( array $widgets, string $target_id, array &$matched_elements ): void {
		foreach ( $widgets as $widget ) {
			$widget_id = $widget['attributes']['id'] ?? null;
			$element_id = $widget['element_id'] ?? null;

			if ( $widget_id === $target_id && $element_id ) {
				$matched_elements[] = $element_id;
			}

			// Process children recursively
			if ( ! empty( $widget['children'] ) && is_array( $widget['children'] ) ) {
				$this->find_widgets_by_id_recursively( $widget['children'], $target_id, $matched_elements );
			}
		}
	}


	private function convert_property_if_needed( string $property, string $value ) {
		if ( ! $this->property_converter ) {
			return null;
		}

		try {
			return $this->property_converter->convert_property_to_v4_atomic( $property, $value );
		} catch ( \Exception $e ) {
			return null;
		}
	}

	private function convert_rule_properties_to_atomic( array $properties ): array {
		// First, expand shorthand properties (like border: 2px solid red)
		$simple_props = [];
		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';
			$simple_props[ $property ] = $value;
		}

		// Expand shorthand properties using the CSS Shorthand Expander
		require_once __DIR__ . '/../css-shorthand-expander.php';
		$expanded_props = \Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander::expand_shorthand_properties( $simple_props );


		$converted_properties = [];

		// Convert each expanded property
		foreach ( $expanded_props as $property => $value ) {
			// Find the original property data to preserve important flag
			$original_important = false;
			foreach ( $properties as $property_data ) {
				if ( ( $property_data['property'] ?? '' ) === $property ) {
					$original_important = $property_data['important'] ?? false;
					break;
				}
			}

			$converted = $this->convert_property_if_needed( $property, $value );

			$converted_properties[] = [
				'property' => $property,
				'value' => $value,
				'original_property' => $property,
				'original_value' => $value,
				'important' => $original_important,
				'converted_property' => $converted,
			];
		}

		return $converted_properties;
	}

	private function determine_atomic_type( string $prop_name ): string {
		$type_map = [
			'color' => 'color',
			'background' => 'background',
			'font-size' => 'font-size',
			'padding' => 'padding',
			'margin' => 'margin',
			'border-width' => 'border-width',
			'border-color' => 'border-color',
			'border-style' => 'border-style',
			'border-radius' => 'border-radius',
			'width' => 'size',
			'height' => 'size',
		];
		return $type_map[ $prop_name ] ?? 'text';
	}
}
