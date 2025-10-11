<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Unified_Css_Processor {
	private $css_parser;
	private $property_converter;
	private $specificity_calculator;
	private $unified_style_manager;

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
	}

	public function process_css_and_widgets( string $css, array $widgets ): array {
		$this->collect_all_styles_from_sources( $css, $widgets );
		$resolved_widgets = $this->resolve_styles_recursively( $widgets );
		$debug_info = $this->unified_style_manager->get_debug_info();

		return [
			'widgets' => $resolved_widgets,
			'stats' => $debug_info,
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

		$this->log_css_parsing_start( $css, $widgets );
		$rules = $this->parse_css_and_extract_rules( $css );
		$this->log_extracted_rules( $rules );
		$this->process_css_rules_for_widgets( $rules, $widgets );
	}

	private function log_css_parsing_start( string $css, array $widgets ): void {
		error_log( '🔍 UNIFIED CSS PROCESSOR: Parsing CSS (' . strlen( $css ) . ' characters)' );
		error_log( '📝 CSS CONTENT: ' . substr( $css, 0, 500 ) . '...' );
		error_log( '🎯 WIDGETS TO MATCH: ' . count( $widgets ) . ' widgets' );

		foreach ( $widgets as $index => $widget ) {
			$classes = $widget['attributes']['class'] ?? '';
			$tag = $widget['tag'] ?? 'unknown';
			$widget_type = $widget['widget_type'] ?? 'unknown';
			error_log( "  Widget #{$index}: {$widget_type} ({$tag}) with classes: '{$classes}'" );
		}
	}

	private function parse_css_and_extract_rules( string $css ): array {
		$parsed_css = $this->css_parser->parse( $css );
		$document = $parsed_css->get_document();

		error_log( '🔍 UNIFIED CSS PROCESSOR: Extracting rules from parsed document' );
		return $this->extract_rules_from_document( $document );
	}

	private function log_extracted_rules( array $rules ): void {
		error_log( '✅ UNIFIED CSS PROCESSOR: Found ' . count( $rules ) . ' CSS rules' );

		foreach ( $rules as $index => $rule ) {
			$selector = $rule['selector'] ?? 'no-selector';
			$prop_count = count( $rule['properties'] ?? [] );
			$properties_list = implode( ', ', array_keys( $rule['properties'] ?? [] ) );
			error_log( "📋 UNIFIED CSS PROCESSOR: Rule #{$index}: '{$selector}' with {$prop_count} properties: {$properties_list}" );
		}
	}

	private function process_css_rules_for_widgets( array $rules, array $widgets ): void {
		foreach ( $rules as $rule ) {
			$selector = $rule['selector'];
			$properties = $rule['properties'] ?? [];

			$this->log_rule_processing( $selector, $properties );

			if ( empty( $properties ) ) {
				error_log( '  ⚠️ Skipping rule with no properties' );
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
		error_log( "🎯 PROCESSING RULE: {$selector} with " . count( $properties ) . ' properties' );
		error_log( '   Properties: ' . implode( ', ', array_keys( $properties ) ) );
	}

	private function log_matched_elements( string $selector, array $matched_elements ): void {
		error_log( '  🎯 MATCHED ELEMENTS: ' . count( $matched_elements ) . " elements for selector '{$selector}'" );

		if ( ! empty( $matched_elements ) ) {
			foreach ( $matched_elements as $matched ) {
				$matched_widget_type = $matched['widget_type'] ?? 'unknown';
				$matched_classes = $matched['attributes']['class'] ?? '';
				error_log( "    ✓ Matched {$matched_widget_type} with classes: {$matched_classes}" );
			}
		}
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
		$converted_properties = [];

		foreach ( $properties as $property_data ) {
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

	private function collect_inline_styles_from_widgets( array $widgets ) {
		$this->log_inline_style_collection_start( $widgets );
		$this->collect_inline_styles_recursively( $widgets );
		$this->log_inline_style_collection_complete();
	}

	private function log_inline_style_collection_start( array $widgets ): void {
		error_log( 'UNIFIED_CSS_PROCESSOR: Collecting inline styles from ' . count( $widgets ) . ' widgets' );
	}

	private function log_inline_style_collection_complete(): void {
		error_log( 'UNIFIED_CSS_PROCESSOR: Finished collecting inline styles' );
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
		error_log( 'UNIFIED_CSS_PROCESSOR: Processing widget element_id: ' . var_export( $element_id, true ) . ', inline_css properties: ' . count( $inline_css ) );
		error_log( 'UNIFIED_CSS_PROCESSOR: Inline CSS structure: ' . var_export( $inline_css, true ) );
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

			$this->unified_style_manager->collect_inline_styles( $element_id, [
				$property => [
					'value' => $value,
					'important' => $important,
					'converted_property' => $converted,
				],
			] );
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
			error_log( "UNIFIED_CSS_PROCESSOR: Widget {$element_id} has " . count( $widget['children'] ) . ' children, processing recursively...' );
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

		if ( $this->is_border_radius_property_mapping( $css_property, $atomic_property ) ) {
			return true;
		}

		return $css_property === $atomic_property;
	}

	private function is_margin_property_mapping( string $css_property, string $atomic_property ): bool {
		return 'margin' === $atomic_property && in_array( $css_property, [
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
		], true );
	}

	private function is_border_radius_property_mapping( string $css_property, string $atomic_property ): bool {
		return 'border-radius' === $atomic_property && in_array( $css_property, [
			'border-radius',
			'border-top-left-radius',
			'border-top-right-radius',
			'border-bottom-left-radius',
			'border-bottom-right-radius',
			'border-start-start-radius',
			'border-start-end-radius',
			'border-end-start-radius',
			'border-end-end-radius',
		], true );
	}

	private function resolve_styles_recursively( array $widgets ): array {
		$resolved_widgets = [];

		foreach ( $widgets as $widget ) {
			$widget_id = $this->get_widget_identifier( $widget );

			error_log( "UNIFIED_CSS_PROCESSOR: Resolving styles for widget {$widget_id}" );

			// Resolve styles for this widget
			$resolved_styles = $this->unified_style_manager->resolve_styles_for_widget( $widget );
			$widget['resolved_styles'] = $resolved_styles;

			error_log( "UNIFIED_CSS_PROCESSOR: ✅ Widget {$widget_id} resolved with " . count( $resolved_styles ) . ' winning styles' );

			// Recursively resolve styles for child widgets
			if ( ! empty( $widget['children'] ) ) {
				error_log( "UNIFIED_CSS_PROCESSOR: Widget {$widget_id} has " . count( $widget['children'] ) . ' children, resolving styles recursively...' );
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
		error_log( "Unified CSS Processor: Widget has ID '{$html_id}' - ready for ID style collection" );
	}

	private function find_matching_widgets( string $selector, array $widgets ): array {
		$matched_elements = [];

		error_log( "🔍 FIND_MATCHING_WIDGETS: Searching for selector '{$selector}' in " . count( $widgets ) . " widgets" );

		foreach ( $widgets as $widget ) {
			$widget_type = $widget['widget_type'] ?? 'unknown';
			$element_id = $widget['element_id'] ?? null;
			$classes = $widget['attributes']['class'] ?? '';
			
			error_log( "  📦 Checking widget: {$widget_type}, element_id: " . ($element_id ?? 'MISSING') . ", classes: '{$classes}'" );
			
			if ( $this->selector_matches_widget( $selector, $widget ) ) {
				if ( $element_id ) {
					$matched_elements[] = $element_id;
					error_log( "    ✅ MATCHED! Added element_id: {$element_id}" );
				} else {
					error_log( "    ⚠️ MATCHED but NO element_id! Widget: {$widget_type}" );
				}
			}
		}

		error_log( "🎯 FIND_MATCHING_WIDGETS: Found " . count( $matched_elements ) . " matches: " . implode( ', ', $matched_elements ) );
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
		error_log( "    🔍 MATCHING: selector '{$selector}' against element '{$element_type}' with classes '{$classes}'" );
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
		error_log( "      📋 CLASS MATCH: Looking for '{$class_from_selector}' in [" . implode( ', ', $widget_classes ) . '] = ' . ( $is_match ? 'MATCH' : 'NO MATCH' ) );
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
		error_log( "Unified CSS Processor: Property conversion failed for {$property}: {$e->getMessage()}" );
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
}
