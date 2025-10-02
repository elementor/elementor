<?php

namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Css\Parsing\Html_Parser;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Mapper;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Processor;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Creator;
use Elementor\Modules\CssConverter\Exceptions\Class_Conversion_Exception;

class Widget_Conversion_Service {
	private $html_parser;
	private $widget_mapper;
	private $property_conversion_service;
	private $css_processor;
	private $widget_creator;

	public function __construct() {
		$this->html_parser = new Html_Parser();
		$this->widget_mapper = new Widget_Mapper();
		$this->property_conversion_service = new Css_Property_Conversion_Service();
		$this->css_processor = new Css_Processor( $this->property_conversion_service );
		$this->widget_creator = new Widget_Creator();
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
		$conversion_log = [
			'start_time' => microtime( true ),
			'input_size' => strlen( $html ),
			'css_urls_count' => count( $css_urls ),
			'warnings' => [],
			'errors' => [],
		];

		try {
			// Step 1: Parse HTML
			$elements = $this->html_parser->parse( $html );
			$conversion_log['parsed_elements'] = count( $elements );

			// Step 2: Validate HTML structure (HVV: max 20 levels depth)
			$validation_issues = $this->html_parser->validate_html_structure( $elements, 20 );
			if ( ! empty( $validation_issues ) ) {
				$conversion_log['warnings'] = array_merge( $conversion_log['warnings'], $validation_issues );
			}

		// Step 3: Extract and process CSS (always using optimized global classes pipeline)
		$all_css = $this->extract_all_css( $html, $css_urls, $follow_imports, $elements, true );
		$conversion_log['css_size'] = strlen( $all_css );

		// Step 4: Map HTML elements to widgets
		error_log( "WIDGET_CONVERTER_DEBUG: Starting widget mapping for " . count( $elements ) . " elements" );
		$mapped_widgets = $this->widget_mapper->map_elements( $elements );
		$mapping_stats = $this->widget_mapper->get_mapping_stats( $elements );
		$conversion_log['mapping_stats'] = $mapping_stats;
		
		// DEBUG: Log mapped widgets structure (can be removed in production)
		// error_log( "WIDGET_CONVERTER_DEBUG: Mapped " . count( $mapped_widgets ) . " widgets" );
		// foreach ( $mapped_widgets as $index => $widget ) {
		//	$widget_type = $widget['widget_type'] ?? 'unknown';
		//	$widget_id = $widget['attributes']['id'] ?? 'no-id';
		//	$generated_class = $widget['generated_class'] ?? 'no-class';
		//	error_log( "WIDGET_CONVERTER_DEBUG: Widget #{$index} - Type: {$widget_type}, ID: {$widget_id}, Generated Class: {$generated_class}" );
		// }

		// Step 5: Process CSS and create global classes (HVV: threshold = 1)
		error_log( "WIDGET_CONVERTER_DEBUG: Processing CSS (" . strlen( $all_css ) . " characters)" );
		error_log( "WIDGET_CONVERTER_DEBUG: CSS content preview:\n" . substr( $all_css, 0, 500 ) . ( strlen( $all_css ) > 500 ? '...' : '' ) );
		
		$css_processing_result = $this->css_processor->process_css_for_widgets( $all_css, $mapped_widgets );
		$conversion_log['css_processing'] = $css_processing_result['stats'];
		
		// Debug logging for CSS processing result
		error_log( "WIDGET_CONVERTER_DEBUG: CSS processing completed" );
		error_log( "WIDGET_CONVERTER_DEBUG: Global classes found: " . count( $css_processing_result['global_classes'] ?? [] ) );
		error_log( "WIDGET_CONVERTER_DEBUG: Widget styles found: " . count( $css_processing_result['widget_styles'] ?? [] ) );
		
		if ( isset( $css_processing_result['global_classes'] ) ) {
			foreach ( $css_processing_result['global_classes'] as $class_name => $class_data ) {
				error_log( "WIDGET_CONVERTER_DEBUG: Global class: {$class_name} with " . count( $class_data['properties'] ?? [] ) . " properties" );
			}
		}

		// Step 6: Apply CSS styles to widgets based on specificity
		error_log( "WIDGET_CONVERTER_DEBUG: Applying CSS styles to widgets" );
		$styled_widgets = $this->apply_css_to_widgets( $mapped_widgets, $css_processing_result );
		
		// Step 6.5: Inline styles are now always processed through the optimized global classes pipeline
		// The createGlobalClasses: false option has been removed for better performance and consistency

			// Step 7: Create Elementor widgets in draft mode (HVV requirement)
			$creation_result = $this->widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );
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
				// error_log( "WIDGET_CONVERTER_DEBUG: Processing inline CSS for element #{$element_counter} - Tag: {$element_tag}, ID: {$element_id}" );
				// error_log( "WIDGET_CONVERTER_DEBUG: Inline CSS properties: " . wp_json_encode( array_keys( $element['inline_css'] ) ) );
				
				// Create a unique class name for this element
				$class_name = 'inline-element-' . $element_counter;
				
				// Convert inline CSS to CSS rule
				$css_rules = [];
				foreach ( $element['inline_css'] as $property => $style_data ) {
					$value = $style_data['value'];
					$important = $style_data['important'] ? ' !important' : '';
					$css_rules[] = "  {$property}: {$value}{$important};";
					
					// DEBUG: Log each property conversion (can be removed in production)
					// error_log( "WIDGET_CONVERTER_DEBUG: Converting property: {$property} = {$value}" . ( $important ? ' !important' : '' ) );
				}
				
				if ( ! empty( $css_rules ) ) {
					$css_rule_block = ".{$class_name} {\n" . implode( "\n", $css_rules ) . "\n}\n\n";
					$inline_css .= $css_rule_block;
					
					// DEBUG: Log generated CSS rule (can be removed in production)
					// error_log( "WIDGET_CONVERTER_DEBUG: Generated CSS rule for {$class_name}:\n{$css_rule_block}" );
					
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
			
			error_log( "WIDGET_CONVERTER_DEBUG: Applying styles to widget #{$index} - Type: {$widget_type}, ID: {$widget_id}, Generated Class: {$generated_class}" );
			
			$widget['applied_styles'] = $this->css_processor->apply_styles_to_widget( $widget, $css_processing_result );
			
			// DEBUG: Log applied styles summary
			$applied = $widget['applied_styles'];
			$computed_count = count( $applied['computed_styles'] ?? [] );
			$global_classes_count = count( $applied['global_classes'] ?? [] );
			error_log( "WIDGET_CONVERTER_DEBUG: Widget #{$index} received {$computed_count} computed styles and {$global_classes_count} global classes" );
			
			if ( ! empty( $applied['computed_styles'] ) ) {
				error_log( "WIDGET_CONVERTER_DEBUG: Widget #{$index} computed styles: " . wp_json_encode( array_keys( $applied['computed_styles'] ) ) );
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

}
