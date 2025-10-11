<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Reset_Selector_Analyzer;
use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

class Css_Processor {
	private $specificity_calculator;
	private $property_conversion_service;
	private $css_parser;
	private $global_classes_repository;
	private $reset_selector_analyzer;

	public function __construct( $property_conversion_service = null ) {
		$this->specificity_calculator = new Css_Specificity_Calculator();
		
		$this->initialize_property_conversion_service( $property_conversion_service );
		
		$this->css_parser = new CssParser();
		
		$this->initialize_global_classes_repository();
		
		$this->reset_selector_analyzer = new Reset_Selector_Analyzer( $this->specificity_calculator );
	}

	public function process_css_for_widgets( $css, $widgets ) {
		error_log( "🔍 CSS-PROCESSOR DEBUG: Starting CSS processing with " . strlen( $css ) . " characters of CSS" );
		error_log( "🔍 CSS-PROCESSOR DEBUG: CSS content preview: " . substr( $css, 0, 200 ) . "..." );
		
		$processing_result = [
			'global_classes' => [],
			'widget_styles' => [],
			'element_styles' => [],
			'id_styles' => [],  // New: ID selector styles
			'direct_widget_styles' => [],  // New: Direct widget styles for simple element selectors
			'stats' => [
				'rules_processed' => 0,
				'properties_converted' => 0,
				'global_classes_created' => 0,
				'id_selectors_processed' => 0,  // New: ID selector stats
				'direct_widget_styles_applied' => 0,  // New: Direct widget styles stats
				'unsupported_properties' => [],
				'warnings' => [],
			],
		];

		// Early return if property conversion service failed to initialize
		if ( null === $this->property_conversion_service ) {
			$processing_result['stats']['warnings'][] = [
				'type' => 'property_conversion_service_unavailable',
				'message' => 'Property conversion service failed to initialize - check error logs',
			];
			return $processing_result;
		}

		// ✅ CRITICAL FIX: Expand shorthand properties in CSS text before parsing
		// This ensures <style> block CSS shorthand (like border: 1px solid #dee2e6) gets expanded
		// to individual properties (border-width, border-style, border-color) before rule processing
		$css = $this->expand_css_shorthand_properties( $css );

		$parsed_css = $this->parse_css_safely( $css );
		
		if ( $this->is_css_parsing_successful( $parsed_css ) ) {
			$this->process_parsed_css( $parsed_css, $processing_result );
		} else {
			$this->handle_css_parsing_failure( $processing_result );
		}

		return $processing_result;
	}

	private function extract_css_rules( $parsed_css ) {
		$rules = [];
		
		if ( ! $parsed_css || ! method_exists( $parsed_css, 'get_document' ) ) {
			return $rules;
		}

		$document = $parsed_css->get_document();
		if ( ! $document || ! method_exists( $document, 'getAllRuleSets' ) ) {
			return $rules;
		}

		foreach ( $document->getAllRuleSets() as $rule_set ) {
			$selectors = [];
			
			// Get all selectors for this rule set
			foreach ( $rule_set->getSelectors() as $selector ) {
				$selectors[] = $selector->getSelector();
			}

			// Get all declarations for this rule set
			foreach ( $rule_set->getRules() as $rule ) {
				if ( method_exists( $rule, 'getRule' ) && method_exists( $rule, 'getValue' ) ) {
					$property = $rule->getRule();  // Fixed: use getRule() instead of getProperty()
					$value = $rule->getValue();
					$is_important = $rule->getIsImportant();

					foreach ( $selectors as $selector ) {
						$rules[] = [
							'selector' => trim( $selector ),
							'property' => $property,
							'value' => (string) $value,
							'important' => $is_important,
						];
					}
				}
			}
		}

		return $rules;
	}

	private function extract_id_selectors( array $css_rules ): array {
		$id_selectors = [];
		
		foreach ( $css_rules as $rule ) {
			// Check if this rule has an ID selector
			if ( preg_match( '/#([a-zA-Z][\w-]*)/', $rule['selector'], $matches ) ) {
				$id_name = $matches[1];
				
				if ( ! isset( $id_selectors[ $id_name ] ) ) {
					$id_selectors[ $id_name ] = [];
				}
				
				$id_selectors[ $id_name ][] = [
					'selector' => $rule['selector'],
					'property' => $rule['property'],
					'value' => $rule['value'],
					'important' => $rule['important'],
				];
			}
		}
		
		return $id_selectors;
	}

	private function match_elements_to_id_selectors( array $elements, array $id_selectors ): array {
		$matches = [];
		
		foreach ( $elements as $element ) {
			if ( ! empty( $element['attributes']['id'] ) ) {
				$element_id = $element['attributes']['id'];
				
				if ( isset( $id_selectors[ $element_id ] ) ) {
					$matches[ $element_id ] = [
						'element' => $element,
						'styles' => $id_selectors[ $element_id ],
					];
				}
			}
		}
		
		return $matches;
	}

	private function calculate_id_specificity( string $selector ): int {
		return $this->specificity_calculator->calculate_specificity( $selector );
	}

	private function process_css_rule( $rule, &$processing_result ) {
		$categorized_rule = $this->specificity_calculator->categorize_css_rule(
			$rule['selector'],
			$rule['property'],
			$rule['value'],
			$rule['important']
		);

		// Debug: Log CSS rule categorization
		error_log( "🔍 CSS-PROCESSOR DEBUG: Rule {$rule['selector']} {$rule['property']} categorized as target='{$categorized_rule['target']}', category='{$categorized_rule['category']}'" );

		// Route to appropriate processing based on target type and category
		switch ( $categorized_rule['target'] ) {
			case 'widget_props':
				// Check if this is an ID selector for special handling
				if ( $categorized_rule['category'] === 'id' ) {
					$this->process_id_selector_rule( $categorized_rule, $processing_result );
				} else {
					$this->process_widget_prop_rule( $categorized_rule, $processing_result );
				}
				break;
			case 'global_classes':
				$this->process_global_class_rule( $categorized_rule, $processing_result );
				break;
			case 'element_styles':
				$this->process_element_style_rule( $categorized_rule, $processing_result );
				break;
		}
	}

	private function process_id_selector_rule( $rule, &$processing_result ) {
		// Extract ID from selector
		if ( preg_match( '/#([a-zA-Z][\w-]*)/', $rule['selector'], $matches ) ) {
			$id_name = $matches[1];
			
		$converted_property = $this->convert_css_property_safely( 
			$rule['property'], 
			$rule['value'] 
		);
		
		$this->log_property_conversion_result( $converted_property );

		if ( $this->is_property_conversion_successful( $converted_property ) ) {
			$this->store_id_specific_style( $processing_result, $id_name, $rule, $converted_property );
			$this->record_successful_id_conversion( $processing_result );
		} else {
			$this->record_failed_id_conversion( $processing_result, $rule );
		}
		}
	}

	private function process_widget_prop_rule( $rule, &$processing_result ) {
		$converted_property = $this->convert_css_property_safely( 
			$rule['property'], 
			$rule['value'] 
		);

		if ( $this->is_property_conversion_successful( $converted_property ) ) {
			$this->store_widget_style( $processing_result, $rule, $converted_property );
			$processing_result['stats']['properties_converted']++;
		} else {
			$this->record_widget_conversion_failure( $processing_result, $rule );
		}
	}

	private function store_widget_style( array &$processing_result, array $rule, $converted_property ): void {
		$processing_result['widget_styles'][] = [
			'selector' => $rule['selector'],
			'original_property' => $rule['property'],
			'original_value' => $rule['value'],
			'converted_property' => $converted_property,
			'specificity' => $rule['specificity'],
			'important' => $rule['important'],
		];
	}

	private function record_widget_conversion_failure( array &$processing_result, array $rule ): void {
		$processing_result['stats']['unsupported_properties'][] = [
			'property' => $rule['property'],
			'value' => $rule['value'],
			'selector' => $rule['selector'],
			'reason' => 'No converter available',
		];
	}

	private function process_global_class_rule( $rule, &$processing_result ) {
		// Extract class name from selector
		$class_names = $this->extract_class_names( $rule['selector'] );
		
		foreach ( $class_names as $class_name ) {
			// HVV Decision: threshold = 1, create global class for every CSS class
			if ( ! isset( $processing_result['global_classes'][ $class_name ] ) ) {
				$processing_result['global_classes'][ $class_name ] = [
					'class_name' => $class_name,
					'properties' => [],
					'selectors' => [],
				];
			}

			// Convert CSS property using existing class conversion service
			try {
				$conversion_result = $this->convert_css_property_with_name( 
					$rule['property'], 
					$rule['value'] 
				);

				if ( $conversion_result ) {
					$mapped_property_name = $conversion_result['property_name'];
					$converted_property = $conversion_result['converted_value'];
					
					$processing_result['global_classes'][ $class_name ]['properties'][] = [
						'original_property' => $rule['property'],
						'original_value' => $rule['value'],
						'mapped_property' => $mapped_property_name,
						'converted_property' => $converted_property,
						'important' => $rule['important'],
					];
					$processing_result['stats']['properties_converted']++;
				}
			} catch ( \Exception $e ) {
				$processing_result['stats']['unsupported_properties'][] = [
					'property' => $rule['property'],
					'value' => $rule['value'],
					'class' => $class_name,
					'reason' => $e->getMessage(),
				];
			}

			$processing_result['global_classes'][ $class_name ]['selectors'][] = $rule['selector'];
		}
	}

	private function process_element_style_rule( $rule, &$processing_result ) {
		$selector = $rule['selector'];
		
		error_log( "🔍 CSS-PROCESSOR DEBUG: Processing element rule: {$selector} {$rule['property']}: {$rule['value']}" );
		
		// NEW: Check if this is a simple element selector eligible for direct widget styling
		if ( $this->reset_selector_analyzer->is_simple_element_selector( $selector ) ) {
			error_log( "✅ CSS-PROCESSOR DEBUG: {$selector} is a simple element selector" );
			// Check for conflicts with other CSS rules
			$all_rules = $this->get_all_rules_from_processing_result( $processing_result );
			$conflicts = $this->reset_selector_analyzer->detect_conflicts_for_selector( 
				$selector, 
				[ $rule ], 
				$all_rules 
			);
			
			if ( empty( $conflicts ) ) {
				// No conflicts - mark for direct widget application
				$this->apply_direct_widget_styling( $rule, $processing_result );
				
				error_log( "CSS Processor: Marked {$selector} {$rule['property']} for direct widget styling (no conflicts)" );
				
				// Skip adding to element_styles - will be applied directly to widgets
				return;
			} else {
				error_log( "CSS Processor: {$selector} has conflicts - using standard element_styles approach" );
			}
		}
		
		// EXISTING: Standard element styles processing (fallback)
		$processing_result['element_styles'][] = [
			'selector' => $rule['selector'],
			'property' => $rule['property'],
			'value' => $rule['value'],
			'specificity' => $rule['specificity'],
			'important' => $rule['important'],
		];
	}

	private function apply_direct_widget_styling( $rule, &$processing_result ) {
		$selector = $rule['selector'];
		
		// Convert CSS property to atomic widget format
		$converted_property = $this->convert_css_property_safely( $rule['property'], $rule['value'] );
		
		error_log( "🔍 CSS-PROCESSOR DEBUG: Property conversion result for {$rule['property']}: " . json_encode( $converted_property ) );
		
		if ( $this->is_property_conversion_successful( $converted_property ) ) {
			if ( ! isset( $processing_result['direct_widget_styles'][ $selector ] ) ) {
				$processing_result['direct_widget_styles'][ $selector ] = [];
			}
			
			$processing_result['direct_widget_styles'][ $selector ][] = [
				'property' => $rule['property'],
				'value' => $rule['value'],
				'converted_property' => $converted_property,
				'specificity' => $rule['specificity'],
				'important' => $rule['important'],
				'source' => 'direct_element_reset',
			];
			
			$processing_result['stats']['direct_widget_styles_applied']++;
		} else {
			// If conversion fails, fall back to element_styles
			$processing_result['element_styles'][] = [
				'selector' => $rule['selector'],
				'property' => $rule['property'],
				'value' => $rule['value'],
				'specificity' => $rule['specificity'],
				'important' => $rule['important'],
			];
		}
	}
	
	private function get_all_rules_from_processing_result( $processing_result ) {
		// This would need to be implemented to get all rules processed so far
		// For now, return empty array - conflict detection will be conservative
		return [];
	}

	private function convert_css_property( $property, $value ) {
		// Use the dedicated CSS property conversion service
		// This ensures consistency and proper separation of concerns
		return $this->property_conversion_service->convert_property_to_v4_atomic( $property, $value );
	}

	private function convert_css_property_with_name( $property, $value ) {
		// Use the dedicated CSS property conversion service with property name mapping
		// This ensures we get both the converted value and the mapped property name
		return $this->property_conversion_service->convert_property_to_v4_atomic_with_name( $property, $value );
	}

	private function extract_class_names( $selector ) {
		$class_names = [];
		
		// Extract class names from selector (e.g., ".btn.primary" -> ["btn", "primary"])
		preg_match_all( '/\.([a-zA-Z][\w-]*)/', $selector, $matches );
		
		if ( ! empty( $matches[1] ) ) {
			$class_names = $matches[1];
		}

		return $class_names;
	}

	private function create_global_classes( &$processing_result ) {
		error_log( "CSS_PROCESSOR_DEBUG: create_global_classes called with " . count( $processing_result['global_classes'] ?? [] ) . " classes: " . wp_json_encode( array_keys( $processing_result['global_classes'] ?? [] ) ) );
		
		if ( ! $this->global_classes_repository ) {
			error_log( "CSS_PROCESSOR_DEBUG: Global classes repository not available" );
			$processing_result['stats']['warnings'][] = [
				'type' => 'global_classes_unavailable',
				'message' => 'Global Classes Repository not available',
			];
			return;
		}

		foreach ( $processing_result['global_classes'] as $class_name => $class_data ) {
			error_log( "CSS_PROCESSOR_DEBUG: Processing global class '{$class_name}' with data: " . wp_json_encode( $class_data ) );
			try {
				// Get current global classes
				$current_global_classes = $this->global_classes_repository->all();
				$current_items = $current_global_classes->get_items()->all();
				$current_order = $current_global_classes->get_order()->all();

				// Prepare global class data in the format expected by Global Classes Repository
				$class_id = sanitize_title( $class_name );
				$global_class_data = [
					'id' => $class_id,
					'label' => $class_name,
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => $this->convert_properties_to_props( $class_data['properties'] ),
							'custom_css' => null,
						],
					],
				];

				// Add new class to items (or update if exists)
				$current_items[ $class_id ] = $global_class_data;
				
				// Add to order if not already present
				if ( ! in_array( $class_id, $current_order, true ) ) {
					$current_order[] = $class_id;
				}

				// Update global classes repository
				$this->global_classes_repository->put( $current_items, $current_order );
				$processing_result['stats']['global_classes_created']++;

			} catch ( \Exception $e ) {
				$processing_result['stats']['warnings'][] = [
					'type' => 'global_class_creation_failed',
					'class_name' => $class_name,
					'message' => $e->getMessage(),
				];
			}
		}
	}

	private function convert_properties_to_props( $properties ) {
		$props = [];
		
		foreach ( $properties as $property_data ) {
			if ( ! empty( $property_data['converted_property'] ) ) {
				$converted = $property_data['converted_property'];
				
				// Handle the property mapper format: ['property' => 'name', 'value' => [...]]
				if ( is_array( $converted ) && isset( $converted['property'] ) && isset( $converted['value'] ) ) {
					$props[ $converted['property'] ] = $converted['value'];
				} elseif ( is_array( $converted ) ) {
					// Fallback: merge if it's already in the correct format
					$props = array_merge( $props, $converted );
				}
			}
		}

		return $props;
	}

	public function apply_styles_to_widget( $widget, $processing_result ) {
		$widget_styles = [];
		$applied_classes = [];
		$id_styles = [];
		$direct_element_styles = [];

		// Get widget info
		$widget_id = $widget['attributes']['id'] ?? 'no-id';
		$widget_type = $widget['widget_type'] ?? 'unknown';
		
		error_log( "CSS Processor: apply_styles_to_widget called for {$widget_type}" );
		error_log( "CSS Processor: Widget has inline_css: " . ( empty( $widget['inline_css'] ) ? 'NO' : 'YES (' . count( $widget['inline_css'] ) . ' properties)' ) );
		
		// NEW: Apply direct element styles for simple element selectors (Approach 6)
		if ( ! empty( $processing_result['direct_widget_styles'] ) ) {
			$widget_tag = $widget['original_tag'] ?? null;
			
			if ( $widget_tag && isset( $processing_result['direct_widget_styles'][ $widget_tag ] ) ) {
				$direct_element_styles = $processing_result['direct_widget_styles'][ $widget_tag ];
				
				error_log( "CSS Processor: Applying " . count( $direct_element_styles ) . " direct styles to {$widget_tag} widget" );
			}
		}
		
		// Apply ID-specific styles (highest specificity after !important and inline)
		if ( ! empty( $widget['attributes']['id'] ) ) {
			$widget_id = $widget['attributes']['id'];
			
			// PHASE 1 DEBUG: ID style matching
			error_log( "🔍 ID_MATCH: Widget {$widget_type} has ID '{$widget_id}'" );
			
			if ( isset( $processing_result['id_styles'][ $widget_id ] ) ) {
				$id_styles = $processing_result['id_styles'][ $widget_id ];
				error_log( "🔍 ID_MATCH: Found " . count( $id_styles ) . " ID styles for #{$widget_id}" );
			} else {
				error_log( "🔍 ID_MATCH: No ID styles found for #{$widget_id}" );
				error_log( "🔍 ID_MATCH: Available ID styles: " . implode( ', ', array_keys( $processing_result['id_styles'] ) ) );
			}
		} else {
			error_log( "🔍 ID_MATCH: Widget {$widget_type} has no ID attribute" );
		}

		// Apply widget-specific styles (high specificity)
		foreach ( $processing_result['widget_styles'] as $style ) {
			if ( $this->style_applies_to_widget( $style, $widget ) ) {
				$widget_styles[] = $style;
			}
		}

		// Apply global classes (class selectors)
		if ( ! empty( $widget['attributes']['class'] ) ) {
			$widget_classes = explode( ' ', $widget['attributes']['class'] );
			
			foreach ( $widget_classes as $class_name ) {
				$class_name = trim( $class_name );
				if ( ! empty( $class_name ) && isset( $processing_result['global_classes'][ $class_name ] ) ) {
					$applied_classes[] = $class_name;
				}
			}
		}

		// Apply element styles (lowest specificity)
		$element_styles = [];
		foreach ( $processing_result['element_styles'] as $style ) {
			if ( $this->style_applies_to_widget( $style, $widget ) ) {
				$element_styles[] = $style;
			}
		}

		// DEBUG: Log applied classes before compute_final_styles
		error_log( "CSS Processor: Applied classes for {$widget_type}: " . implode( ', ', $applied_classes ) );
		error_log( "CSS Processor: Global classes available: " . implode( ', ', array_keys( $processing_result['global_classes'] ?? [] ) ) );
		
		$result = [
			'widget_styles' => $widget_styles,
			'global_classes' => $applied_classes,
			'element_styles' => $element_styles,
			'id_styles' => $id_styles,  // New: ID-specific styles
			'direct_element_styles' => $direct_element_styles,  // NEW: Direct element styles (Approach 6)
			'computed_styles' => $this->compute_final_styles( $widget_styles, $element_styles, $widget, $id_styles, $direct_element_styles, $applied_classes, $processing_result ),
		];
		
		// DEBUG: Log what we're returning
		error_log( "CSS Processor: Returning applied styles with " . count( $id_styles ) . " ID styles for {$widget_type} ({$widget_id})" );
		
		return $result;
	}

	private function style_applies_to_widget( $style, $widget ) {
		$selector = $style['selector'];
		
		// Check if selector matches widget's ID
		if ( ! empty( $widget['attributes']['id'] ) ) {
			$widget_id = $widget['attributes']['id'];
			if ( strpos( $selector, '#' . $widget_id ) !== false ) {
				return true;
			}
		}

		// Check if selector matches widget's classes
		if ( ! empty( $widget['attributes']['class'] ) ) {
			$widget_classes = explode( ' ', $widget['attributes']['class'] );
			foreach ( $widget_classes as $class_name ) {
				$class_name = trim( $class_name );
				if ( ! empty( $class_name ) && strpos( $selector, '.' . $class_name ) !== false ) {
					return true;
				}
			}
		}

		// Check if selector matches widget's tag
		if ( strpos( $selector, $widget['original_tag'] ) !== false ) {
			return true;
		}

		return false;
	}

	private function compute_final_styles( $widget_styles, $element_styles, $widget, $id_styles = [], $direct_element_styles = [], $applied_classes = [], $processing_result = [] ) {
		// Priority order (lowest to highest):
		// 1. Standard element_styles (specificity 1)
		// 2. Direct element resets (specificity 1 but marked as direct)
		// 3. Widget styles (classes, etc.)
		// 4. Class styles (specificity 10)
		// 5. ID styles (specificity 100)
		// 6. Inline styles (specificity 1000)
		// 7. !important (specificity 10000)
		
		// DEBUG: Check what we received
		error_log( "compute_final_styles: applied_classes type: " . gettype( $applied_classes ) . ", count: " . count( $applied_classes ) . ", value: " . var_export( $applied_classes, true ) );
		
		$all_styles = array_merge( $element_styles, $direct_element_styles, $widget_styles );
		
		// Add class styles with proper specificity
		if ( ! empty( $applied_classes ) && ! empty( $processing_result['global_classes'] ) ) {
			error_log( "CSS Processor: Processing class styles for classes: " . implode( ', ', $applied_classes ) );
			foreach ( $applied_classes as $class_name ) {
				if ( isset( $processing_result['global_classes'][ $class_name ]['properties'] ) ) {
					$class_properties = $processing_result['global_classes'][ $class_name ]['properties'];
					error_log( "CSS Processor: Found " . count( $class_properties ) . " properties for class '{$class_name}'" );
					
					foreach ( $class_properties as $class_style ) {
						error_log( "CSS Processor: Adding class style - {$class_style['original_property']}: {$class_style['original_value']} (specificity: " . Css_Specificity_Calculator::CLASS_WEIGHT . ")" );
						$all_styles[] = [
							'property' => $class_style['original_property'],
							'value' => $class_style['original_value'],
							'specificity' => Css_Specificity_Calculator::CLASS_WEIGHT,
							'important' => $class_style['important'] ?? false,
							'source' => 'class',
							'converted_property' => $class_style['converted_property'],
						];
					}
				} else {
					error_log( "CSS Processor: No properties found for class '{$class_name}'" );
				}
			}
		} else {
			error_log( "CSS Processor: No class styles to process (applied_classes: " . count( $applied_classes ) . ", global_classes: " . ( empty( $processing_result['global_classes'] ) ? 'empty' : 'has data' ) . ")" );
		}
		
		// Add ID styles with their converted properties
		foreach ( $id_styles as $id_style ) {
			if ( isset( $id_style['converted_property'] ) ) {
				$all_styles[] = [
					'property' => $id_style['converted_property']['property'],
					'value' => $id_style['converted_property']['value'],
					'specificity' => $id_style['specificity'],
					'important' => $id_style['important'],
					'converted_property' => $id_style['converted_property'],
				];
			}
		}
		
		// Add inline styles (highest specificity after !important)
		if ( ! empty( $widget['inline_css'] ) ) {
			
			// ✅ CRITICAL FIX: Process inline CSS as batch to handle property key collisions
			// Collect all inline properties first
			$inline_properties = [];
			foreach ( $widget['inline_css'] as $property => $style_data ) {
				$inline_properties[ $property ] = $style_data['value'];
			}
			
			
			// Process all properties as batch using collision detection
			$batch_converted = $this->property_conversion_service->convert_properties_to_v4_atomic( $inline_properties );
			
			
			// Add each converted property to styles with proper specificity
			foreach ( $widget['inline_css'] as $property => $style_data ) {
				// Find the converted property in batch results
				$converted_property = null;
				foreach ( $batch_converted as $atomic_property => $atomic_value ) {
					// Check if this atomic property came from our CSS property
					if ( $this->is_property_source( $property, $atomic_property, $batch_converted ) ) {
						$converted_property = [ $atomic_property => $atomic_value ];
						break;
					}
				}
				
				
				$all_styles[] = [
					'property' => $property,
					'value' => $style_data['value'],
					'specificity' => $style_data['important'] ? 
						Css_Specificity_Calculator::IMPORTANT_WEIGHT + Css_Specificity_Calculator::INLINE_WEIGHT :
						Css_Specificity_Calculator::INLINE_WEIGHT,
					'important' => $style_data['important'],
					'source' => 'inline',
					'converted_property' => $converted_property,
				];
			}
		} else {
			error_log( "CSS Processor: No inline styles found for widget" );
		}

		// Group by property and find winning style for each
		$grouped_styles = [];
		foreach ( $all_styles as $index => $style ) {
			$property = $style['original_property'] ?? $style['property'];
			if ( ! isset( $grouped_styles[ $property ] ) ) {
				$grouped_styles[ $property ] = [];
			}
			$style['order'] = $index; // For cascade order
			$grouped_styles[ $property ][] = $style;
		}

		// Compute final value for each property - use atomic values when available
		$computed_styles = [];
		foreach ( $grouped_styles as $property => $styles ) {
			$winning_style = $this->specificity_calculator->get_winning_style( $styles );
			if ( $winning_style ) {
				// Use converted atomic value if available, otherwise use original value
				if ( ! empty( $winning_style['converted_property'] ) ) {
					$converted = $winning_style['converted_property'];
					if ( isset( $converted['property'] ) && isset( $converted['value'] ) ) {
						$computed_styles[ $converted['property'] ] = $converted['value'];
					}
				} else {
					$computed_styles[ $property ] = $winning_style;
				}
			}
		}

		return $computed_styles;
	}

	public function fetch_css_from_urls( $css_urls, $follow_imports = false ) {
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

	private function fetch_single_css_url( $url ) {
		$timeout = apply_filters( 'elementor_widget_converter_timeout', 30 );
		
		$response = wp_remote_get( $url, [
			'timeout' => $timeout,
			'headers' => [
				'Accept' => 'text/css,*/*;q=0.1',
				'User-Agent' => 'Elementor Widget Converter/1.0',
			],
		] );

		if ( is_wp_error( $response ) ) {
			throw new \Exception( 'Failed to fetch CSS: ' . $response->get_error_message() );
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		if ( $status_code !== 200 ) {
			throw new \Exception( 'HTTP error: ' . $status_code );
		}

		return wp_remote_retrieve_body( $response );
	}

	private function extract_import_urls( $css_content, $base_url ) {
		$import_urls = [];
		
		preg_match_all( '/@import\s+(?:url\()?["\']?([^"\'()]+)["\']?\)?/i', $css_content, $matches );
		
		if ( ! empty( $matches[1] ) ) {
			foreach ( $matches[1] as $import_url ) {
				// Convert relative URLs to absolute
				if ( ! preg_match( '/^https?:\/\//', $import_url ) ) {
					$import_url = $this->resolve_relative_url( $import_url, $base_url );
				}
				$import_urls[] = $import_url;
			}
		}

		return $import_urls;
	}

	private function resolve_relative_url( $relative_url, $base_url ) {
		$base_parts = parse_url( $base_url );
		
		if ( strpos( $relative_url, '/' ) === 0 ) {
			// Absolute path
			return $base_parts['scheme'] . '://' . $base_parts['host'] . $relative_url;
		} else {
			// Relative path
			$base_path = dirname( $base_parts['path'] );
			return $base_parts['scheme'] . '://' . $base_parts['host'] . $base_path . '/' . $relative_url;
		}
	}

	private function initialize_property_conversion_service( $property_conversion_service ): void {
		if ( $this->can_use_provided_service( $property_conversion_service ) ) {
			$this->property_conversion_service = $property_conversion_service;
			return;
		}
		
		$this->property_conversion_service = $this->create_default_conversion_service();
	}

	private function can_use_provided_service( $service ): bool {
		return null !== $service && is_object( $service );
	}

	private function create_default_conversion_service(): ?object {
		if ( ! class_exists( 'Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service' ) ) {
			$this->handle_service_creation_failure();
			return null;
		}
		
		return new Css_Property_Conversion_Service();
	}

	private function handle_service_creation_failure(): void {
		error_log( 'CSS Processor: Failed to create property conversion service - class not available' );
	}

	private function initialize_global_classes_repository(): void {
		$this->global_classes_repository = new Global_Classes_Repository();
	}

	private function parse_css_safely( string $css ) {
		if ( ! $this->css_parser ) {
			return null;
		}
		
		return $this->css_parser->parse( $css );
	}

	private function is_css_parsing_successful( $parsed_css ): bool {
		return null !== $parsed_css;
	}

	private function process_parsed_css( $parsed_css, array &$processing_result ): void {
		$css_rules = $this->extract_css_rules( $parsed_css );
		$processing_result['stats']['rules_processed'] = count( $css_rules );

		foreach ( $css_rules as $rule ) {
			$this->process_css_rule( $rule, $processing_result );
		}

		$this->create_global_classes( $processing_result );
	}

	private function handle_css_parsing_failure( array &$processing_result ): void {
		$processing_result['stats']['warnings'][] = [
			'type' => 'css_parsing_error',
			'message' => 'Failed to parse CSS - invalid syntax or parser unavailable',
		];
	}

	private function convert_css_property_safely( string $property, $value ) {
		if ( ! $this->property_conversion_service ) {
			return null;
		}
		
		return $this->convert_css_property( $property, $value );
	}

	private function log_property_conversion_result( $converted_property ): void {
		
	}

	private function is_property_source( string $css_property, string $atomic_property, array $batch_results ): bool {
		// For margin properties, all individual margin properties map to 'margin' atomic property
		if ( 'margin' === $atomic_property && in_array( $css_property, [
			'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
			'margin-block-start', 'margin-block-end', 'margin-inline-start', 'margin-inline-end',
			'margin-block', 'margin-inline'
		], true ) ) {
			return true;
		}
		
		// For other properties, check if CSS property matches atomic property
		return $css_property === $atomic_property;
	}

	private function expand_css_shorthand_properties( string $css ): string {
		// ✅ CRITICAL FIX: Expand CSS shorthand properties at the text level
		// This processes <style> block CSS before it gets parsed into individual rules
		require_once __DIR__ . '/css-shorthand-expander.php';
		
		error_log( "🔍 CSS-PROCESSOR DEBUG: Expanding shorthand in CSS text" );
		
		// Use regex to find CSS rules and expand shorthand properties within them
		return preg_replace_callback(
			'/([^{}]+)\s*\{([^}]+)\}/',
			function( $matches ) {
				$selector = trim( $matches[1] );
				$declarations = trim( $matches[2] );
				
				// Parse declarations into property-value pairs
				$properties = [];
				$declaration_parts = explode( ';', $declarations );
				
				foreach ( $declaration_parts as $declaration ) {
					$declaration = trim( $declaration );
					if ( empty( $declaration ) ) {
						continue;
					}
					
					$parts = explode( ':', $declaration, 2 );
					if ( count( $parts ) === 2 ) {
						$property = trim( $parts[0] );
						$value = trim( $parts[1] );
						$properties[ $property ] = $value;
					}
				}
				
				// Expand shorthand properties
				$expanded_properties = \Elementor\Modules\CssConverter\Services\Css\Processing\CSS_Shorthand_Expander::expand_shorthand_properties( $properties );
				
				// Rebuild CSS rule
				$expanded_declarations = [];
				foreach ( $expanded_properties as $property => $value ) {
					$expanded_declarations[] = "{$property}: {$value}";
				}
				
				return $selector . ' { ' . implode( '; ', $expanded_declarations ) . '; }';
			},
			$css
		);
	}

	private function is_property_conversion_successful( $converted_property ): bool {
		return null !== $converted_property && ! empty( $converted_property );
	}

	private function store_id_specific_style( array &$processing_result, string $id_name, array $rule, $converted_property ): void {
		if ( ! isset( $processing_result['id_styles'][ $id_name ] ) ) {
			$processing_result['id_styles'][ $id_name ] = [];
		}
		
		$processing_result['id_styles'][ $id_name ][] = [
			'selector' => $rule['selector'],
			'property' => $rule['property'],
			'value' => $rule['value'],
			'converted_property' => $converted_property,
			'specificity' => $rule['specificity'],
			'important' => $rule['important'],
		];
	}

	private function record_successful_id_conversion( array &$processing_result ): void {
		$processing_result['stats']['id_selectors_processed']++;
		$processing_result['stats']['properties_converted']++;
	}

	private function record_failed_id_conversion( array &$processing_result, array $rule ): void {
		$processing_result['stats']['unsupported_properties'][] = [
			'property' => $rule['property'],
			'value' => $rule['value'],
			'selector' => $rule['selector'],
			'reason' => 'No property mapper found',
		];
	}
}
