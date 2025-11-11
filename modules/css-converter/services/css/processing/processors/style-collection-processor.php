<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Style_Collection_Processor implements Css_Processor_Interface {
	private $property_converter;
	private $unified_style_manager;
	private $reset_style_detector;
	private $current_selector = '';
	private $context;
	private $selector_matcher;

	public function __construct( $property_converter = null, $unified_style_manager = null, $reset_style_detector = null ) {
		$this->property_converter = $property_converter;
		$this->unified_style_manager = $unified_style_manager;
		$this->reset_style_detector = $reset_style_detector;
		$this->selector_matcher = new \Elementor\Modules\CssConverter\Services\Css\Processing\Selector_Matcher_Engine();

		if ( null === $this->property_converter ) {
			$this->initialize_property_converter();
		}
		if ( null === $this->unified_style_manager ) {
			$this->initialize_unified_style_manager();
		}
		if ( null === $this->reset_style_detector ) {
			$this->initialize_reset_style_detector();
		}
	}

	private function initialize_property_converter(): void {
		// Try to get shared instance from context first
		if ( $this->context ) {
			$shared_converter = $this->context->get_metadata( 'property_converter' );
			if ( $shared_converter ) {
				$this->property_converter = $shared_converter;
				return;
			}
		}

		// Fallback: create new instance
		$this->property_converter = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service();
	}

	private function initialize_unified_style_manager(): void {
		$specificity_calculator = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator();
		$this->unified_style_manager = new \Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Style_Manager(
			$specificity_calculator,
			$this->property_converter
		);
	}

	private function initialize_reset_style_detector(): void {
		$specificity_calculator = new \Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator();
		$this->reset_style_detector = new \Elementor\Modules\CssConverter\Services\Css\Processing\Reset_Style_Detector( $specificity_calculator );
	}

	public function get_processor_name(): string {
		return 'style_collection';
	}

	public function get_priority(): int {
		return 85; // After HTML class modifications, before style resolution
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();

		return ! empty( $css_rules ) || ! empty( $widgets );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$this->context = $context;

		// Re-initialize property converter to use shared instance from context
		$shared_converter = $context->get_metadata( 'property_converter' );
		if ( $shared_converter ) {
			$this->property_converter = $shared_converter;
		}

		$css_rules = $context->get_metadata( 'css_rules', [] );
		$widgets = $context->get_widgets();
		$css = $context->get_metadata( 'css', '' );

		$existing_style_manager = $context->get_metadata( 'unified_style_manager' );

		if ( null !== $existing_style_manager ) {
			$this->unified_style_manager = $existing_style_manager;
		} else {
			$this->unified_style_manager->reset();
		}

		// Collect styles from css_rules (single source of truth)
		$css_styles_collected = $this->collect_css_styles_from_rules( $css_rules, $widgets, $context );
		$inline_styles_collected = $this->collect_inline_styles_from_widgets( $widgets );
		$reset_styles_collected = $this->collect_reset_styles( $css, $widgets );

		// NEW: Collect overflow styles when maximum number of global classes has been reached
		$overflow_styles_when_maximum_number_of_global_classes_has_been_reached = $context->get_metadata( 'overflow_styles_when_maximum_number_of_global_classes_has_been_reached', [] );
		$overflow_styles_when_maximum_number_of_global_classes_has_been_reached_collected = 0;

		if ( ! empty( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached ) ) {
			$overflow_styles_when_maximum_number_of_global_classes_has_been_reached_collected = $this->collect_overflow_styles_when_maximum_number_of_global_classes_has_been_reached( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached, $widgets );
		}

		// Store collection results in context
		$context->set_metadata( 'unified_style_manager', $this->unified_style_manager );
		$context->add_statistic( 'css_styles_collected', $css_styles_collected );
		$context->add_statistic( 'inline_styles_collected', $inline_styles_collected );
		$context->add_statistic( 'reset_styles_collected', $reset_styles_collected );
		$context->add_statistic( 'overflow_styles_when_maximum_number_of_global_classes_has_been_reached_collected', $overflow_styles_when_maximum_number_of_global_classes_has_been_reached_collected );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'css_styles_collected',
			'inline_styles_collected',
			'reset_styles_collected',
			'overflow_styles_when_maximum_number_of_global_classes_has_been_reached_collected',
		];
	}

	private function collect_css_styles_from_rules( array $css_rules, array $widgets, Css_Processing_Context $context ): int {
		if ( empty( $css_rules ) ) {
			return 0;
		}

		$styles_collected = 0;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];

			if ( empty( $selector ) || empty( $properties ) ) {
				continue;
			}

			if ( $this->is_registered_global_class_selector( $selector ) ) {
				continue;
			}

			// Skip utility selectors that shouldn't be applied to content widgets
			if ( $this->is_utility_selector( $selector ) ) {
				continue;
			}

			// Analyze and apply direct element styles
			if ( $this->is_simple_element_selector( $selector ) ) {
				$styles_collected += $this->apply_direct_element_styles( $selector, $properties, $widgets );
			}

			// Process CSS rules for widgets
			$styles_collected += $this->process_css_rule_for_widgets( $selector, $properties, $widgets );
		}

		return $styles_collected;
	}

	private function is_registered_global_class_selector( string $selector ): bool {
		if ( ! isset( $this->context ) ) {
			return false;
		}

		$global_classes = $this->context->get_metadata( 'global_classes', [] );

		if ( empty( $global_classes ) ) {
			return false;
		}

		if ( substr( $selector, 0, 1 ) === '.' && strpos( $selector, ' ' ) === false ) {
			$class_name = substr( $selector, 1 );
			return isset( $global_classes[ $class_name ] );
		}

		return false;
	}

	private function is_utility_selector( string $selector ): bool {
		$utility_patterns = [
			'masonry-loading',
			'header-overlay',
			'close-canvas',
			'sub-menu',
			'children--nav',
			'elementor-background',
			'elementor-background-video',
			'elementor-background-slideshow',
			'elementor-motion-effects',
			'screen-reader-text',
			'elementor-screen-only',
		];

		foreach ( $utility_patterns as $pattern ) {
			if ( strpos( $selector, $pattern ) !== false ) {
				return true;
			}
		}

		return false;
	}

	private function collect_inline_styles_from_widgets( array $widgets ): int {
		$styles_collected = 0;

		foreach ( $widgets as $widget ) {
			$element_id = $widget['element_id'] ?? null;
			$inline_css = $widget['inline_css'] ?? [];

			if ( $element_id && ! empty( $inline_css ) ) {
				$styles_collected += $this->process_widget_inline_styles( $element_id, $inline_css );
			}

			// Process child widgets recursively
			if ( ! empty( $widget['children'] ) ) {
				$styles_collected += $this->collect_inline_styles_from_widgets( $widget['children'] );
			}
		}

		return $styles_collected;
	}

	private function collect_reset_styles( string $css, array $widgets ): int {
		if ( empty( $css ) ) {
			return 0;
		}

		// This would use the existing reset style detection logic
		// For now, return 0 as placeholder
		return 0;
	}

	private function is_simple_element_selector( string $selector ): bool {
		return preg_match( '/^[a-zA-Z][a-zA-Z0-9]*$/', trim( $selector ) );
	}

	private function apply_direct_element_styles( string $selector, array $properties, array $widgets ): int {
		$styles_applied = 0;
		$element_type = $selector;

		foreach ( $widgets as $widget ) {
			$widget_tag = $widget['tag'] ?? '';
			$widget_type = $widget['widget_type'] ?? '';
			$element_id = $widget['element_id'] ?? null;

			// Check if this widget matches the element type
			if ( $this->widget_matches_element_type( $widget_tag, $widget_type, $element_type ) && $element_id ) {
				$converted_properties = $this->prepare_properties_for_collection( $properties );

				$this->unified_style_manager->collect_element_styles(
					$widget_type,
					$converted_properties,
					$element_id
				);

				++$styles_applied;
			}

			// Process children recursively
			if ( ! empty( $widget['children'] ) ) {
				$styles_applied += $this->apply_direct_element_styles( $selector, $properties, $widget['children'] );
			}
		}

		return $styles_applied;
	}

	private function process_css_rule_for_widgets( string $selector, array $properties, array $widgets ): int {
		$this->current_selector = $selector;

		$converted_properties = $this->prepare_properties_for_collection( $properties );
		$matched_elements = $this->find_matching_widgets( $selector, $widgets );

		if ( ! empty( $matched_elements ) ) {

			// Route selectors with ID components to ID styles
			if ( false !== strpos( $selector, '#' ) ) {
				$this->unified_style_manager->collect_id_selector_styles(
					$selector,
					$converted_properties,
					$matched_elements
				);
			} else {
				$this->unified_style_manager->collect_css_selector_styles(
					$selector,
					$converted_properties,
					$matched_elements
				);
			}

			return count( $matched_elements );
		}

		return 0;
	}

	private function process_widget_inline_styles( string $element_id, array $inline_css ): int {
		if ( empty( $inline_css ) ) {
			return 0;
		}

		$batch_converted = [];
		foreach ( $inline_css as $property => $property_data ) {
			$value = $property_data['value'] ?? $property_data;
			$important = $property_data['important'] ?? false;

			$converted = $this->property_converter
			? $this->property_converter->convert_property_to_v4_atomic( $property, $value, $element_id, $important )
			: null;

			if ( $converted ) {
				$batch_converted[ $property ] = $converted;
			}
		}

		foreach ( $inline_css as $property => $property_data ) {
			$value = $property_data['value'] ?? $property_data;
			$important = $property_data['important'] ?? false;
			$converted = $this->find_converted_property_in_batch( $property, $batch_converted );

			$this->unified_style_manager->collect_inline_styles(
				$element_id,
				[
					$property => [
						'value' => $value,
						'important' => $important,
						'converted_property' => $converted,
					],
				]
			);
		}

		return count( $inline_css );
	}

	private function find_converted_property_in_batch( string $property, array $batch_converted ): ?array {
		foreach ( $batch_converted as $atomic_property => $atomic_value ) {
			if ( $this->is_property_source_unified( $property, $atomic_property ) ) {
				return [ $atomic_property => $atomic_value ];
			}
		}
		return null;
	}

	private function is_property_source_unified( string $css_property, string $atomic_property ): bool {
		if ( $this->is_margin_property_mapping( $css_property, $atomic_property ) ) {
			return true;
		}
		if ( $this->is_padding_property_mapping( $css_property, $atomic_property ) ) {
			return true;
		}
		if ( $this->is_border_radius_property_mapping( $css_property, $atomic_property ) ) {
			return true;
		}
		return $css_property === $atomic_property;
	}

	private function is_margin_property_mapping( string $css_property, string $atomic_property ): bool {
		return 'margin' === $atomic_property && in_array(
			$css_property,
			[
				'margin',
				'margin-top',
				'margin-right',
				'margin-bottom',
				'margin-left',
				'margin-block',
				'margin-block-start',
				'margin-block-end',
				'margin-inline',
				'margin-inline-start',
				'margin-inline-end',
			],
			true
		);
	}

	private function is_padding_property_mapping( string $css_property, string $atomic_property ): bool {
		return 'padding' === $atomic_property && in_array(
			$css_property,
			[
				'padding',
				'padding-top',
				'padding-right',
				'padding-bottom',
				'padding-left',
				'padding-block',
				'padding-block-start',
				'padding-block-end',
				'padding-inline',
				'padding-inline-start',
				'padding-inline-end',
			],
			true
		);
	}

	private function is_border_radius_property_mapping( string $css_property, string $atomic_property ): bool {
		return 'border-radius' === $atomic_property && in_array(
			$css_property,
			[
				'border-radius',
				'border-top-left-radius',
				'border-top-right-radius',
				'border-bottom-right-radius',
				'border-bottom-left-radius',
				'border-start-start-radius',
				'border-start-end-radius',
				'border-end-start-radius',
				'border-end-end-radius',
			],
			true
		);
	}

	private function prepare_properties_for_collection( array $properties ): array {
		$converted_properties = [];

		foreach ( $properties as $property_data ) {
			$property_name = $property_data['property'] ?? '';
			$property_value = $property_data['value'] ?? '';
			$important = $property_data['important'] ?? false;

			if ( empty( $property_name ) || empty( $property_value ) ) {
				continue;
			}

			$converted = $this->convert_property_if_needed( $property_name, $property_value );

			$converted_properties[] = [
				'property' => $property_name,
				'value' => $property_value,
				'original_property' => $property_name,
				'original_value' => $property_value,
				'important' => $important,
				'converted_property' => $converted,
			];
		}

		return $converted_properties;
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

	private function widget_matches_element_type( string $widget_tag, string $widget_type, string $element_type ): bool {
		// Direct tag match
		if ( $widget_tag === $element_type ) {
			return true;
		}

		// Widget type to HTML element mapping
		$widget_to_tag_map = [
			'e-paragraph' => 'p',
			'e-heading' => [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
			'e-div-block' => 'div',
			'e-flexbox' => 'div',
		];

		$mapped_tags = $widget_to_tag_map[ $widget_type ] ?? '';

		if ( is_array( $mapped_tags ) ) {
			return in_array( $element_type, $mapped_tags, true );
		}

		return $mapped_tags === $element_type;
	}

	private function find_matching_widgets( string $selector, array $widgets ): array {
		try {
			return $this->selector_matcher->find_matching_widgets( $selector, $widgets );
		} catch ( \InvalidArgumentException $e ) {
			return [];
		}
	}

	private function selector_matches_widget( string $selector, array $widget ): bool {
		try {
			return $this->selector_matcher->widget_matches_selector( $selector, $widget );
		} catch ( \InvalidArgumentException $e ) {
			return false;
		}
	}

	private function collect_overflow_styles_when_maximum_number_of_global_classes_has_been_reached( array $overflow_styles_when_maximum_number_of_global_classes_has_been_reached, array $widgets ): int {
		$styles_collected = 0;

		foreach ( $overflow_styles_when_maximum_number_of_global_classes_has_been_reached as $class_name => $class_data ) {
			$atomic_props = $class_data['atomic_props'] ?? [];

			if ( empty( $atomic_props ) ) {
				continue;
			}

			$matched_widgets = $this->find_widgets_with_class( $class_name, $widgets );

			if ( empty( $matched_widgets ) ) {
				continue;
			}

			$css_properties = $this->convert_atomic_props_to_css_properties( $atomic_props );

			if ( empty( $css_properties ) ) {
				continue;
			}

			$this->unified_style_manager->collect_css_selector_styles(
				'.' . $class_name,
				$css_properties,
				$matched_widgets
			);

			$styles_collected += count( $matched_widgets );

		}

		return $styles_collected;
	}

	private function find_widgets_with_class( string $class_name, array $widgets ): array {
		$matched = [];

		foreach ( $widgets as $widget ) {
			$widget_classes = $widget['attributes']['class'] ?? '';
			$classes_array = explode( ' ', $widget_classes );

			if ( in_array( $class_name, $classes_array, true ) ) {
				$element_id = $widget['element_id'] ?? null;
				if ( $element_id ) {
					$matched[] = $element_id;
				}
			}

			if ( ! empty( $widget['children'] ) ) {
				$child_matches = $this->find_widgets_with_class( $class_name, $widget['children'] );
				$matched = array_merge( $matched, $child_matches );
			}
		}

		return $matched;
	}

	private function convert_atomic_props_to_css_properties( array $atomic_props ): array {
		$css_properties = [];

		foreach ( $atomic_props as $prop_name => $atomic_value ) {
			$css_property = $this->convert_single_atomic_prop_to_css( $prop_name, $atomic_value );

			if ( $css_property ) {
				$css_properties[] = [
					'property' => $css_property['property'],
					'value' => $css_property['value'],
					'important' => false,
					'converted_property' => $atomic_value,
				];
			}
		}

		return $css_properties;
	}

	private function convert_single_atomic_prop_to_css( string $prop_name, array $atomic_value ): ?array {
		$type = $atomic_value['$$type'] ?? '';
		$value = $atomic_value['value'] ?? null;

		switch ( $type ) {
			case 'color':
				return [
					'property' => $prop_name,
					'value' => $value,
				];

			case 'size':
				if ( is_array( $value ) && isset( $value['size'], $value['unit'] ) ) {
					return [
						'property' => $prop_name,
						'value' => $value['size'] . $value['unit'],
					];
				}
				break;

			case 'background':
				if ( is_array( $value ) && isset( $value['color'] ) ) {
					return [
						'property' => 'background-color',
						'value' => $value['color']['value'] ?? $value['color'],
					];
				}
				break;
		}

		return null;
	}
}
