<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Css\Reset_Selector_Analyzer;

class Unified_Css_Processor {

	private $css_parser;
	private $property_converter;
	private $specificity_calculator;
	private $unified_style_manager;
	private $reset_selector_analyzer;

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
		$this->reset_selector_analyzer = new Reset_Selector_Analyzer( $specificity_calculator );
	}

	public function process_css_and_widgets( string $css, array $widgets ): array {
		
		$this->collect_all_styles_from_sources( $css, $widgets );
		$resolved_widgets = $this->resolve_styles_recursively( $widgets );
		$debug_info = $this->unified_style_manager->get_debug_info();
		$css_class_rules = $this->extract_css_class_rules_for_global_classes( $css );

		
		return [
			'widgets' => $resolved_widgets,
			'stats' => $debug_info,
			'css_class_rules' => $css_class_rules,
		];
	}

	private function collect_all_styles_from_sources( string $css, array $widgets ): void {
		$this->unified_style_manager->reset();
		$this->collect_css_styles( $css, $widgets );
		$this->collect_inline_styles_from_widgets( $widgets );
		$this->collect_id_styles_from_widgets( $widgets );
	}

	private function collect_css_styles( string $css, array $widgets ) {
		if ( empty( $css ) ) {
			return;
		}

		
		// Check if CSS contains h1 selectors
		if ( strpos($css, 'h1') !== false ) {
			$h1_matches = [];
			preg_match_all('/h1\s*\{[^}]*\}/', $css, $h1_matches);
			foreach ( $h1_matches[0] as $i => $match ) {
			}
		}
		
		$this->log_css_parsing_start( $css, $widgets );
		$rules = $this->parse_css_and_extract_rules( $css );
		
		// Debug: Check if h1 rules made it through parsing
		$h1_rules_found = 0;
		foreach ( $rules as $rule ) {
			if ( isset($rule['selector']) && $rule['selector'] === 'h1' ) {
				$h1_rules_found++;
			}
		}
		
		$this->log_extracted_rules( $rules );
		
		// APPROACH 6: Analyze simple element selectors for direct widget styling
		$this->analyze_and_apply_direct_element_styles( $rules, $widgets );
		
		$this->process_css_rules_for_widgets( $rules, $widgets );
	}

	private function log_css_parsing_start( string $css, array $widgets ): void {
		// Debug logging removed for performance
	}

	private function parse_css_and_extract_rules( string $css ): array {
		$parsed_css = $this->css_parser->parse( $css );
		$document = $parsed_css->get_document();
		return $this->extract_rules_from_document( $document );
	}

	private function log_extracted_rules( array $rules ): void {
		$this->skip_debug_logging_for_performance();
	}

	private function analyze_and_apply_direct_element_styles( array $rules, array $widgets ): void {
		
		$this->log_sample_rules_for_debugging( $rules );
		for ( $i = 0; $i < min(3, count($rules)); $i++ ) {
			$rule = $rules[$i];
			$selector = $rule['selector'] ?? 'no-selector';
			$prop_count = count($rule['properties'] ?? []);
		}
		
		$analyzer_rules = $this->convert_rules_to_analyzer_format( $rules );
		
		$conflict_map = $this->analyze_element_selector_conflicts_for_direct_styling( $analyzer_rules );
		
		$simple_selectors_found = 0;
		$applied_count = 0;
		$skipped_count = 0;
		
		foreach ( $analyzer_rules as $rule ) {
			$selector = $rule['selector'];
			
			
			if ( $this->reset_selector_analyzer->is_simple_element_selector( $selector ) ) {
				$simple_selectors_found++;
				$conflicts = $conflict_map[ $selector ] ?? [];
				
				
				if ( empty( $conflicts ) ) {
					$this->apply_direct_element_styles_to_widgets( $rule, $widgets );
					$applied_count++;
				} else {
					$skipped_count++;
				}
			} else {
			}
		}
		
	}

	private function convert_rules_to_analyzer_format( array $rules ): array {
		$analyzer_rules = [];
		
		
		foreach ( $rules as $rule ) {
			$selector = $rule['selector'];
			$properties = $rule['properties'] ?? [];
			
			if ( $selector === 'h1' || strpos($selector, 'h1') !== false ) {
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
		
		
		// Find widgets that match this element selector
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
			
			
			if ( $element_id && $widget_type === $target_widget_type ) {
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

			$this->log_rule_processing( $selector, $properties );

			if ( empty( $properties ) ) {
				continue;
			}

			$matched_elements = $this->find_matching_widgets( $selector, $widgets );
			$this->log_matched_elements( $selector, $matched_elements );

			if ( ! empty( $matched_elements ) ) {
				$this->process_matched_rule( $selector, $properties, $matched_elements );
			}
		}
	}

	private function log_rule_processing( string $selector, array $properties ): void {
		$this->skip_debug_logging_for_performance();
	}

	private function log_matched_elements( string $selector, array $matched_elements ): void {
		$this->skip_debug_logging_for_performance();
	}

	private function process_matched_rule( string $selector, array $properties, array $matched_elements ): void {
		$converted_properties = $this->convert_rule_properties_to_atomic( $properties );

		$this->unified_style_manager->collect_css_selector_styles(
			$selector,
			$converted_properties,
			$matched_elements
		);
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

		$result = $this->convert_expanded_properties_back_to_property_data_format( $expanded );

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

			// Resolve styles for this widget
			$resolved_styles = $this->unified_style_manager->resolve_styles_for_widget( $widget );
			$widget['resolved_styles'] = $resolved_styles;

			// Recursively resolve styles for child widgets
			if ( ! empty( $widget['children'] ) ) {
				$widget['children'] = $this->resolve_styles_recursively( $widget['children'] );
			}

			$resolved_widgets[] = $widget;
		}

		return $resolved_widgets;
	}

	private function collect_id_styles_from_widgets( array $widgets ) {
		foreach ( $widgets as $widget ) {
			$html_id = $widget['attributes']['id'] ?? null;
			$element_id = $widget['element_id'] ?? null;

			if ( $html_id && $element_id ) {
				$this->log_id_style_collection_ready( $html_id );
			}
		}
	}

	private function log_id_style_collection_ready( string $html_id ): void {
		$this->skip_debug_logging_for_performance();
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

		if ( $this->is_combined_selector_match( $selector, $element_type, $classes ) ) {
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
			$id_from_selector = substr( $selector, 1 );
			return $html_id === $id_from_selector;
		}
		return false;
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

	private function is_combined_selector_match( string $selector, string $element_type, string $classes ): bool {
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
		// Intentionally empty - debug logging removed for performance optimization
	}

	private function log_sample_rules_for_debugging( array $rules ): void {
		// Intentionally empty - debug logging removed for performance optimization
	}

	private function analyze_element_selector_conflicts_for_direct_styling( array $analyzer_rules ): array {
		return $this->reset_selector_analyzer->analyze_element_selector_conflicts( $analyzer_rules );
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
			'a' => 'e-button',
			'button' => 'e-button',
			'div' => 'e-div-block',
			'span' => 'e-div-block',
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

	private function convert_expanded_properties_back_to_property_data_format( array $expanded ): array {
		$result = [];
		foreach ( $expanded as $property => $value ) {
			$result[] = [
				'property' => $property,
				'value' => $value,
				'important' => false,
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

					// Follow @import statements if requested
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
		
		// Match @import statements
		if ( preg_match_all( '/@import\s+(?:url\()?["\']?([^"\'()]+)["\']?\)?[^;]*;/i', $css_content, $matches ) ) {
			foreach ( $matches[1] as $import_url ) {
				$import_url = trim( $import_url );
				
				// Convert relative URLs to absolute
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

		// Handle protocol-relative URLs
		if ( strpos( $relative_url, '//' ) === 0 ) {
			return ( $base_parts['scheme'] ?? 'https' ) . ':' . $relative_url;
		}

		// Handle absolute paths
		if ( strpos( $relative_url, '/' ) === 0 ) {
			return ( $base_parts['scheme'] ?? 'https' ) . '://' . $base_parts['host'] . $relative_url;
		}

		// Handle relative paths
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
			
			// Check if this is a CSS class selector (starts with .)
			if ( strpos( $selector, '.' ) === 0 && ! empty( $properties ) ) {
				$css_class_rules[] = [
					'selector' => $selector,
					'properties' => $properties,
				];
			}
		}
		
		return $css_class_rules;
	}
}
