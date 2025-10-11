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
		
		// Phase 1: COLLECT all styles (no widget creation yet)
		$this->unified_style_manager->reset();
		
		// Collect CSS selector styles
		$this->collect_css_styles( $css, $widgets );
		
		// Collect inline styles from widgets
		$this->collect_inline_styles_from_widgets( $widgets );
		
		// Collect ID styles
		$this->collect_id_styles_from_widgets( $widgets );
		
		// Phase 2: RESOLVE styles for each widget RECURSIVELY
		$resolved_widgets = $this->resolve_styles_recursively( $widgets );
		
		// Debug info
		$debug_info = $this->unified_style_manager->get_debug_info();
		
		return [
			'widgets' => $resolved_widgets,
			'stats' => $debug_info,
		];
	}

	private function collect_css_styles( string $css, array $widgets ) {
		if ( empty( $css ) ) {
			return;
		}
		
		error_log( "🔍 UNIFIED CSS PROCESSOR: Parsing CSS (" . strlen( $css ) . " characters)" );
		error_log( "📝 CSS CONTENT: " . substr( $css, 0, 500 ) . "..." );
		error_log( "🎯 WIDGETS TO MATCH: " . count( $widgets ) . " widgets" );
		
		foreach ( $widgets as $index => $widget ) {
			$classes = $widget['attributes']['class'] ?? '';
			$tag = $widget['tag'] ?? 'unknown';
			error_log( "  Widget #{$index}: {$tag} with classes: '{$classes}'" );
		}
		
		$parsed_css = $this->css_parser->parse( $css );
		$document = $parsed_css->get_document();
		
		// Extract rules from the parsed CSS document
		error_log( "🔍 UNIFIED CSS PROCESSOR: Extracting rules from parsed document" );
		$rules = $this->extract_rules_from_document( $document );
		
		error_log( "✅ UNIFIED CSS PROCESSOR: Found " . count( $rules ) . " CSS rules" );
		
		// Log each rule for debugging
		foreach ( $rules as $index => $rule ) {
			$selector = $rule['selector'] ?? 'no-selector';
			$prop_count = count( $rule['properties'] ?? [] );
			error_log( "📋 UNIFIED CSS PROCESSOR: Rule #{$index}: '{$selector}' with {$prop_count} properties" );
		}
		
		foreach ( $rules as $rule ) {
			$selector = $rule['selector'];
			$properties = $rule['properties'] ?? [];
			
			error_log( "🎯 PROCESSING RULE: {$selector} with " . count( $properties ) . " properties" );
			
			if ( empty( $properties ) ) {
				error_log( "  ⚠️ Skipping rule with no properties" );
				continue;
			}
			
			// Find widgets that match this selector
			$matched_elements = $this->find_matching_widgets( $selector, $widgets );
			error_log( "  🎯 MATCHED ELEMENTS: " . count( $matched_elements ) . " elements for selector '{$selector}'" );
			
			if ( ! empty( $matched_elements ) ) {
				// Convert properties to atomic format
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
				
				$this->unified_style_manager->collect_css_selector_styles( 
					$selector, 
					$converted_properties, 
					$matched_elements 
				);
			}
		}
	}

	private function collect_inline_styles_from_widgets( array $widgets ) {
		error_log( "UNIFIED_CSS_PROCESSOR: Collecting inline styles from " . count( $widgets ) . " widgets" );
		$this->collect_inline_styles_recursively( $widgets );
		error_log( "UNIFIED_CSS_PROCESSOR: Finished collecting inline styles" );
	}

	private function collect_inline_styles_recursively( array $widgets ) {
		foreach ( $widgets as $widget ) {
			$element_id = $widget['element_id'] ?? null;
			$inline_css = $widget['inline_css'] ?? [];
			
			error_log( "UNIFIED_CSS_PROCESSOR: Processing widget element_id: " . var_export( $element_id, true ) . ", inline_css properties: " . count( $inline_css ) );
			error_log( "UNIFIED_CSS_PROCESSOR: Inline CSS structure: " . var_export( $inline_css, true ) );
			
			// Collect inline styles for this widget
			if ( $element_id && ! empty( $inline_css ) ) {
				
				// ✅ CRITICAL FIX: Process inline CSS as batch to handle property key collisions
				// Collect all inline properties first
				$inline_properties = [];
				foreach ( $inline_css as $property => $property_data ) {
					$value = $property_data['value'] ?? $property_data;
					$inline_properties[ $property ] = $value;
				}
				
				
				// Process all properties as batch using collision detection
				$batch_converted = $this->convert_properties_batch( $inline_properties );
				
				
				// Store each converted property with proper collision handling
				foreach ( $inline_css as $property => $property_data ) {
					$value = $property_data['value'] ?? $property_data;
					$important = $property_data['important'] ?? false;
					
					// Find the converted property in batch results
					$converted = null;
					foreach ( $batch_converted as $atomic_property => $atomic_value ) {
						if ( $this->is_property_source_unified( $property, $atomic_property ) ) {
							$converted = [ $atomic_property => $atomic_value ];
							break;
						}
					}
					
					
					// Store the converted property in the unified style manager
					$this->unified_style_manager->collect_inline_styles( $element_id, [
						$property => [
							'value' => $value,
							'important' => $important,
							'converted_property' => $converted,
						]
					] );
				}
			}
			
			// Recursively process child widgets
			if ( ! empty( $widget['children'] ) ) {
				error_log( "UNIFIED_CSS_PROCESSOR: Widget {$element_id} has " . count( $widget['children'] ) . " children, processing recursively..." );
				$this->collect_inline_styles_recursively( $widget['children'] );
			}
		}
	}

	private function convert_properties_batch( array $properties ): array {
		// Use the same batch conversion service that has collision detection
		if ( ! $this->property_converter ) {
			return [];
		}
		
		return $this->property_converter->convert_properties_to_v4_atomic( $properties );
	}
	
	private function is_property_source_unified( string $css_property, string $atomic_property ): bool {
		// For margin properties, all individual margin properties map to 'margin' atomic property
		if ( 'margin' === $atomic_property && in_array( $css_property, [
			'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
			'margin-block-start', 'margin-block-end', 'margin-inline-start', 'margin-inline-end',
			'margin-block', 'margin-inline'
		], true ) ) {
			return true;
		}
		
		// For border-radius properties, all individual border-radius properties map to 'border-radius' atomic property
		if ( 'border-radius' === $atomic_property && in_array( $css_property, [
			'border-radius', 'border-top-left-radius', 'border-top-right-radius', 
			'border-bottom-left-radius', 'border-bottom-right-radius',
			'border-start-start-radius', 'border-start-end-radius', 
			'border-end-start-radius', 'border-end-end-radius'
		], true ) ) {
			return true;
		}
		
		// For other properties, check if CSS property matches atomic property
		return $css_property === $atomic_property;
	}

	private function resolve_styles_recursively( array $widgets ): array {
		$resolved_widgets = [];
		
		foreach ( $widgets as $widget ) {
			$widget_id = $this->get_widget_identifier( $widget );
			
			error_log( "UNIFIED_CSS_PROCESSOR: Resolving styles for widget {$widget_id}" );
			
			// Resolve styles for this widget
			$resolved_styles = $this->unified_style_manager->resolve_styles_for_widget( $widget );
			$widget['resolved_styles'] = $resolved_styles;
			
			error_log( "UNIFIED_CSS_PROCESSOR: ✅ Widget {$widget_id} resolved with " . count( $resolved_styles ) . " winning styles" );
			
			// Recursively resolve styles for child widgets
			if ( ! empty( $widget['children'] ) ) {
				error_log( "UNIFIED_CSS_PROCESSOR: Widget {$widget_id} has " . count( $widget['children'] ) . " children, resolving styles recursively..." );
				$widget['children'] = $this->resolve_styles_recursively( $widget['children'] );
			}
			
			$resolved_widgets[] = $widget;
		}
		
		return $resolved_widgets;
	}

	private function collect_id_styles_from_widgets( array $widgets ) {
		// This would collect ID-specific styles
		// For now, we'll implement basic ID matching
		foreach ( $widgets as $widget ) {
			$html_id = $widget['attributes']['id'] ?? null;
			$element_id = $widget['element_id'] ?? null;
			
			if ( $html_id && $element_id ) {
				// ID styles would be collected here
				// This is a placeholder - actual ID styles would come from CSS parsing
				error_log( "Unified CSS Processor: Widget has ID '{$html_id}' - ready for ID style collection" );
			}
		}
	}

	private function find_matching_widgets( string $selector, array $widgets ): array {
		$matched_elements = [];
		
		foreach ( $widgets as $widget ) {
			if ( $this->selector_matches_widget( $selector, $widget ) ) {
				$element_id = $widget['element_id'] ?? null;
				if ( $element_id ) {
					$matched_elements[] = $element_id;
				}
			}
		}
		
		return $matched_elements;
	}

	private function selector_matches_widget( string $selector, array $widget ): bool {
		$element_type = $widget['tag'] ?? $widget['widget_type'] ?? '';
		$html_id = $widget['attributes']['id'] ?? '';
		$classes = $widget['attributes']['class'] ?? '';
		
		error_log( "    🔍 MATCHING: selector '{$selector}' against element '{$element_type}' with classes '{$classes}'" );
		
		// Simple selector matching (can be enhanced)
		
		// Element selector (e.g., "h1")
		if ( $selector === $element_type ) {
			return true;
		}
		
		// ID selector (e.g., "#special-heading")
		if ( strpos( $selector, '#' ) === 0 ) {
			$id_from_selector = substr( $selector, 1 );
			return $html_id === $id_from_selector;
		}
		
		// Class selector (e.g., ".special-heading")
		if ( strpos( $selector, '.' ) === 0 ) {
			$class_from_selector = substr( $selector, 1 );
			$widget_classes = explode( ' ', $classes );
			$match = in_array( $class_from_selector, $widget_classes, true );
			error_log( "      📋 CLASS MATCH: Looking for '{$class_from_selector}' in [" . implode( ', ', $widget_classes ) . "] = " . ( $match ? 'MATCH' : 'NO MATCH' ) );
			return $match;
		}
		
		// Combined selectors (e.g., "h1.special-heading")
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
		
		// Use the existing property converter
		try {
			return $this->property_converter->convert_property_to_v4_atomic( $property, $value );
		} catch ( \Exception $e ) {
			error_log( "Unified CSS Processor: Property conversion failed for {$property}: {$e->getMessage()}" );
			return null;
		}
	}

	private function get_widget_identifier( array $widget ): string {
		$widget_type = $widget['widget_type'] ?? 'unknown';
		$element_id = $widget['element_id'] ?? 'no-element-id';
		return "{$widget_type}#{$element_id}";
	}

	private function extract_rules_from_document( $document ): array {
		$rules = [];
		
		// Get all rule sets from the document
		$all_rule_sets = $document->getAllRuleSets();
		
		foreach ( $all_rule_sets as $index => $rule_set ) {
			$selectors = $rule_set->getSelectors();
			$declarations = $rule_set->getRules();
			
			foreach ( $selectors as $selector_index => $selector ) {
				$selector_string = (string) $selector;
				
				$properties = [];
				
				foreach ( $declarations as $decl_index => $declaration ) {
					
					// Use Sabberworm API methods
					if ( method_exists( $declaration, 'getRule' ) && method_exists( $declaration, 'getValue' ) ) {
						$property = $declaration->getRule();
						$value = (string) $declaration->getValue();
						$important = method_exists( $declaration, 'getIsImportant' ) ? $declaration->getIsImportant() : false;
						
						
						$properties[] = [
							'property' => $property,
							'value' => $value,
							'important' => $important,
						];
					}
				}
				
				if ( ! empty( $properties ) ) {
					$rule = [
						'selector' => $selector_string,
						'properties' => $properties,
					];
					$rules[] = $rule;
				}
			}
		}
		
		return $rules;
	}
}
