<?php

namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Css\Parsing\Html_Parser;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Mapper;
use Elementor\Modules\CssConverter\Services\Css\Processing\Css_Property_Conversion_Service;
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
	}

	public function convert_from_url( $url, $css_urls = [], $follow_imports = false, $options = [] ) {
		error_log( "🔥 MAX DEBUG: convert_from_url called with URL: {$url}" );
		
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
		
		
		// Debug logging removed for performance

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
		//	;
		// }

		// Step 5: UNIFIED CSS Processing - eliminates competition between pipelines
		error_log( "🔥 MAX DEBUG: About to call unified CSS processor with " . strlen($all_css) . " chars CSS and " . count($mapped_widgets) . " widgets" );
		
		$unified_processing_result = $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets );
		
		error_log( "🔥 MAX DEBUG: Unified CSS processor returned: " . wp_json_encode(array_keys($unified_processing_result)) );
		$resolved_widgets = $unified_processing_result['widgets'];
		$conversion_log['css_processing'] = $unified_processing_result['stats'];
		
		// Debug logging for unified processing result
		// Step 6: Widgets now have resolved styles - no separate CSS application needed
		$styled_widgets = $resolved_widgets;
		
		// Store the resolved widgets for global class generation
		$widgets_with_resolved_styles_for_global_classes = $resolved_widgets;
		
		// Step 6.5: Inline styles are now always processed through the optimized global classes pipeline
		// The createGlobalClasses: false option has been removed for better performance and consistency

			// Step 7: Create Elementor widgets with resolved styles (unified approach)
			$creation_result = $this->create_widgets_with_resolved_styles( $widgets_with_resolved_styles_for_global_classes, $options );
			$conversion_log['widget_creation'] = $creation_result['stats'];
			// Fix count() error - ensure widgets_created is an array
			$widgets_created = $creation_result['widgets_created'] ?? [];
			
			$widgets_count = is_array( $widgets_created ) ? count( $widgets_created ) : (int) $widgets_created;

			$conversion_log['end_time'] = microtime( true );
			$conversion_log['total_time'] = $conversion_log['end_time'] - $conversion_log['start_time'];

			$final_result = [
				'success' => true,
				'widgets_created' => $creation_result['widgets_created'],
				'global_classes_created' => $creation_result['global_classes_created'],
				'variables_created' => $creation_result['variables_created'],
				'post_id' => $creation_result['post_id'],
				'edit_url' => $creation_result['edit_url'],
				'conversion_log' => $conversion_log,
				'warnings' => $conversion_log['warnings'],
				'errors' => $creation_result['errors'] ?? [],
			];
			
			return $final_result;

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

		// Fetch external CSS files using unified processor
		if ( ! empty( $css_urls ) ) {
			$css_fetch_result = $this->unified_css_processor->fetch_css_from_urls( $css_urls, $follow_imports );
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


	// REMOVED: apply_inline_styles_to_widgets and apply_inline_styles_recursive methods
	// These methods are no longer needed since createGlobalClasses: false option was removed
	// All styling now goes through the optimized global classes pipeline


	private function convert_inline_css_to_computed_styles( $inline_css ) {
		$computed_styles = [];
		
		foreach ( $inline_css as $property => $style_data ) {
			$value = $style_data['value'];
			$important = $style_data['important'];
			
			$conversion_result = $this->property_conversion_service->convert_property_to_v4_atomic_with_name( $property, $value );
			
			if ( $conversion_result ) {
				$property_name = $conversion_result['property_name'];
				$atomic_value = $conversion_result['converted_value'];
				$computed_styles[ $property_name ] = $atomic_value;
			}
		}
		
		return $computed_styles;
	}

	private function group_dimensions_properties( $inline_css ): array {
		$margin_properties = [
			'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
			'margin-block', 'margin-block-start', 'margin-block-end',
			'margin-inline', 'margin-inline-start', 'margin-inline-end'
		];
		
		$padding_properties = [
			'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
			'padding-block', 'padding-block-start', 'padding-block-end',
			'padding-inline', 'padding-inline-start', 'padding-inline-end'
		];
		
		$grouped = [
			'margin' => [],
			'padding' => [],
			'other' => []
		];
		
		foreach ( $inline_css as $property => $style_data ) {
			if ( in_array( $property, $margin_properties, true ) ) {
				$grouped['margin'][ $property ] = $style_data;
			} elseif ( in_array( $property, $padding_properties, true ) ) {
				$grouped['padding'][ $property ] = $style_data;
			} else {
				$grouped['other'][ $property ] = $style_data;
			}
		}
		
		return $grouped;
	}

	private function convert_grouped_dimensions_properties( $properties, string $property_type ): ?array {
		if ( empty( $properties ) ) {
			return null;
		}
		
		$combined_dimensions = [];
		
		foreach ( $properties as $property => $style_data ) {
			$value = $style_data['value'];
			$logical_direction = $this->map_dimensions_property_to_logical_direction( $property );
			
			if ( $logical_direction ) {
				$size_data = $this->parse_dimensions_size_value( $value );
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

	private function map_dimensions_property_to_logical_direction( string $property ): ?string {
		$mapping = [
			'margin-top' => 'block-start',
			'margin-right' => 'inline-end',
			'margin-bottom' => 'block-end',
			'margin-left' => 'inline-start',
			'margin-block-start' => 'block-start',
			'margin-block-end' => 'block-end',
			'margin-inline-start' => 'inline-start',
			'margin-inline-end' => 'inline-end',
			'padding-top' => 'block-start',
			'padding-right' => 'inline-end',
			'padding-bottom' => 'block-end',
			'padding-left' => 'inline-start',
			'padding-block-start' => 'block-start',
			'padding-block-end' => 'block-end',
			'padding-inline-start' => 'inline-start',
			'padding-inline-end' => 'inline-end',
		];
		
		return $mapping[ $property ] ?? null;
	}

	private function parse_dimensions_size_value( string $value ): ?array {
		$value = trim( $value );
		
		if ( empty( $value ) ) {
			return [ 'size' => 0.0, 'unit' => 'px' ];
		}
		
		$keywords = ['auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer'];
		if ( in_array( strtolower( $value ), $keywords, true ) ) {
			return [ 'size' => $value, 'unit' => 'custom' ];
		}
		
		if ( preg_match( '/^(-?\d*\.?\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i', $value, $matches ) ) {
			$size = (float) $matches[1];
			$unit = $matches[2] ?? 'px';
			return [ 'size' => $size, 'unit' => strtolower( $unit ) ];
		}
		
		if ( '0' === $value ) {
			return [ 'size' => 0.0, 'unit' => 'px' ];
		}
		
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
			foreach ( $css_urls as $url ) {
				try {
					// Convert relative URLs to full HTTP URLs
					$full_url = $this->resolve_css_url( $url );
					
					$response = wp_remote_get( $full_url, [
						'timeout' => 30,
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

					$css_content = wp_remote_retrieve_body( $response );
					if ( $css_content ) {
						$all_css .= "/* CSS from: {$full_url} */\n" . $css_content . "\n\n";
					}
				} catch ( \Exception $e ) {
					// Error handling without logging for performance
				}
			}
		}

		// Debug logging removed for performance

		return $all_css;
	}

	private function resolve_css_url( string $url ): string {
		// If already a full URL, return as is
		if ( strpos( $url, 'http' ) === 0 ) {
			return $url;
		}

		// Convert relative URL to full HTTP URL
		$base_url = home_url();
		
		// Remove leading slash if present to avoid double slashes
		$url = ltrim( $url, '/' );
		
		return trailingslashit( $base_url ) . $url;
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
		
		// Generate global classes from CSS selector styles
		$global_classes = $this->generate_global_classes_from_resolved_styles( $widgets_with_resolved_styles );
		
		// Create CSS processing result with generated global classes
		$css_processing_result = [
			'global_classes' => $global_classes,
			'widget_styles' => [],
			'element_styles' => [],
			'id_styles' => [],
			'direct_widget_styles' => [],
			'stats' => [
				'rules_processed' => count( $global_classes ),
				'properties_converted' => $this->count_properties_in_global_classes( $global_classes ),
				'global_classes_created' => count( $global_classes ),
			],
		];
		
		
		// Use the existing widget creator
		return $this->widget_creator->create_widgets( $styled_widgets, $css_processing_result, $options );
	}

	private function convert_resolved_styles_to_applied_format( array $resolved_styles ): array {
		$computed_styles = [];
		
		foreach ( $resolved_styles as $property => $winning_style ) {
			$atomic_value = $winning_style['converted_property'] ?? $winning_style['value'];
			
			if ( is_array( $atomic_value ) && isset( $atomic_value['$$type'] ) ) {
				$computed_styles[ $property ] = $atomic_value;
				
			} elseif ( is_array( $atomic_value ) ) {
				foreach ( $atomic_value as $wrapped_property => $wrapped_value ) {
					if ( is_array( $wrapped_value ) && isset( $wrapped_value['$$type'] ) ) {
						$computed_styles[ $wrapped_property ] = $wrapped_value;
						break;
					}
				}
			} else {
				$computed_styles[ $property ] = $atomic_value;
			}
		}

		return [
			'computed_styles' => $computed_styles,
			'global_classes' => [],
			'element_styles' => [],
			'widget_styles' => [],
			'id_styles' => [],
			'direct_element_styles' => [],
		];
	}
	
	private function generate_global_classes_from_resolved_styles( array $widgets_with_resolved_styles ): array {
		$global_classes = [];
		$css_selector_styles = [];
		
		// Collect all CSS selector styles from all widgets
		foreach ( $widgets_with_resolved_styles as $widget_index => $widget ) {
			$resolved_styles = $widget['resolved_styles'] ?? [];
			
			foreach ( $resolved_styles as $property => $winning_style ) {
				$source = $winning_style['source'] ?? 'no-source';
				
				// Only create global classes for CSS selector styles (not inline styles)
				if ( isset( $winning_style['source'] ) && $winning_style['source'] === 'css-selector' ) {
					$selector = $winning_style['selector'] ?? 'unknown-selector';
					
					if ( ! isset( $css_selector_styles[ $selector ] ) ) {
						$css_selector_styles[ $selector ] = [];
					}
					
					// Store the complete winning style data for proper conversion
					$css_selector_styles[ $selector ][ $property ] = $winning_style;
				}
			}
		}
		
		// Convert CSS selector styles to global classes in the format expected by Widget Creator
		foreach ( $css_selector_styles as $selector => $properties ) {
			// Generate class name from selector (e.g., ".text-bold" -> "text-bold")
			$class_name = ltrim( $selector, '.' );
			
			// Convert to the format expected by Widget Creator (see lines 761-781 in widget-creator.php)
			$formatted_properties = [];
			foreach ( $properties as $property => $winning_style ) {
				$atomic_value = $winning_style['converted_property'] ?? $winning_style['value'];
				
				$formatted_properties[] = [
					'converted_property' => $atomic_value,
					'mapped_property' => $property,
					'original_property' => $property,
					'selector' => $selector,
					'source' => 'css-selector'
				];
			}
			
			$global_classes[ $class_name ] = [
				'properties' => $formatted_properties,
				'selector' => $selector,
			];
			
		}
		
		return $global_classes;
	}
	
	private function count_properties_in_global_classes( array $global_classes ): int {
		$total_properties = 0;
		
		foreach ( $global_classes as $class_data ) {
			$total_properties += count( $class_data['properties'] ?? [] );
		}
		
		return $total_properties;
	}

}
