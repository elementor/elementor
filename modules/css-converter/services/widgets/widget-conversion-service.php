<?php

namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Css\Parsing\Html_Parser;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Mapper;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Processor;
use Elementor\Modules\CssConverter\Services\Css\Processing\Unified_Css_Processor;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Specificity_Calculator;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creator;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;

class Widget_Conversion_Service {
	private $html_parser;
	private $widget_mapper;
	private $property_conversion_service;
	private $unified_css_processor;
	private $widget_creator;
	private $use_zero_defaults;

	public function __construct( $use_zero_defaults = false ) {
		$this->use_zero_defaults = $use_zero_defaults;
		$this->html_parser = new Html_Parser();
		$this->widget_mapper = new Widget_Mapper();
		$this->property_conversion_service = new Css_Property_Conversion_Service();
		
		// Initialize unified CSS processor with required dependencies
		$css_parser = new \Elementor\Modules\CssConverter\Parsers\CssParser();
		$specificity_calculator = new Css_Specificity_Calculator();
		$this->unified_css_processor = new Unified_Css_Processor(
			$css_parser,
			$this->property_conversion_service,
			$specificity_calculator
		);
		
		$this->widget_creator = new Widget_Creator( $use_zero_defaults );
		
		// Add global CSS override for base styles when zero defaults are enabled
		if ( $use_zero_defaults ) {
			$this->enable_css_converter_base_styles_override();
		}
	}

	public function convert_from_url( $url, $css_urls = [], $follow_imports = false, $options = [] ) {
		// Fetch HTML from URL with timeout (HVV: 30s default)
		$timeout = apply_filters( 'elementor_widget_converter_timeout', 30 );
		
		$response = wp_remote_get( $url, [
			'timeout' => $timeout,
			'user-agent' => 'Elementor Widget Converter/1.0',
		] );

		if ( is_wp_error( $response ) ) {
			throw new Class_Conversion_Exception( 
				'Failed to fetch URL: ' . $response->get_error_message(),
				[ 'url' => $url ]
			);
		}

		$status_code = wp_remote_retrieve_response_code( $response );
		if ( $status_code !== 200 ) {
			throw new Class_Conversion_Exception( 
				'HTTP error: ' . $status_code,
				[ 'url' => $url, 'status_code' => $status_code ]
			);
		}

		$html = wp_remote_retrieve_body( $response );
		
		// Extract CSS URLs from HTML if not provided
		if ( empty( $css_urls ) ) {
			$css_urls = $this->html_parser->extract_linked_css( $html );
		}

		return $this->convert_from_html( $html, $css_urls, $follow_imports, $options );
	}

	public function convert_from_css( $css, $css_urls = [], $follow_imports = false, $options = [] ) {
		// For CSS-only conversion, we create a minimal HTML structure
		// This allows us to process CSS rules and create global classes
		
		$conversion_log = [
			'start_time' => microtime( true ),
			'input_size' => strlen( $css ),
			'css_urls_count' => count( $css_urls ),
			'warnings' => [],
			'errors' => [],
		];

		try {
			// Fetch additional CSS from URLs if provided
			$all_css = $css;
			if ( ! empty( $css_urls ) ) {
				$css_fetch_result = $this->css_processor->fetch_css_from_urls( $css_urls, $follow_imports );
				$all_css .= "\n" . $css_fetch_result['css'];
			}
			
			$conversion_log['css_size'] = strlen( $all_css );

			// Process CSS and create global classes (HVV: threshold = 1)
			$css_processing_result = $this->css_processor->process_css_for_widgets( $all_css, [] );
			$conversion_log['css_processing'] = $css_processing_result['stats'];

			$conversion_log['end_time'] = microtime( true );
			$conversion_log['total_time'] = $conversion_log['end_time'] - $conversion_log['start_time'];

			return [
				'success' => true,
				'widgets_created' => [], // No widgets created for CSS-only conversion
				'global_classes_created' => $css_processing_result['global_classes'],
				'css_rules_processed' => count( $css_processing_result['widget_styles'] ?? [] ) + count( $css_processing_result['element_styles'] ?? [] ),
				'conversion_log' => $conversion_log,
				'warnings' => $conversion_log['warnings'],
			];

		} catch ( \Exception $e ) {
			$conversion_log['errors'][] = [
				'message' => $e->getMessage(),
				'trace' => $e->getTraceAsString(),
			];

			throw new Class_Conversion_Exception( 
				'CSS conversion failed: ' . $e->getMessage(),
				$conversion_log
			);
		}
	}

	public function convert_from_html( $html, $css_urls = [], $follow_imports = false, $options = [] ) {
		// CSS converter always uses converted widgets with zero defaults
		$this->use_zero_defaults = true;
		$this->widget_creator = new Widget_Creator( $this->use_zero_defaults );
		
		$conversion_log = [
			'start_time' => microtime( true ),
			'input_size' => strlen( $html ),
			'css_urls_count' => count( $css_urls ),
			'options' => $options,
			'warnings' => [],
			'errors' => [],
		];

		try {
		// Step 1: Parse HTML
		$elements = $this->html_parser->parse( $html );
		$conversion_log['parsed_elements'] = count( $elements );
		
		// DEBUG: Log parsed element structure
		foreach ( $elements as $index => $element ) {
			$tag = $element['tag'] ?? 'unknown';
			$has_inline_css = ! empty( $element['inline_css'] );
			$children_count = count( $element['children'] ?? [] );
			$class_attr = $element['attributes']['class'] ?? '';
			
			// Log children structure if any
			if ( $children_count > 0 ) {
				foreach ( $element['children'] as $child_index => $child ) {
					$child_tag = $child['tag'] ?? 'unknown';
					$child_has_inline_css = ! empty( $child['inline_css'] );
					$child_class_attr = $child['attributes']['class'] ?? '';
				}
			}
		}

			// Step 2: Validate HTML structure (HVV: max 20 levels depth)
			$validation_issues = $this->html_parser->validate_html_structure( $elements, 20 );
			if ( ! empty( $validation_issues ) ) {
				$conversion_log['warnings'] = array_merge( $conversion_log['warnings'], $validation_issues );
			}

		// Step 3: Extract CSS only (NO inline style conversion - unified approach handles this)
		$all_css = $this->extract_css_only( $html, $css_urls, $follow_imports );
		$conversion_log['css_size'] = strlen( $all_css );

		// Step 4: Map HTML elements to widgets
		$mapped_widgets = $this->widget_mapper->map_elements( $elements );
		$mapping_stats = $this->widget_mapper->get_mapping_stats( $elements );
		$conversion_log['mapping_stats'] = $mapping_stats;
		
		// DEBUG: Log mapped widgets structure (can be removed in production)
		// foreach ( $mapped_widgets as $index => $widget ) {
		//	$widget_type = $widget['widget_type'] ?? 'unknown';
		//	$widget_id = $widget['attributes']['id'] ?? 'no-id';
		//	$generated_class = $widget['generated_class'] ?? 'no-class';
		// }

		// Step 5: UNIFIED CSS Processing - eliminates competition between pipelines
		
		$unified_processing_result = $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets );
		$resolved_widgets = $unified_processing_result['widgets'];
		$conversion_log['css_processing'] = $unified_processing_result['stats'];
		
		// Debug logging for unified processing result
		
		// Step 6: Widgets now have resolved styles - no separate CSS application needed
		$styled_widgets = $resolved_widgets;
		
		// Step 6.5: Inline styles are now always processed through the optimized global classes pipeline
		// The createGlobalClasses: false option has been removed for better performance and consistency

			// Step 7: Create Elementor widgets with resolved styles (unified approach)
			$creation_result = $this->create_widgets_with_resolved_styles( $styled_widgets, $options );
			$conversion_log['widget_creation'] = $creation_result['stats'];

			$conversion_log['end_time'] = microtime( true );
			$conversion_log['total_time'] = $conversion_log['end_time'] - $conversion_log['start_time'];

			return [
				'success' => true,
				'widgets_created' => $creation_result['widgets_created'],
				'global_classes_created' => $creation_result['global_classes_created'],
				'variables_created' => $creation_result['variables_created'],
				'post_id' => $creation_result['post_id'],
				'edit_url' => $creation_result['edit_url'],
				'conversion_log' => $conversion_log,
				'warnings' => $conversion_log['warnings'],
				'errors' => $creation_result['errors'],
			];

		} catch ( \Exception $e ) {
			$conversion_log['errors'][] = [
				'message' => $e->getMessage(),
				'trace' => $e->getTraceAsString(),
			];

			throw new Class_Conversion_Exception( 
				'Widget conversion failed: ' . $e->getMessage() . '. Log: ' . wp_json_encode( $conversion_log ),
				0
			);
		}
	}

	private function extract_all_css( $html, $css_urls, $follow_imports, &$elements = [], $create_global_classes = true ) {
		$all_css = '';

		// Extract inline CSS from <style> tags using regex to avoid DOM parsing issues
		preg_match_all( '/<style[^>]*>(.*?)<\/style>/is', $html, $matches );
		foreach ( $matches[1] as $css_content ) {
			$all_css .= trim( $css_content ) . "\n";
		}

		// Extract inline CSS from style attributes of parsed HTML elements
		// Only create CSS rules if we're creating global classes
		if ( ! empty( $elements ) && $create_global_classes ) {
			$inline_css = $this->extract_inline_css_from_elements( $elements );
			if ( ! empty( $inline_css ) ) {
				$all_css .= $inline_css . "\n";
			}
		} elseif ( ! empty( $elements ) && ! $create_global_classes ) {
		}

		// Fetch external CSS files using CSS processor
		if ( ! empty( $css_urls ) ) {
			$css_fetch_result = $this->css_processor->fetch_css_from_urls( $css_urls, $follow_imports );
			$all_css .= $css_fetch_result['css'];
		}

		return $all_css;
	}

	private function extract_inline_css_from_elements( &$elements, &$element_counter = null ) {
		$inline_css = '';
		
		// Initialize counter if not passed from parent call
		if ( null === $element_counter ) {
			$element_counter = 0;
		}

		foreach ( $elements as &$element ) {
			if ( ! empty( $element['inline_css'] ) ) {
				
				$element_counter++;
				
				// DEBUG: Log element details (can be removed in production)
				$element_tag = $element['tag'] ?? 'unknown';
				$element_id = $element['attributes']['id'] ?? 'no-id';
				
				// Create a unique class name for this element
				$class_name = 'inline-element-' . $element_counter;
				
				// Convert inline CSS to CSS rule
				$css_rules = [];
				foreach ( $element['inline_css'] as $property => $style_data ) {
					$value = $style_data['value'];
					$important = $style_data['important'] ? ' !important' : '';
					$css_rules[] = "  {$property}: {$value}{$important};";
					
					// DEBUG: Log each property conversion (can be removed in production)
				}
				
				if ( ! empty( $css_rules ) ) {
					$css_rule_block = ".{$class_name} {\n" . implode( "\n", $css_rules ) . "\n}\n\n";
					$inline_css .= $css_rule_block;
					
					// DEBUG: Log generated CSS rule (can be removed in production)
					
					// Store the class name in the element for later reference
					$element['generated_class'] = $class_name;
				}
			} else {
			}
			
			// Process child elements recursively, passing the counter by reference
			if ( ! empty( $element['children'] ) ) {
				$child_css = $this->extract_inline_css_from_elements( $element['children'], $element_counter );
				$inline_css .= $child_css;
			}
		}

		return $inline_css;
	}

	private function apply_css_to_widgets( $widgets, $css_processing_result ) {
		// Apply CSS styles to widgets based on specificity priority
		// HVV requirement: !important > inline > ID > class > element
		
		foreach ( $widgets as $index => &$widget ) {
			$widget_type = $widget['widget_type'] ?? 'unknown';
			$widget_id = $widget['attributes']['id'] ?? 'no-id';
			$generated_class = $widget['generated_class'] ?? 'no-class';
			
			
			$widget['applied_styles'] = $this->css_processor->apply_styles_to_widget( $widget, $css_processing_result );
			
			// DEBUG: Log applied styles summary
			$applied = $widget['applied_styles'];
			$computed_count = count( $applied['computed_styles'] ?? [] );
			$global_classes_count = count( $applied['global_classes'] ?? [] );
			
			if ( ! empty( $applied['computed_styles'] ) ) {
			}
			
			// Recursively apply styles to nested children
			if ( ! empty( $widget['children'] ) ) {
				$widget['children'] = $this->apply_css_to_widgets( $widget['children'], $css_processing_result );
			}
		}

		return $widgets;
	}

	// REMOVED: apply_inline_styles_to_widgets and apply_inline_styles_recursive methods
	// These methods are no longer needed since createGlobalClasses: false option was removed
	// All styling now goes through the optimized global classes pipeline


	private function convert_inline_css_to_computed_styles( $inline_css ) {
		// Convert inline CSS array to the computed styles format expected by widget creator
		$computed_styles = [];
		
		// ✅ DEBUG: Log grouped properties
		$grouped_properties = $this->group_margin_properties( $inline_css );
		
		// ✅ BRILLIANT SUGGESTION: Pre-group margin properties before conversion
		// This way we send all margin properties together instead of individually
		foreach ( $grouped_properties as $property_group => $properties ) {
			if ( 'margin' === $property_group ) {
				// Handle grouped margin properties - convert them all together
				$margin_result = $this->convert_grouped_margin_properties( $properties );
				if ( $margin_result ) {
					$computed_styles['margin'] = $margin_result;
				}
			} else {
				// Handle individual non-margin properties as before
				foreach ( $properties as $property => $style_data ) {
					$value = $style_data['value'];
					$important = $style_data['important'];
					
					$conversion_result = $this->property_conversion_service->convert_property_to_v4_atomic_with_name( $property, $value );
					
					if ( $conversion_result ) {
						$property_name = $conversion_result['property_name'];
						$atomic_value = $conversion_result['converted_value'];
						$computed_styles[ $property_name ] = $atomic_value;
					}
				}
			}
		}
		
		return $computed_styles;
	}

	/**
	 * Group margin properties together for combined conversion
	 */
	private function group_margin_properties( $inline_css ): array {
		$margin_properties = [
			'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
			'margin-block', 'margin-block-start', 'margin-block-end',
			'margin-inline', 'margin-inline-start', 'margin-inline-end'
		];
		
		$grouped = [
			'margin' => [],
			'other' => []
		];
		
		foreach ( $inline_css as $property => $style_data ) {
			if ( in_array( $property, $margin_properties, true ) ) {
				$grouped['margin'][ $property ] = $style_data;
			} else {
				$grouped['other'][ $property ] = $style_data;
			}
		}
		
		return $grouped;
	}

	/**
	 * Convert grouped margin properties as a single combined operation
	 */
	private function convert_grouped_margin_properties( $margin_properties ): ?array {
		if ( empty( $margin_properties ) ) {
			return null;
		}
		$margin_mapper = new \Elementor\Modules\CssConverter\Convertors\CssProperties\Properties\Margin_Property_Mapper();
		$combined_dimensions = [];
		foreach ( $margin_properties as $property => $style_data ) {
			$value = $style_data['value'];
			$logical_direction = $this->map_margin_property_to_logical_direction( $property );
			if ( $logical_direction ) {
				$size_data = $this->parse_margin_size_value( $value );
				if ( $size_data ) {
					$combined_dimensions[ $logical_direction ] = $size_data;
				}
			}
		}
		if ( empty( $combined_dimensions ) ) {
			return null;
		}
		return $this->create_combined_dimensions_structure( $combined_dimensions );
	}

	/**
	 * Map margin property to logical direction
	 */
	private function map_margin_property_to_logical_direction( string $property ): ?string {
		$mapping = [
			'margin-top' => 'block-start',
			'margin-right' => 'inline-end',
			'margin-bottom' => 'block-end',
			'margin-left' => 'inline-start',
			'margin-block-start' => 'block-start',
			'margin-block-end' => 'block-end',
			'margin-inline-start' => 'inline-start',
			'margin-inline-end' => 'inline-end',
		];
		
		return $mapping[ $property ] ?? null;
	}

	/**
	 * Parse margin size value (simplified version of margin mapper logic)
	 */
	private function parse_margin_size_value( string $value ): ?array {
		$value = trim( $value );
		
		if ( empty( $value ) ) {
			return [ 'size' => 0.0, 'unit' => 'px' ];
		}
		
		// Handle CSS keywords
		$keywords = ['auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer'];
		if ( in_array( strtolower( $value ), $keywords, true ) ) {
			return [ 'size' => $value, 'unit' => 'custom' ];
		}
		
		// Parse numeric value with unit
		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = $matches[2] ?? 'px';
			return [ 'size' => $size, 'unit' => strtolower( $unit ) ];
		}
		
		if ( '0' === $value ) {
			return [ 'size' => 0.0, 'unit' => 'px' ];
		}
		
		// Fallback for invalid values
		return [ 'size' => 0.0, 'unit' => 'px' ];
	}

	/**
	 * Create combined Dimensions_Prop_Type structure
	 */
	private function create_combined_dimensions_structure( array $dimensions ): array {
		$result = [];
		foreach ( $dimensions as $logical_property => $size_data ) {
			if ( null !== $size_data ) {
				$result[ $logical_property ] = [
					'$$type' => 'size',
					'value' => $size_data
				];
			}
		}
		return [
			'$$type' => 'dimensions',
			'value' => $result
		];
	}

	private function extract_css_only( string $html, array $css_urls, bool $follow_imports ): string {
		$all_css = '';

		// Extract CSS from <style> tags only (NO inline style conversion)
		preg_match_all( '/<style[^>]*>(.*?)<\/style>/is', $html, $matches );
		foreach ( $matches[1] as $css_content ) {
			$all_css .= trim( $css_content ) . "\n";
		}

		// Extract CSS from external files
		if ( ! empty( $css_urls ) ) {
			// Use existing CSS fetching logic
			foreach ( $css_urls as $url ) {
				try {
					$css_content = file_get_contents( $url );
					if ( $css_content !== false ) {
						$all_css .= $css_content . "\n";
					}
				} catch ( \Exception $e ) {
				}
			}
		}


		return $all_css;
	}

	private function prepare_widgets_recursively( array $widgets ): array {
		$prepared_widgets = [];
		
		foreach ( $widgets as $widget ) {
			$resolved_styles = $widget['resolved_styles'] ?? [];
			
			// Convert resolved styles to applied format
			$applied_styles = $this->convert_resolved_styles_to_applied_format( $resolved_styles );
			
			// Add applied styles to widget (Widget Creator expects them under 'applied_styles' key)
			$prepared_widget = $widget;
			$prepared_widget['applied_styles'] = $applied_styles;
			
			// Recursively prepare child widgets
			if ( ! empty( $widget['children'] ) ) {
				$prepared_widget['children'] = $this->prepare_widgets_recursively( $widget['children'] );
			}
			
			$prepared_widgets[] = $prepared_widget;
			
		}
		
		return $prepared_widgets;
	}

	private function create_widgets_with_resolved_styles( array $widgets_with_resolved_styles, array $options ): array {
		// Convert widgets with resolved styles to the format expected by existing widget creator
		$styled_widgets = $this->prepare_widgets_recursively( $widgets_with_resolved_styles );
		
		// Create a fake CSS processing result for the existing widget creator
		$css_processing_result = [
			'global_classes' => [],
			'widget_styles' => [],
			'element_styles' => [],
			'id_styles' => [],
			'direct_widget_styles' => [],
			'stats' => [
				'rules_processed' => 0,
				'properties_converted' => 0,
				'global_classes_created' => 0,
			],
		];
		
		// Use the existing widget creator
		return $this->widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );
	}

	private function convert_resolved_styles_to_applied_format( array $resolved_styles ): array {
		// Convert the resolved styles back to the format expected by the existing widget creator
		$computed_styles = [];
		
		foreach ( $resolved_styles as $property => $winning_style ) {
			// Use the converted atomic format directly if available, otherwise fall back to raw value
			$atomic_value = $winning_style['converted_property'] ?? $winning_style['value'];
			
			
			// 🚨 CRITICAL FIX: Extract atomic structure and use correct property name
			if ( is_array( $atomic_value ) ) {
				// Check if atomic_value is wrapped (e.g., {"margin": {"$$type": "dimensions", ...}})
				foreach ( $atomic_value as $wrapped_property => $wrapped_value ) {
					if ( is_array( $wrapped_value ) && isset( $wrapped_value['$$type'] ) ) {
						// Use the wrapped property name (e.g., "margin") instead of original (e.g., "margin-left")
						$computed_styles[ $wrapped_property ] = $wrapped_value;
						break; // Only process the first wrapped property
					}
				}
			} else {
				// Non-wrapped atomic value, use as-is
				$computed_styles[ $property ] = $atomic_value;
			}
		}

		return [
			'computed_styles' => $computed_styles,
			'global_classes' => [], // No global classes in unified approach
			'element_styles' => [],
			'widget_styles' => [],
			'id_styles' => [],
			'direct_element_styles' => [],
		];
	}

	private function enable_css_converter_base_styles_override() {
		// Set a global flag that CSS converter is active with zero defaults
		update_option( 'elementor_css_converter_zero_defaults_active', true );
		
		// Invalidate atomic widget base styles cache to force regeneration
		$this->invalidate_atomic_base_styles_cache();
	}

	private function invalidate_atomic_base_styles_cache() {
		// Use the same cache invalidation mechanism as Elementor core
		$cache_validity = new \Elementor\Modules\AtomicWidgets\Cache_Validity();
		$cache_validity->invalidate( [ 'base' ] );
		
		// Also trigger the core cache clear action to ensure all caches are cleared
		do_action( 'elementor/core/files/clear_cache' );
	}

	public function inject_global_base_styles_override() {
		
		// Get current post ID
		$post_id = get_the_ID();
		if ( ! $post_id ) {
			return;
		}
		
		
		// Check if this page has CSS converter widgets
		if ( ! $this->page_has_css_converter_widgets( $post_id ) ) {
			return;
		}
		
		
		// Inject CSS to override atomic widget base styles
		echo '<style id="css-converter-global-base-styles-override">';
		echo '/* CSS Converter: Override atomic widget base styles globally */';
		echo '.elementor .e-paragraph { margin: revert !important; }';
		echo '.elementor .e-heading { margin: revert !important; }';
		echo '</style>';
		
	}

	private function page_has_css_converter_widgets( int $post_id ): bool {
		$document = \Elementor\Plugin::$instance->documents->get( $post_id );
		if ( ! $document ) {
			return false;
		}
		
		$elements_data = $document->get_elements_data();
		return $this->traverse_elements_for_css_converter_widgets( $elements_data );
	}

	private function traverse_elements_for_css_converter_widgets( array $elements_data ): bool {
		foreach ( $elements_data as $element_data ) {
			// Check if this element has CSS converter flag
			if ( isset( $element_data['editor_settings']['css_converter_widget'] ) && $element_data['editor_settings']['css_converter_widget'] ) {
				return true;
			}
			
			// Recursively check child elements
			if ( isset( $element_data['elements'] ) && is_array( $element_data['elements'] ) ) {
				if ( $this->traverse_elements_for_css_converter_widgets( $element_data['elements'] ) ) {
					return true;
				}
			}
		}
		
		return false;
	}

}
