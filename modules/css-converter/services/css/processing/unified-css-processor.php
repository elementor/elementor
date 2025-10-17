<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
require_once __DIR__ . '/../css-selector-utils.php';
class Unified_Css_Processor {
	private $css_parser;
	private $property_converter;
	private $specificity_calculator;
	private $unified_style_manager;
	private $reset_style_detector;
	private $flattening_service;
	private $html_class_modifier;
	public function __construct(
		$css_parser,
		$property_converter,
		Css_Specificity_Calculator $specificity_calculator
	) {
		$this->css_parser = $css_parser;
		$this->property_converter = $property_converter;
		$this->specificity_calculator = $specificity_calculator;
		$this->unified_style_manager = new Unified_Style_Manager(
			$specificity_calculator,
			$property_converter
		);
		$this->reset_style_detector = new Reset_Style_Detector( $specificity_calculator );
		$this->initialize_flattening_service();
		$this->initialize_html_class_modifier();
	}
	private function initialize_flattening_service(): void {
		require_once __DIR__ . '/../nested-selector-parser.php';
		require_once __DIR__ . '/../flattened-class-name-generator.php';
		require_once __DIR__ . '/../nested-selector-flattening-service.php';
		$this->flattening_service = new \Elementor\Modules\CssConverter\Services\Css\Nested_Selector_Flattening_Service();
	}
	private function initialize_html_class_modifier(): void {
		require_once __DIR__ . '/../css-class-usage-tracker.php';
		require_once __DIR__ . '/../nested-class-mapping-service.php';
		require_once __DIR__ . '/../html-class-modifier-service.php';
		$this->html_class_modifier = new \Elementor\Modules\CssConverter\Services\Css\Html_Class_Modifier_Service();
	}
	public function process_css_and_widgets( string $css, array $widgets ): array {
		// ═══════════════════════════════════════════════════════════
		// PASS 1: CSS ANALYSIS & FLATTENING
		// ═══════════════════════════════════════════════════════════
		// Step 1.1: Parse CSS rules
		$css_rules = $this->parse_css_and_extract_rules( $css );
		// Step 1.2: Flatten ALL nested selectors FIRST
		$flattening_results = $this->flatten_all_nested_selectors( $css_rules );
		// Step 1.3: Process compound selectors (NEW)
		$compound_results = $this->process_compound_selectors( $css_rules );
		// Step 1.4: Initialize HTML modifier with complete flattening data
		$this->html_class_modifier->initialize_with_flattening_results(
			$flattening_results['class_mappings'],
			$flattening_results['classes_with_direct_styles'],
			$flattening_results['classes_only_in_nested']
		);
		// Step 1.5: Initialize HTML modifier with compound selector data
		$this->html_class_modifier->initialize_with_compound_results(
			$compound_results['compound_mappings']
		);
		// ═══════════════════════════════════════════════════════════
		// PASS 2: HTML MODIFICATION & STYLE RESOLUTION
		// ═══════════════════════════════════════════════════════════
		// Step 2.1: Apply HTML class modifications to ALL widgets (including nested ones)
		$widgets_with_modified_classes = $this->apply_html_class_modifications( $widgets );
		// Step 2.2: Process styles using flattened rules
		$this->collect_all_styles_from_sources_with_flattened_rules(
			$css,
			$widgets_with_modified_classes,
			$flattening_results['flattened_rules']
		);
		// Step 2.3: Resolve styles recursively
		$resolved_widgets = $this->resolve_styles_recursively( $widgets_with_modified_classes );
		// ═══════════════════════════════════════════════════════════
		// PASS 3: PREPARE OUTPUT
		// ═══════════════════════════════════════════════════════════
		$debug_info = $this->unified_style_manager->get_debug_info();
		$css_class_rules = $this->extract_css_class_rules_for_global_classes( $css );
		// Get reset styles information
		$reset_styles_stats = $this->unified_style_manager->get_reset_styles_stats();
		$complex_reset_styles = $this->unified_style_manager->get_complex_reset_styles();
		// Get HTML class modification summary
		$html_modification_summary = $this->html_class_modifier->get_modification_summary();
		return [
			'widgets' => $resolved_widgets,
			'stats' => $debug_info,
			'css_class_rules' => $css_class_rules,
			'flattened_classes' => $flattening_results['flattened_classes'],
			'flattened_classes_count' => count( $flattening_results['flattened_classes'] ),
			'compound_classes' => $compound_results['compound_global_classes'] ?? [],
			'compound_classes_created' => count( $compound_results['compound_global_classes'] ?? [] ),
			'reset_styles_detected' => $reset_styles_stats['reset_element_styles'] > 0 || $reset_styles_stats['reset_complex_styles'] > 0,
			'reset_styles_stats' => $reset_styles_stats,
			'complex_reset_styles' => $complex_reset_styles,
			'html_class_modifications' => $html_modification_summary,
		];
	}
	private function collect_all_styles_from_sources( string $css, array $widgets ): void {
		$this->unified_style_manager->reset();
		$this->collect_css_styles( $css, $widgets );
		$this->collect_inline_styles_from_widgets( $widgets );
		$this->collect_reset_styles( $css, $widgets );
	}
	private function collect_all_styles_from_sources_with_flattened_rules(
		string $css,
		array $widgets,
		array $flattened_rules
	): void {
		$this->unified_style_manager->reset();
		$this->collect_css_styles_from_flattened_rules( $flattened_rules, $widgets );
		$this->collect_inline_styles_from_widgets( $widgets );
		$this->collect_reset_styles( $css, $widgets );
	}
	private function collect_css_styles_from_flattened_rules( array $flattened_rules, array $widgets ): void {
		if ( empty( $flattened_rules ) ) {
			return;
		}
		$this->log_css_parsing_start_from_rules( $flattened_rules, $widgets );
		$this->analyze_and_apply_direct_element_styles( $flattened_rules, $widgets );
		$this->process_css_rules_for_widgets( $flattened_rules, $widgets );
	}
	private function log_css_parsing_start_from_rules( array $rules, array $widgets ): void {
		// Skip debug logging for performance
	}
	private function collect_css_styles( string $css, array $widgets ) {
		if ( empty( $css ) ) {
			return;
		}
		if ( strpos( $css, 'h1' ) !== false ) {
			$h1_matches = [];
			preg_match_all( '/h1\s*\{[^}]*\}/', $css, $h1_matches );
			foreach ( $h1_matches[0] as $i => $match ) {
			}
		}
		$this->log_css_parsing_start( $css, $widgets );
		$rules = $this->parse_css_and_extract_rules( $css );
		$h1_rules_found = 0;
		foreach ( $rules as $rule ) {
			if ( isset( $rule['selector'] ) && $rule['selector'] === 'h1' ) {
				++$h1_rules_found;
			}
		}
		$this->log_extracted_rules( $rules );
		$this->analyze_and_apply_direct_element_styles( $rules, $widgets );
		$this->process_css_rules_for_widgets( $rules, $widgets );
	}
	private function log_css_parsing_start( string $css, array $widgets ): void {
	}
	private function parse_css_and_extract_rules( string $css ): array {
		$parsed_css = $this->css_parser->parse( $css );
		$document = $parsed_css->get_document();
		return $this->extract_rules_from_document( $document );
	}
	private function log_extracted_rules( array $rules ): void {
		$this->skip_debug_logging_for_performance();
	}
	private function is_simple_element_selector( string $selector ): bool {
		// Check if selector is a simple element selector (p, h1, div, etc.)
		return preg_match( '/^[a-zA-Z][a-zA-Z0-9]*$/', trim( $selector ) );
	}
	private function infer_html_tag_from_widget_type( string $widget_type, array $widget ): string {
		// Map widget types to HTML tags
		$widget_to_tag_map = [
			'e-paragraph' => 'p',
			'e-heading' => $this->infer_heading_tag_from_widget( $widget ),
			'e-div-block' => 'div',
			'e-flexbox' => 'div',
		];
		return $widget_to_tag_map[ $widget_type ] ?? '';
	}
	private function infer_heading_tag_from_widget( array $widget ): string {
		// Try to infer heading tag from widget settings or default to h1
		$settings = $widget['settings'] ?? [];
		$tag = $settings['tag'] ?? 'h1';
		return in_array( $tag, [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ) ? $tag : 'h1';
	}
	private function prepare_properties_for_collection( array $properties ): array {
		$converted_properties = [];
		foreach ( $properties as $property => $value ) {
			$property_name = $value['property'] ?? $property;
			$property_value = $value['value'] ?? $value;
			$important = $value['important'] ?? false;
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
	private function analyze_and_apply_direct_element_styles( array $rules, array $widgets ): void {
		foreach ( $rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];
			// Skip if not a simple element selector (p, h1, div, etc.)
			if ( ! $this->is_simple_element_selector( $selector ) ) {
				continue;
			}
			// Collect element styles for all widgets of this type
			$element_type = $selector;
			foreach ( $widgets as $widget ) {
				$widget_tag = $widget['tag'] ?? '';
				$widget_type = $widget['widget_type'] ?? '';
				$element_id = $widget['element_id'] ?? null;
				// Extract HTML tag from element_id patterns:
				// Pattern 1: "element-p-1" (no HTML ID) -> "p"
				// Pattern 2: "element-text" (has HTML ID) -> check widget metadata
				$html_tag_from_element_id = '';
				if ( $element_id ) {
					if ( preg_match( '/^element-([a-z0-9]+)-\d+$/', $element_id, $matches ) ) {
						// Pattern 1: element-{tag}-{number}
						$html_tag_from_element_id = $matches[1];
					} elseif ( preg_match( '/^element-([a-z0-9_-]+)$/', $element_id ) ) {
						// Pattern 2: element-{html_id} - need to infer tag from widget type
						$html_tag_from_element_id = $this->infer_html_tag_from_widget_type( $widget_type, $widget );
					}
				}
				// Check if this widget matches the element type by tag OR element_id
				$tag_matches = ( $widget_tag === $element_type ) || ( $html_tag_from_element_id === $element_type );
				if ( $tag_matches && $element_id ) {
					// Skip if widget has inline styles that would conflict
					$widget_has_inline_styles = ! empty( $widget['attributes']['style'] ?? '' );
					if ( $widget_has_inline_styles ) {
continue;
					}
					$converted_properties = $this->prepare_properties_for_collection( $properties );
					// Use widget_type for element_type so filtering works correctly
					$this->unified_style_manager->collect_element_styles(
						$widget_type, // Use widget type (e-paragraph) instead of HTML tag (p)
						$converted_properties,
						$element_id
					);
}
				// Process children recursively
				if ( ! empty( $widget['children'] ) ) {
					$this->analyze_and_apply_direct_element_styles( [ $rule ], $widget['children'] );
				}
			}
		}
	}
	private function convert_rules_to_analyzer_format( array $rules ): array {
		$analyzer_rules = [];
		foreach ( $rules as $rule ) {
			$selector = $rule['selector'];
			$properties = $rule['properties'] ?? [];
			if ( $selector === 'h1' || strpos( $selector, 'h1' ) !== false ) {
			}
			foreach ( $properties as $property_data ) {
				$analyzer_rules[] = [
					'selector' => $selector,
					'property' => $property_data['property'],
					'value' => $property_data['value'],
					'important' => $property_data['important'] ?? false,
				];
			}
		}
		return $analyzer_rules;
	}
	private function apply_direct_element_styles_to_widgets( array $rule, array $widgets ): void {
		$selector = $rule['selector'];
		$property = $rule['property'];
		$value = $rule['value'];
		$important = $rule['important'] ?? false;
		$matching_widgets = $this->find_widgets_by_element_type( $selector, $widgets );
		foreach ( $matching_widgets as $widget_id ) {
			$converted_property = $this->convert_css_property_to_atomic_widget_format( $property, $value );
			if ( $converted_property ) {
				$this->apply_direct_element_style_with_higher_priority(
					$widget_id,
					$selector,
					[
						$property => [
							'value' => $value,
							'important' => $important,
							'converted_property' => $converted_property,
							'source' => 'direct_element_reset',
						],
					]
				);
			} else {
			}
		}
	}
	private function find_widgets_by_element_type( string $element_selector, array $widgets ): array {
		$matching_widget_ids = [];
		$element_to_widget_map = $this->get_html_element_to_atomic_widget_mapping();
		$target_widget_type = $element_to_widget_map[ $element_selector ] ?? $element_selector;
		foreach ( $widgets as $widget ) {
			$widget_tag = $widget['tag'] ?? $widget['widget_type'] ?? '';
			$element_id = $widget['element_id'] ?? null;
			$widget_type = $widget['widget_type'] ?? 'unknown';
			$html_tag_from_element_id = '';
			if ( $element_id && preg_match( '/^element-([a-z0-9]+)-\d+$/', $element_id, $matches ) ) {
				$html_tag_from_element_id = $matches[1];
			}
			$widget_type_matches = ( $widget_type === $target_widget_type );
			$tag_matches = ( $html_tag_from_element_id === $element_selector ) || ( $widget_tag === $element_selector );
			$is_match = $element_id && $widget_type_matches && $tag_matches;
			if ( $is_match ) {
				$matching_widget_ids[] = $element_id;
			}
			if ( ! empty( $widget['children'] ) ) {
				$child_matches = $this->find_widgets_by_element_type( $element_selector, $widget['children'] );
				$matching_widget_ids = array_merge( $matching_widget_ids, $child_matches );
			}
		}
return $matching_widget_ids;
	}
	private function process_css_rules_for_widgets( array $rules, array $widgets ): void {
		foreach ( $rules as $rule ) {
			$selector = $rule['selector'];
			$properties = $rule['properties'] ?? [];
			if ( strpos( $selector, '#container' ) !== false ) {
				$debug_file = WP_CONTENT_DIR . '/css-rules-debug.json';
				$debug_data = [
					'timestamp' => date( 'Y-m-d H:i:s' ),
					'selector' => $selector,
					'properties' => $properties,
				];
				file_put_contents( $debug_file, json_encode( $debug_data, JSON_PRETTY_PRINT ) . ",\n", FILE_APPEND );
			}
			$this->log_rule_processing( $selector, $properties );
			if ( empty( $properties ) ) {
				continue;
			}
			// Apply nested selector flattening for Pattern 1
			$processed_rule = $this->apply_nested_selector_flattening( $rule );
			// Skip processing original nested rules that have been flattened
			if ( $this->rule_was_flattened( $rule, $processed_rule ) ) {
				// Original nested rule has been flattened into a global class
				// Skip processing to prevent duplicate CSS output
				continue;
			}
			$processed_selector = $processed_rule['selector'];
			$processed_properties = $processed_rule['properties'];
			$matched_elements = $this->find_matching_widgets( $processed_selector, $widgets );
			$this->log_matched_elements( $processed_selector, $matched_elements );
			if ( ! empty( $matched_elements ) ) {
				$this->process_matched_rule( $processed_selector, $processed_properties, $matched_elements );
			}
		}
	}
	private function apply_nested_selector_flattening( array $rule ): array {
		$selector = $rule['selector'] ?? '';
		if ( $this->flattening_service->should_flatten_selector( $selector ) ) {
			return $this->flattening_service->flatten_css_rule( $rule );
		}
		return $rule;
	}
	private function rule_was_flattened( array $original_rule, array $processed_rule ): bool {
		// Check if the rule was flattened by comparing selectors and flattened flag
		$original_selector = $original_rule['selector'] ?? '';
		$processed_selector = $processed_rule['selector'] ?? '';
		$was_flattened = $processed_rule['flattened'] ?? false;
		// Rule was flattened if:
		// 1. The flattened flag is set to true
		// 2. The selector has changed (original nested vs flattened global class)
		return $was_flattened && $original_selector !== $processed_selector;
	}
	private function log_rule_processing( string $selector, array $properties ): void {
		$this->skip_debug_logging_for_performance();
	}
	private function log_matched_elements( string $selector, array $matched_elements ): void {
		$this->skip_debug_logging_for_performance();
	}
	private function process_matched_rule( string $selector, array $properties, array $matched_elements ): void {
		$converted_properties = $this->convert_rule_properties_to_atomic( $properties );
		if ( strpos( $selector, '#container' ) !== false ) {
			$debug_file = WP_CONTENT_DIR . '/debug-specificity.json';
			$debug_data = [
				'timestamp' => date( 'Y-m-d H:i:s' ),
				'selector' => $selector,
				'original_properties' => $properties,
				'converted_properties' => $converted_properties,
				'matched_elements_count' => count( $matched_elements ),
				'matched_element_ids' => $matched_elements,
			];
			file_put_contents( $debug_file, json_encode( $debug_data, JSON_PRETTY_PRINT ) . ",\n", FILE_APPEND );
		}
		// Route selectors with ID components to ID styles (e.g., #container, #container.box)
		if ( strpos( $selector, '#' ) !== false ) {
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
	}
	private function convert_rule_properties_to_atomic( array $properties ): array {
		$properties_to_convert = $this->expand_border_shorthand_before_property_mapper_processing( $properties );
		$converted_properties = [];
		foreach ( $properties_to_convert as $property_data ) {
			$converted = $this->convert_property_if_needed(
				$property_data['property'],
				$property_data['value']
			);
			$converted_properties[] = [
				'property' => $property_data['property'],
				'value' => $property_data['value'],
				'original_property' => $property_data['property'],
				'original_value' => $property_data['value'],
				'important' => $property_data['important'] ?? false,
				'converted_property' => $converted,
			];
		}
		return $converted_properties;
	}
	private function expand_border_shorthand_before_property_mapper_processing( array $properties ): array {
		include_once __DIR__ . '/css-shorthand-expander.php';
		$simple_props = $this->convert_properties_to_simple_key_value_array( $properties );
		$expanded = $this->expand_css_shorthand_properties_using_expander( $simple_props );
		$result = $this->convert_expanded_properties_back_to_property_data_format( $expanded, $properties );
		$this->skip_debug_logging_for_performance();
		return $result;
	}
	private function collect_inline_styles_from_widgets( array $widgets ) {
		$this->log_inline_style_collection_start( $widgets );
		$this->collect_inline_styles_recursively( $widgets );
		$this->log_inline_style_collection_complete();
	}
	private function log_inline_style_collection_start( array $widgets ): void {
		$this->skip_debug_logging_for_performance();
	}
	private function log_inline_style_collection_complete(): void {
		$this->skip_debug_logging_for_performance();
	}
	private function collect_inline_styles_recursively( array $widgets ) {
		foreach ( $widgets as $widget ) {
			$element_id = $widget['element_id'] ?? null;
			$inline_css = $widget['inline_css'] ?? [];
			$this->log_widget_inline_processing( $element_id, $inline_css );
			if ( $element_id && ! empty( $inline_css ) ) {
				$this->process_widget_inline_styles( $element_id, $inline_css );
			}
			$this->process_child_widgets_recursively( $widget, $element_id );
		}
	}
	private function log_widget_inline_processing( ?string $element_id, array $inline_css ): void {
		$this->skip_debug_logging_for_performance();
	}
	private function process_widget_inline_styles( string $element_id, array $inline_css ): void {
		$inline_properties = $this->extract_inline_properties( $inline_css );
		$batch_converted = $this->convert_properties_batch( $inline_properties );
		$this->store_converted_inline_styles( $element_id, $inline_css, $batch_converted );
	}
	private function extract_inline_properties( array $inline_css ): array {
		$inline_properties = [];
		foreach ( $inline_css as $property => $property_data ) {
			$value = $property_data['value'] ?? $property_data;
			$inline_properties[ $property ] = $value;
		}
		return $inline_properties;
	}
	private function store_converted_inline_styles( string $element_id, array $inline_css, array $batch_converted ): void {
		foreach ( $inline_css as $property => $property_data ) {
			$value = $property_data['value'] ?? $property_data;
			$important = $property_data['important'] ?? false;
			$converted = $this->find_converted_property_in_batch( $property, $batch_converted );
			$this->unified_style_manager->collect_inline_styles(
				$element_id, [
					$property => [
						'value' => $value,
						'important' => $important,
						'converted_property' => $converted,
					],
				]
			);
		}
	}
	private function find_converted_property_in_batch( string $property, array $batch_converted ): ?array {
		foreach ( $batch_converted as $atomic_property => $atomic_value ) {
			if ( $this->is_property_source_unified( $property, $atomic_property ) ) {
				return [ $atomic_property => $atomic_value ];
			}
		}
		return null;
	}
	private function process_child_widgets_recursively( array $widget, ?string $element_id ): void {
		if ( ! empty( $widget['children'] ) ) {
			$this->collect_inline_styles_recursively( $widget['children'] );
		}
	}
	private function convert_properties_batch( array $properties ): array {
		if ( ! $this->property_converter ) {
			return [];
		}
		return $this->property_converter->convert_properties_to_v4_atomic( $properties );
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
			$css_property, [
				'margin',
				'margin-top',
				'margin-right',
				'margin-bottom',
				'margin-left',
				'margin-block-start',
				'margin-block-end',
				'margin-inline-start',
				'margin-inline-end',
				'margin-block',
				'margin-inline',
			], true
		);
	}
	private function is_padding_property_mapping( string $css_property, string $atomic_property ): bool {
		return 'padding' === $atomic_property && in_array(
			$css_property, [
				'padding',
				'padding-top',
				'padding-right',
				'padding-bottom',
				'padding-left',
				'padding-block-start',
				'padding-block-end',
				'padding-inline-start',
				'padding-inline-end',
				'padding-block',
				'padding-inline',
			], true
		);
	}
	private function is_border_radius_property_mapping( string $css_property, string $atomic_property ): bool {
		return 'border-radius' === $atomic_property && in_array(
			$css_property, [
				'border-radius',
				'border-top-left-radius',
				'border-top-right-radius',
				'border-bottom-left-radius',
				'border-bottom-right-radius',
				'border-start-start-radius',
				'border-start-end-radius',
				'border-end-start-radius',
				'border-end-end-radius',
			], true
		);
	}
	private function resolve_styles_recursively( array $widgets ): array {
		$resolved_widgets = [];
		foreach ( $widgets as $widget ) {
			$widget_id = $this->get_widget_identifier( $widget );
			$resolved_styles = $this->unified_style_manager->resolve_styles_for_widget( $widget );
			$widget['resolved_styles'] = $resolved_styles;
			if ( ! empty( $widget['children'] ) ) {
				$widget['children'] = $this->resolve_styles_recursively( $widget['children'] );
			}
			$resolved_widgets[] = $widget;
		}
		return $resolved_widgets;
	}
	private function find_matching_widgets( string $selector, array $widgets ): array {
		$matched_elements = [];
		foreach ( $widgets as $widget ) {
			$element_id = $widget['element_id'] ?? null;
			if ( $this->selector_matches_widget( $selector, $widget ) ) {
				if ( $element_id ) {
					$matched_elements[] = $element_id;
				}
			}
			if ( ! empty( $widget['children'] ) ) {
				$nested_matches = $this->find_matching_widgets( $selector, $widget['children'] );
				$matched_elements = array_merge( $matched_elements, $nested_matches );
			}
		}
		return $matched_elements;
	}
	private function selector_matches_widget( string $selector, array $widget ): bool {
		$element_type = $widget['tag'] ?? $widget['widget_type'] ?? '';
		$html_id = $widget['attributes']['id'] ?? '';
		$classes = $widget['attributes']['class'] ?? '';
		if ( strpos( $selector, '#container' ) !== false || strpos( $selector, '#text' ) !== false ) {
			$debug_file = WP_CONTENT_DIR . '/widget-matching-debug.json';
			$debug_data = [
				'timestamp' => date( 'Y-m-d H:i:s' ),
				'selector' => $selector,
				'element_type' => $element_type,
				'html_id' => $html_id,
				'classes' => $classes,
				'widget_full' => $widget,
			];
			file_put_contents( $debug_file, json_encode( $debug_data, JSON_PRETTY_PRINT ) . ",\n", FILE_APPEND );
		}
		$this->log_selector_matching_attempt( $selector, $element_type, $classes );
		if ( $this->is_element_selector_match( $selector, $element_type ) ) {
			return true;
		}
		if ( $this->is_id_selector_match( $selector, $html_id ) ) {
			return true;
		}
		if ( $this->is_class_selector_match( $selector, $classes ) ) {
			return true;
		}
		if ( $this->is_combined_selector_match( $selector, $element_type, $classes, $html_id ) ) {
			return true;
		}
		if ( $this->is_descendant_id_selector_match( $selector, $widget ) ) {
			return true;
		}
		return false;
	}
	private function log_selector_matching_attempt( string $selector, string $element_type, string $classes ): void {
		$this->skip_debug_logging_for_performance();
	}
	private function is_element_selector_match( string $selector, string $element_type ): bool {
		return $selector === $element_type;
	}
	private function is_id_selector_match( string $selector, string $html_id ): bool {
		if ( strpos( $selector, '#' ) === 0 ) {
			$id_part = substr( $selector, 1 );
			// Extract only the ID part before any class selectors (e.g., "container" from "container.box")
			$id_from_selector = strpos( $id_part, '.' ) !== false ? substr( $id_part, 0, strpos( $id_part, '.' ) ) : $id_part;
			$matches = $html_id === $id_from_selector;
return $matches;
		}
		return false;
	}
	private function is_descendant_id_selector_match( string $selector, array $widget ): bool {
		// Handle descendant ID selectors like "#outer #inner"
		if ( strpos( $selector, ' ' ) === false || strpos( $selector, '#' ) === false ) {
			return false; // Not a descendant selector with IDs
		}
		// Parse the descendant selector
		$parts = array_map( 'trim', explode( ' ', $selector ) );
		$target_id_selector = end( $parts ); // Last part is the target (e.g., "#inner")
		$ancestor_selectors = array_slice( $parts, 0, -1 ); // All parts except the last (e.g., ["#outer"])
		// Check if target matches this widget
		if ( ! $this->is_id_selector_match( $target_id_selector, $widget['attributes']['id'] ?? '' ) ) {
			return false;
		}
		// Check if any ancestor matches (simplified - in a real implementation, we'd check the widget hierarchy)
		// For now, we'll assume the match is valid if the target ID matches
		// TODO: Implement proper ancestor checking by traversing widget parents
return true;
	}
	private function is_class_selector_match( string $selector, string $classes ): bool {
		if ( strpos( $selector, '.' ) === 0 ) {
			$class_from_selector = substr( $selector, 1 );
			$widget_classes = explode( ' ', $classes );
			$is_match = in_array( $class_from_selector, $widget_classes, true );
			$this->log_class_match_result( $class_from_selector, $widget_classes, $is_match );
			return $is_match;
		}
		return false;
	}
	private function log_class_match_result( string $class_from_selector, array $widget_classes, bool $is_match ): void {
		$this->skip_debug_logging_for_performance();
	}
	private function is_combined_selector_match( string $selector, string $element_type, string $classes, string $html_id ): bool {
		if ( strpos( $selector, '#' ) !== false && strpos( $selector, '.' ) !== false ) {
			if ( preg_match( '/#([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)/', $selector, $matches ) ) {
				$id_from_selector = $matches[1];
				$class_from_selector = $matches[2];
				$id_matches = ( $html_id === $id_from_selector );
				$class_matches = in_array( $class_from_selector, explode( ' ', $classes ), true );
				$combined_match = $id_matches && $class_matches;
return $combined_match;
			}
		}
		if ( strpos( $selector, '.' ) !== false && strpos( $selector, '#' ) === false ) {
			$parts = explode( '.', $selector );
			$element_part = $parts[0];
			$class_part = $parts[1] ?? '';
			$element_matches = empty( $element_part ) || $element_part === $element_type;
			$class_matches = empty( $class_part ) || in_array( $class_part, explode( ' ', $classes ), true );
			return $element_matches && $class_matches;
		}
		return false;
	}
	private function convert_property_if_needed( string $property, string $value ) {
		if ( ! $this->property_converter ) {
			return null;
		}
		try {
			return $this->property_converter->convert_property_to_v4_atomic( $property, $value );
		} catch ( \Exception $e ) {
			$this->log_property_conversion_failure( $property, $e );
			return null;
		}
	}
	private function log_property_conversion_failure( string $property, \Exception $e ): void {
		$this->skip_debug_logging_for_performance();
	}
	private function skip_debug_logging_for_performance(): void {
	}
	private function log_sample_rules_for_debugging( array $rules ): void {
	}
	/**
	 * Collect reset styles using the new Reset_Style_Detector
	 *
	 * This method implements the unified-atomic mapper approach for reset styles:
	 * 1. Extract element selector rules from CSS
	 * 2. Analyze conflicts using Reset_Style_Detector
	 * 3. Apply simple element selectors directly to widgets
	 * 4. Mark complex selectors for CSS file generation
	 */
	private function collect_reset_styles( string $css, array $widgets ): void {
		if ( empty( $css ) ) {
			return;
		}
		$all_rules = $this->parse_css_and_extract_rules( $css );
		$element_rules = $this->reset_style_detector->extract_element_selector_rules( $all_rules );
		if ( empty( $element_rules ) ) {
			return;
		}
$conflict_analysis = $this->reset_style_detector->analyze_element_selector_conflicts(
			$element_rules,
			$all_rules
		);
		foreach ( $element_rules as $selector => $rules ) {
$this->process_element_selector_reset_styles( $selector, $rules, $conflict_analysis, $widgets );
		}
	}
	/**
	 * Process reset styles for a specific element selector
	 */
	private function process_element_selector_reset_styles(
		string $selector,
		array $rules,
		array $conflict_analysis,
		array $widgets
	): void {
		// Check if this selector can be applied directly to widgets
		$can_apply_directly = $this->reset_style_detector->can_apply_directly_to_widgets(
			$selector,
			$conflict_analysis
		);
		if ( $can_apply_directly ) {
			// Apply directly to widgets via unified style manager
			$this->apply_reset_styles_directly_to_widgets( $selector, $rules, $widgets );
		} else {
			// Mark for CSS file generation
			$this->collect_complex_reset_styles_for_css_file(
				$selector,
				$rules,
				$conflict_analysis[ $selector ] ?? []
			);
		}
	}
	/**
	 * Apply reset styles directly to matching widgets
	 */
	private function apply_reset_styles_directly_to_widgets(
		string $selector,
		array $rules,
		array $widgets
	): void {
		$matching_widgets = $this->find_widgets_by_element_type( $selector, $widgets );
		if ( empty( $matching_widgets ) ) {
			return;
		}
$properties = [];
		foreach ( $rules as $rule ) {
			if ( isset( $rule['properties'] ) && is_array( $rule['properties'] ) ) {
				foreach ( $rule['properties'] as $property_data ) {
					$converted = $this->convert_property_if_needed(
						$property_data['property'] ?? '',
						$property_data['value'] ?? ''
					);
					$properties[] = [
						'property' => $property_data['property'] ?? '',
						'value' => $property_data['value'] ?? '',
						'important' => $property_data['important'] ?? false,
						'converted_property' => $converted,
					];
				}
			} elseif ( isset( $rule['property'] ) && isset( $rule['value'] ) ) {
				$converted = $this->convert_property_if_needed(
					$rule['property'],
					$rule['value']
				);
				$properties[] = [
					'property' => $rule['property'],
					'value' => $rule['value'],
					'important' => $rule['important'] ?? false,
					'converted_property' => $converted,
				];
			}
		}
$this->unified_style_manager->collect_reset_styles(
			$selector,
			$properties,
			$matching_widgets,
			true
		);
	}
	/**
	 * Collect complex reset styles for CSS file generation
	 */
	private function collect_complex_reset_styles_for_css_file(
		string $selector,
		array $rules,
		array $conflicts
	): void {
		// Convert rules to properties format
		$properties = [];
		foreach ( $rules as $rule ) {
			foreach ( $rule['properties'] ?? [] as $property_data ) {
				$properties[] = [
					'property' => $property_data['property'],
					'value' => $property_data['value'],
					'important' => $property_data['important'] ?? false,
				];
			}
		}
		// Collect via unified style manager for CSS file generation
		$this->unified_style_manager->collect_complex_reset_styles(
			$selector,
			$properties,
			$conflicts
		);
	}
	private function analyze_element_selector_conflicts_for_direct_styling( array $analyzer_rules ): array {
		// Legacy method - now handled by collect_reset_styles
		return [];
	}
	private function convert_css_property_to_atomic_widget_format( string $property, string $value ) {
		return $this->convert_property_if_needed( $property, $value );
	}
	private function apply_direct_element_style_with_higher_priority( string $widget_id, string $selector, array $styles ): void {
		$this->unified_style_manager->collect_direct_element_styles( $widget_id, $selector, $styles );
	}
	private function get_html_element_to_atomic_widget_mapping(): array {
		return [
			'h1' => 'e-heading',
			'h2' => 'e-heading',
			'h3' => 'e-heading',
			'h4' => 'e-heading',
			'h5' => 'e-heading',
			'h6' => 'e-heading',
			'p' => 'e-paragraph',
			'span' => 'e-paragraph',
			'a' => 'e-button',
			'button' => 'e-button',
			'div' => 'e-flexbox',
			'section' => 'e-flexbox',
			'article' => 'e-flexbox',
			'aside' => 'e-flexbox',
			'header' => 'e-flexbox',
			'footer' => 'e-flexbox',
			'main' => 'e-flexbox',
			'nav' => 'e-flexbox',
			'img' => 'e-image',
			'ul' => 'e-flexbox',
			'ol' => 'e-flexbox',
			'li' => 'e-paragraph',
		];
	}
	private function convert_properties_to_simple_key_value_array( array $properties ): array {
		$simple_props = [];
		foreach ( $properties as $prop_data ) {
			$simple_props[ $prop_data['property'] ] = $prop_data['value'];
		}
		return $simple_props;
	}
	private function expand_css_shorthand_properties_using_expander( array $simple_props ): array {
		return \Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander::expand_shorthand_properties( $simple_props );
	}
	private function convert_expanded_properties_back_to_property_data_format( array $expanded, array $original_properties = [] ): array {
		// Create a map of original properties to preserve important flags
		$original_important_flags = [];
		foreach ( $original_properties as $prop_data ) {
			$original_important_flags[ $prop_data['property'] ] = $prop_data['important'] ?? false;
		}
		$result = [];
		foreach ( $expanded as $property => $value ) {
			// Preserve the important flag from the original property, default to false if not found
			$important = $original_important_flags[ $property ] ?? false;
			$result[] = [
				'property' => $property,
				'value' => $value,
				'important' => $important,
			];
		}
		return $result;
	}
	private function get_widget_identifier( array $widget ): string {
		$widget_type = $widget['widget_type'] ?? 'unknown';
		$element_id = $widget['element_id'] ?? 'no-element-id';
		return "{$widget_type}#{$element_id}";
	}
	private function extract_rules_from_document( $document ): array {
		$rules = [];
		$all_rule_sets = $document->getAllRuleSets();
		foreach ( $all_rule_sets as $index => $rule_set ) {
			$selectors = $rule_set->getSelectors();
			$declarations = $rule_set->getRules();
			$extracted_rules = $this->extract_rules_from_selectors( $selectors, $declarations );
			$rules = array_merge( $rules, $extracted_rules );
		}
		return $rules;
	}
	private function extract_rules_from_selectors( array $selectors, array $declarations ): array {
		$rules = [];
		foreach ( $selectors as $selector_index => $selector ) {
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
		foreach ( $declarations as $decl_index => $declaration ) {
			if ( $this->is_valid_declaration( $declaration ) ) {
				$properties[] = $this->create_property_from_declaration( $declaration );
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
		return [
			'property' => $property,
			'value' => $value,
			'important' => $important,
		];
	}
	public function fetch_css_from_urls( array $css_urls, bool $follow_imports = false ): array {
		$all_css = '';
		$fetched_urls = [];
		$errors = [];
		foreach ( $css_urls as $url ) {
			try {
				$css_content = $this->fetch_single_css_url( $url );
				if ( $css_content ) {
					$all_css .= "/* CSS from: {$url} */\n" . $css_content . "\n\n";
					$fetched_urls[] = $url;
					if ( $follow_imports ) {
						$import_urls = $this->extract_import_urls( $css_content, $url );
						foreach ( $import_urls as $import_url ) {
							if ( ! in_array( $import_url, $fetched_urls, true ) ) {
								$import_css = $this->fetch_single_css_url( $import_url );
								if ( $import_css ) {
									$all_css .= "/* CSS from import: {$import_url} */\n" . $import_css . "\n\n";
									$fetched_urls[] = $import_url;
								}
							}
						}
					}
				}
			} catch ( \Exception $e ) {
				$errors[] = [
					'url' => $url,
					'error' => $e->getMessage(),
				];
			}
		}
		return [
			'css' => $all_css,
			'fetched_urls' => $fetched_urls,
			'errors' => $errors,
		];
	}
	private function fetch_single_css_url( string $url ): string {
		$timeout = apply_filters( 'elementor_widget_converter_timeout', 30 );
		$response = wp_remote_get( $url, [
			'timeout' => $timeout,
			'headers' => [
				'Accept' => 'text/css,*/*;q=0.1',
				'User-Agent' => 'Elementor Widget Converter/1.0',
			],
		] );
		if ( is_wp_error( $response ) ) {
			throw new \Exception( 'Failed to fetch CSS from URL: ' . $response->get_error_message() );
		}
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( $response_code !== 200 ) {
			throw new \Exception( "HTTP {$response_code} error when fetching CSS from URL" );
		}
		$css_content = wp_remote_retrieve_body( $response );
		if ( empty( $css_content ) ) {
			throw new \Exception( 'Empty CSS content received from URL' );
		}
		return $css_content;
	}
	private function extract_import_urls( string $css_content, string $base_url ): array {
		$import_urls = [];
		if ( preg_match_all( '/@import\s+(?:url\()?["\']?([^"\'()]+)["\']?\)?[^;]*;/i', $css_content, $matches ) ) {
			foreach ( $matches[1] as $import_url ) {
				$import_url = trim( $import_url );
				if ( ! filter_var( $import_url, FILTER_VALIDATE_URL ) ) {
					$import_url = $this->resolve_relative_url( $import_url, $base_url );
				}
				if ( filter_var( $import_url, FILTER_VALIDATE_URL ) ) {
					$import_urls[] = $import_url;
				}
			}
		}
		return $import_urls;
	}
	private function resolve_relative_url( string $relative_url, string $base_url ): string {
		$base_parts = parse_url( $base_url );
		if ( ! $base_parts ) {
			return $relative_url;
		}
		if ( strpos( $relative_url, '//' ) === 0 ) {
			return ( $base_parts['scheme'] ?? 'https' ) . ':' . $relative_url;
		}
		if ( strpos( $relative_url, '/' ) === 0 ) {
			return ( $base_parts['scheme'] ?? 'https' ) . '://' . $base_parts['host'] . $relative_url;
		}
		$base_path = dirname( $base_parts['path'] ?? '' );
		if ( $base_path === '.' ) {
			$base_path = '';
		}
		return ( $base_parts['scheme'] ?? 'https' ) . '://' . $base_parts['host'] . $base_path . '/' . $relative_url;
	}
	private function extract_css_class_rules_for_global_classes( string $css ): array {
		if ( empty( $css ) ) {
			return [];
		}
		$parsed_css = $this->css_parser->parse( $css );
		$document = $parsed_css->get_document();
		$all_rules = $this->extract_rules_from_document( $document );
		$css_class_rules = [];
		foreach ( $all_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];
			if ( strpos( $selector, '.' ) === 0 && ! empty( $properties ) ) {
				$css_class_rules[] = [
					'selector' => $selector,
					'properties' => $properties,
				];
			}
		}
		return $css_class_rules;
	}
	private function apply_html_class_modifications( array $widgets ): array {
		// Flatten the widget tree to get all widgets
		$flattened_widgets = $this->flatten_widget_tree( $widgets );
		// Apply HTML modifications to all flattened widgets
		$modified_flat_widgets = [];
		foreach ( $flattened_widgets as $widget ) {
			$modified_widget = $this->html_class_modifier->modify_element_classes( $widget );
			$modified_flat_widgets[] = $modified_widget;
		}
		// Reconstruct the original tree structure with modified widgets
		return $this->reconstruct_widget_tree( $widgets, $modified_flat_widgets );
	}
	private function apply_html_class_modifications_recursively( array $element ): array {
		// Modify classes for this element
		$modified_element = $this->html_class_modifier->modify_element_classes( $element );
		// Recursively modify child elements
		if ( isset( $modified_element['elements'] ) && is_array( $modified_element['elements'] ) ) {
			$modified_children = [];
			foreach ( $modified_element['elements'] as $child ) {
				$modified_children[] = $this->apply_html_class_modifications_recursively( $child );
			}
			$modified_element['elements'] = $modified_children;
		}
		return $modified_element;
	}
	private function flatten_widget_tree( array $widgets ): array {
		$flattened_widgets = [];
		foreach ( $widgets as $widget ) {
			$this->flatten_widget_recursively( $widget, $flattened_widgets );
		}
		return $flattened_widgets;
	}
	private function flatten_widget_recursively( array $widget, array &$flattened_widgets ): void {
		// Add the current widget to the flattened list
		$flattened_widgets[] = $widget;
		// Recursively process child widgets if they exist
		if ( isset( $widget['elements'] ) && is_array( $widget['elements'] ) ) {
			foreach ( $widget['elements'] as $child_widget ) {
				$this->flatten_widget_recursively( $child_widget, $flattened_widgets );
			}
		}
		// Also check for 'children' key (alternative structure)
		if ( isset( $widget['children'] ) && is_array( $widget['children'] ) ) {
			foreach ( $widget['children'] as $child_widget ) {
				$this->flatten_widget_recursively( $child_widget, $flattened_widgets );
			}
		}
	}
	private function reconstruct_widget_tree( array $original_widgets, array $modified_flat_widgets ): array {
		$widget_index = 0;
		$reconstructed_widgets = [];
		foreach ( $original_widgets as $original_widget ) {
			$reconstructed_widget = $this->reconstruct_widget_recursively(
				$original_widget,
				$modified_flat_widgets,
				$widget_index
			);
			$reconstructed_widgets[] = $reconstructed_widget;
		}
		return $reconstructed_widgets;
	}
	private function reconstruct_widget_recursively( array $original_widget, array $modified_flat_widgets, int &$widget_index ): array {
		// Get the modified version of this widget
		$modified_widget = $modified_flat_widgets[ $widget_index ] ?? $original_widget;
		++$widget_index;
		// Reconstruct child widgets if they exist
		if ( isset( $original_widget['elements'] ) && is_array( $original_widget['elements'] ) ) {
			$modified_children = [];
			foreach ( $original_widget['elements'] as $child_widget ) {
				$modified_children[] = $this->reconstruct_widget_recursively(
					$child_widget,
					$modified_flat_widgets,
					$widget_index
				);
			}
			$modified_widget['elements'] = $modified_children;
		}
		// Also handle 'children' key (alternative structure)
		if ( isset( $original_widget['children'] ) && is_array( $original_widget['children'] ) ) {
			$modified_children = [];
			foreach ( $original_widget['children'] as $child_widget ) {
				$modified_children[] = $this->reconstruct_widget_recursively(
					$child_widget,
					$modified_flat_widgets,
					$widget_index
				);
			}
			$modified_widget['children'] = $modified_children;
		}
		return $modified_widget;
	}
	private function flatten_all_nested_selectors( array $css_rules ): array {
		$flattened_rules = [];
		$class_mappings = [];
		$classes_with_direct_styles = [];
		$classes_only_in_nested = [];
		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( empty( $selector ) ) {
				$flattened_rules[] = $rule;
				continue;
			}
			// Track classes with direct styles (e.g., ".first { ... }")
			if ( $this->is_direct_class_selector( $selector ) ) {
				$class_name = $this->extract_class_name_from_selector( $selector );
				if ( $class_name ) {
					$classes_with_direct_styles[] = $class_name;
				}
			}
			// Flatten nested selectors
			$should_flatten = $this->flattening_service->should_flatten_selector( $selector );
if ( $should_flatten ) {
				$flattened_rule = $this->flattening_service->flatten_css_rule( $rule );
$flattened_rules[] = $flattened_rule;
				// Build class mapping from nested selector
				$parsed = $this->parse_nested_selector_for_mapping( $selector );
if ( $parsed && ! empty( $parsed['target_class'] ) && ! empty( $flattened_rule['global_class_id'] ) ) {
					// CRITICAL FIX: For element selectors, use pseudo-class format as mapping key
					$mapping_key = $parsed['target_class'];
					if ( $this->is_element_tag( $parsed['target_class'] ) ) {
						$mapping_key = '.' . $parsed['target_class']; // Convert "div" to ".div" for mapping key
					}
					$class_mappings[ $mapping_key ] = $flattened_rule['global_class_id'];
					$classes_only_in_nested[] = $mapping_key;
				} else {
}
				// CRITICAL FIX: Do NOT add the original nested rule to flattened_rules
				// The original rule should be replaced by the flattened rule, not kept alongside it
			} else {
				$flattened_rules[] = $rule;  // Keep as-is
			}
		}
		// Remove duplicates and exclude classes that have direct styles
		$classes_only_in_nested = array_diff(
			array_unique( $classes_only_in_nested ),
			$classes_with_direct_styles
		);
		return [
			'flattened_rules' => $flattened_rules,
			'class_mappings' => $class_mappings,
			'classes_with_direct_styles' => array_unique( $classes_with_direct_styles ),
			'classes_only_in_nested' => array_values( $classes_only_in_nested ),
			'flattened_classes' => $this->flattening_service->get_flattened_classes_for_global_storage(),
		];
	}
	private function is_direct_class_selector( string $selector ): bool {
		// Check if selector is a simple class selector like ".first" or ".active"
		// Should NOT match nested selectors like ".first .second"
		$trimmed = trim( $selector );
		return preg_match( '/^\.[\w-]+$/', $trimmed ) === 1;
	}
	private function extract_class_name_from_selector( string $selector ): ?string {
		return \Elementor\Modules\CssConverter\Services\Css\Css_Selector_Utils::extract_class_name_from_selector( $selector );
	}
	private function parse_nested_selector_for_mapping( string $selector ): ?array {
		// Use existing nested selector parser to get target class
		require_once __DIR__ . '/../nested-selector-parser.php';
		$parser = new \Elementor\Modules\CssConverter\Services\Css\Nested_Selector_Parser();
		$parsed = $parser->parse_nested_selector( $selector );
		if ( ! $parsed || 'simple' === $parsed['type'] ) {
			return null;
		}
		$target = $parsed['target'] ?? '';
		$target_class = $this->extract_target_class_from_parsed_target( $target );
		return [
			'target_class' => $target_class,
			'context' => $parsed['context'] ?? [],
			'type' => $parsed['type'] ?? 'unknown',
		];
	}
	private function extract_target_class_from_parsed_target( string $target ): ?string {
		return \Elementor\Modules\CssConverter\Services\Css\Css_Selector_Utils::extract_target_class_from_parsed_target( $target );
	}
	private function is_element_tag( string $part ): bool {
		return \Elementor\Modules\CssConverter\Services\Css\Css_Selector_Utils::is_element_tag( $part );
	}
	private function process_compound_selectors( array $css_rules ): array {
		$compound_global_classes = [];
		$compound_mappings = [];
		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( empty( $selector ) ) {
				continue;
			}
			if ( ! \Elementor\Modules\CssConverter\Services\Css\Css_Selector_Utils::is_compound_class_selector( $selector ) ) {
				continue;
			}
			$classes = \Elementor\Modules\CssConverter\Services\Css\Css_Selector_Utils::extract_compound_classes( $selector );
			if ( count( $classes ) < 2 ) {
				continue;
			}
			$sorted_classes = $classes;
			sort( $sorted_classes );
			$flattened_name = \Elementor\Modules\CssConverter\Services\Css\Css_Selector_Utils::build_compound_flattened_name( $classes );
			$specificity = \Elementor\Modules\CssConverter\Services\Css\Css_Selector_Utils::calculate_compound_specificity( $classes );
			$converted_properties = $this->convert_rule_properties_to_atomic( $rule['properties'] ?? [] );
			$global_class_data = $this->create_global_class_from_compound(
				$flattened_name,
				$selector,
				$sorted_classes,
				$specificity,
				$converted_properties
			);
			$compound_global_classes[ $flattened_name ] = $global_class_data;
			$compound_mappings[ $flattened_name ] = [
				'requires' => $sorted_classes,
				'specificity' => $specificity,
				'flattened_class' => $flattened_name,
			];
		}
		return [
			'compound_global_classes' => $compound_global_classes,
			'compound_mappings' => $compound_mappings,
		];
	}
	private function create_global_class_from_compound(
		string $flattened_name,
		string $original_selector,
		array $required_classes,
		int $specificity,
		array $converted_properties
	): array {
		$atomic_props = [];
		foreach ( $converted_properties as $prop_data ) {
			$converted = $prop_data['converted_property'] ?? null;
			if ( $converted && is_array( $converted ) ) {
				foreach ( $converted as $atomic_prop_name => $atomic_prop_value ) {
					$atomic_props[ $atomic_prop_name ] = [
						'$$type' => $this->determine_atomic_type( $atomic_prop_name ),
						'value' => $atomic_prop_value,
					];
				}
			}
		}
		return [
			'id' => 'g-' . substr( md5( $original_selector ), 0, 8 ),
			'label' => $flattened_name,
			'type' => 'class',
			'original_selector' => $original_selector,
			'requires' => $required_classes,
			'specificity' => $specificity,
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $atomic_props,
				],
			],
		];
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
