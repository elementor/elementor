<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;
use Elementor\Modules\CssConverter\Services\Css\Css_Selector_Utils;
use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Nested_Element_Selector_Processor implements Css_Processor_Interface {

	const PRIORITY = 14;

	private $unified_style_manager;
	private $property_converter;

	public function __construct( Unified_Style_Manager $unified_style_manager = null, Css_Property_Conversion_Service $property_converter = null ) {
		if ( null === $unified_style_manager ) {
			$specificity_calculator = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator();
			$unified_style_manager = new Unified_Style_Manager( $specificity_calculator );
		}

		if ( null === $property_converter ) {
			$property_converter = new Css_Property_Conversion_Service();
		}

		$this->unified_style_manager = $unified_style_manager;
		$this->property_converter = $property_converter;
	}

	public function get_processor_name(): string {
		return 'nested_element_selector';
	}

	public function get_priority(): int {
		return self::PRIORITY;
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		if ( empty( $css_rules ) || empty( $widgets ) ) {
			return false;
		}

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( $this->is_nested_selector_with_element_tag( $selector ) ) {
				return true;
			}
		}

		return false;
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		// DEBUG: Log what this processor receives
		foreach ( $css_rules as $index => $rule ) {
			$selector = $rule['selector'] ?? 'unknown';
			$properties_count = count( $rule['properties'] ?? [] );
		}

		if ( empty( $css_rules ) || empty( $widgets ) ) {
			return $context;
		}

		$unified_style_manager = $context->get_metadata( 'unified_style_manager' );

		if ( null === $unified_style_manager ) {
			$unified_style_manager = $this->unified_style_manager;
			$context->set_metadata( 'unified_style_manager', $unified_style_manager );
		}

		$processed_count = 0;
		$applied_count = 0;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];

			if ( empty( $properties ) ) {
				continue;
			}

			if ( ! $this->is_nested_selector_with_element_tag( $selector ) ) {
				continue;
			}

			++$processed_count;

			$target_selector = $this->extract_target_selector( $selector );

			if ( empty( $target_selector ) ) {
				continue;
			}

			$matched_elements = $this->find_matching_widgets( $target_selector, $widgets );

			if ( empty( $matched_elements ) && ! $this->starts_with_class_or_id( $target_selector ) ) {
				$element_type = $target_selector;
				$matched_elements = $this->find_widgets_by_element_type( $element_type, $widgets );
			}

			if ( empty( $matched_elements ) ) {
				continue;
			}

			$converted_properties = $this->convert_rule_properties_to_atomic( $properties );

			// Skip simple element selectors - these are handled by Reset_Styles_Processor
			if ( $this->is_simple_element_selector( $target_selector ) ) {
				continue;
			}

			// FIXED: Use collect_element_styles instead of collect_reset_styles
			// Complex element selectors (not simple reset styles) are processed here
			foreach ( $matched_elements as $element_id ) {
				foreach ( $converted_properties as $property_data ) {
					$unified_style_manager->collect_element_styles(
						$element_id,
						$target_selector,
						$property_data['property'],
						$property_data['value'],
						$property_data['important'] ?? false,
						$property_data['converted_property'] ?? null
					);
				}
			}

			++$applied_count;
		}

		// FIXED: Don't filter CSS rules - leave them intact for other processors
		// $context->set_metadata( 'css_rules', $remaining_rules );

		// DEBUG: Check if selectors are still present
		$target_selectors_remaining = [];
		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? 'unknown';
			$target_selectors_remaining[] = $selector;
		}
		
		// DEBUG: Log CSS rules after processing (all rules preserved)

		$context->add_statistic( 'nested_element_selectors_processed', $processed_count );
		$context->add_statistic( 'nested_element_selectors_applied', $applied_count );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'nested_element_selectors_processed',
			'nested_element_selectors_applied',
		];
	}

	private function is_nested_selector_with_element_tag( string $selector ): bool {
		$has_nesting = strpos( $selector, ' ' ) !== false || strpos( $selector, '>' ) !== false;

		if ( ! $has_nesting ) {
			return false;
		}

		return $this->has_element_tag_in_last_selector_part( $selector );
	}

	private function has_element_tag_in_last_selector_part( string $selector ): bool {
		$parts = preg_split( '/\s+/', trim( $selector ) );
		if ( empty( $parts ) ) {
			return false;
		}

		$last_part = end( $parts );
		$last_part = str_replace( '>', '', $last_part );
		$last_part = trim( $last_part );

		if ( preg_match( '/^[a-zA-Z][a-zA-Z0-9]*\./', $last_part ) ) {
			return true;
		}

		return Css_Selector_Utils::is_element_tag( $last_part );
	}

	private function extract_target_selector( string $selector ): string {
		$parts = explode( ' ', trim( $selector ) );

		if ( empty( $parts ) ) {
			return '';
		}

		$target = end( $parts );

		return ! empty( $target ) ? trim( $target ) : '';
	}

	private function starts_with_class_or_id( string $selector ): bool {
		return 0 === strpos( $selector, '.' ) || 0 === strpos( $selector, '#' );
	}

	private function find_matching_widgets( string $selector, array $widgets ): array {
		$matching_widget_ids = [];

		foreach ( $widgets as $widget ) {
			if ( $this->widget_matches_selector( $widget, $selector ) ) {
				$matching_widget_ids[] = $widget['id'];
			}

			if ( ! empty( $widget['children'] ) ) {
				$child_matches = $this->find_matching_widgets( $selector, $widget['children'] );
				$matching_widget_ids = array_merge( $matching_widget_ids, $child_matches );
			}
		}

		return $matching_widget_ids;
	}

	private function widget_matches_selector( array $widget, string $selector ): bool {
		if ( 0 === strpos( $selector, '.' ) ) {
			$class_name = ltrim( $selector, '.' );
			$widget_classes = $this->get_widget_classes( $widget );
			return in_array( $class_name, $widget_classes, true );
		}

		if ( 0 === strpos( $selector, '#' ) ) {
			$id = ltrim( $selector, '#' );
			return isset( $widget['attributes']['id'] ) && $widget['attributes']['id'] === $id;
		}

		return false;
	}

	private function get_widget_classes( array $widget ): array {
		$classes = [];

		if ( ! empty( $widget['element']['classes'] ) ) {
			$classes = array_merge( $classes, $widget['element']['classes'] );
		}

		if ( ! empty( $widget['element']['generated_class'] ) ) {
			$classes[] = $widget['element']['generated_class'];
		}

		if ( ! empty( $widget['element']['attributes']['class'] ) ) {
			$attr_classes = explode( ' ', $widget['element']['attributes']['class'] );
			$classes = array_merge( $classes, array_filter( $attr_classes ) );
		}

		if ( ! empty( $widget['attributes']['class'] ) ) {
			$attr_classes = explode( ' ', $widget['attributes']['class'] );
			$classes = array_merge( $classes, array_filter( $attr_classes ) );
		}

		if ( ! empty( $widget['classes'] ) ) {
			$classes = array_merge( $classes, $widget['classes'] );
		}

		return array_unique( array_filter( $classes ) );
	}

	private function find_widgets_by_element_type( string $element_type, array $widgets ): array {
		$matching_widget_ids = [];

		foreach ( $widgets as $widget ) {
			$widget_type = $widget['widget_type'] ?? '';
			$original_tag = $widget['original_tag'] ?? '';

			if ( $original_tag === $element_type ) {
				$matching_widget_ids[] = $widget['element_id'] ?? $widget['id'] ?? null;
			}

			if ( ! empty( $widget['children'] ) ) {
				$child_matches = $this->find_widgets_by_element_type( $element_type, $widget['children'] );
				$matching_widget_ids = array_merge( $matching_widget_ids, $child_matches );
			}
		}

		return $matching_widget_ids;
	}

	private function convert_rule_properties_to_atomic( array $properties ): array {
		$converted_properties = [];

		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';
			$important = $property_data['important'] ?? false;

			if ( empty( $property ) || empty( $value ) ) {
				continue;
			}

			$converted = $this->property_converter->convert_property_to_v4_atomic( $property, $value );

			$converted_properties[] = [
				'property' => $property,
				'value' => $value,
				'important' => $important,
				'converted_property' => $converted,
			];
		}

		return $converted_properties;
	}

	private function is_simple_element_selector( string $selector ): bool {
		// Check if selector is a simple element selector (p, h1, div, etc.)
		// These should be handled by Reset_Styles_Processor, not here
		return preg_match( '/^[a-zA-Z][a-zA-Z0-9]*$/', trim( $selector ) );
	}
}
