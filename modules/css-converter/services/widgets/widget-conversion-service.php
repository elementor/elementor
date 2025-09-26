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

		// Step 3: Extract and process CSS
		$create_global_classes = $options['createGlobalClasses'] ?? true;
		$all_css = $this->extract_all_css( $html, $css_urls, $follow_imports, $elements, $create_global_classes );
		$conversion_log['css_size'] = strlen( $all_css );

			// Step 4: Map HTML elements to widgets
			$mapped_widgets = $this->widget_mapper->map_elements( $elements );
			$mapping_stats = $this->widget_mapper->get_mapping_stats( $elements );
			$conversion_log['mapping_stats'] = $mapping_stats;

		// Step 5: Process CSS and create global classes (HVV: threshold = 1)
		$css_processing_result = $this->css_processor->process_css_for_widgets( $all_css, $mapped_widgets );
		$conversion_log['css_processing'] = $css_processing_result['stats'];
		
		// Debug logging for CSS processing result
		error_log( "Widget Conversion Service: CSS processing result keys = " . implode(', ', array_keys($css_processing_result)) );
		if ( isset( $css_processing_result['global_classes'] ) ) {
			error_log( "Widget Conversion Service: global_classes count = " . count($css_processing_result['global_classes']) );
			error_log( "Widget Conversion Service: global_classes = " . wp_json_encode($css_processing_result['global_classes']) );
		} else {
			error_log( "Widget Conversion Service: global_classes key missing from CSS processing result" );
		}

		// Step 6: Apply CSS styles to widgets based on specificity
		$styled_widgets = $this->apply_css_to_widgets( $mapped_widgets, $css_processing_result );
		
		// Step 6.5: Apply inline styles directly to widgets when not using global classes
		$create_global_classes = $options['createGlobalClasses'] ?? true;
		if ( ! $create_global_classes ) {
			$styled_widgets = $this->apply_inline_styles_to_widgets( $styled_widgets, $elements );
		}

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
			error_log( "Widget Conversion Service: Creating CSS rules from inline styles (createGlobalClasses: true)" );
			$inline_css = $this->extract_inline_css_from_elements( $elements );
			if ( ! empty( $inline_css ) ) {
				$all_css .= $inline_css . "\n";
			}
		} elseif ( ! empty( $elements ) && ! $create_global_classes ) {
			error_log( "Widget Conversion Service: Skipping CSS rule creation from inline styles (createGlobalClasses: false)" );
		}

		// Fetch external CSS files using CSS processor
		if ( ! empty( $css_urls ) ) {
			$css_fetch_result = $this->css_processor->fetch_css_from_urls( $css_urls, $follow_imports );
			$all_css .= $css_fetch_result['css'];
		}

		return $all_css;
	}

	private function extract_inline_css_from_elements( &$elements ) {
		$inline_css = '';
		$element_counter = 0;

		foreach ( $elements as &$element ) {
			if ( ! empty( $element['inline_css'] ) ) {
				$element_counter++;
				
				// Create a unique class name for this element
				$class_name = 'inline-element-' . $element_counter;
				
				// Convert inline CSS to CSS rule
				$css_rules = [];
				foreach ( $element['inline_css'] as $property => $style_data ) {
					$value = $style_data['value'];
					$important = $style_data['important'] ? ' !important' : '';
					$css_rules[] = "  {$property}: {$value}{$important};";
				}
				
				if ( ! empty( $css_rules ) ) {
					$inline_css .= ".{$class_name} {\n" . implode( "\n", $css_rules ) . "\n}\n\n";
					
					// Store the class name in the element for later reference
					$element['generated_class'] = $class_name;
					error_log( "Widget Conversion Service: Set generated_class '{$class_name}' on element with tag '{$element['tag']}'" );
				}
			}
			
			// Process child elements recursively
			if ( ! empty( $element['children'] ) ) {
				$child_css = $this->extract_inline_css_from_elements( $element['children'] );
				$inline_css .= $child_css;
			}
		}

		return $inline_css;
	}

	private function apply_css_to_widgets( $widgets, $css_processing_result ) {
		// Apply CSS styles to widgets based on specificity priority
		// HVV requirement: !important > inline > ID > class > element
		
		foreach ( $widgets as &$widget ) {
			$widget['applied_styles'] = $this->css_processor->apply_styles_to_widget( $widget, $css_processing_result );
			
			// Recursively apply styles to nested children
			if ( ! empty( $widget['children'] ) ) {
				$widget['children'] = $this->apply_css_to_widgets( $widget['children'], $css_processing_result );
			}
		}

		return $widgets;
	}

	private function apply_inline_styles_to_widgets( $widgets, $elements ) {
		// Apply inline CSS directly to widgets when createGlobalClasses is false
		// This bypasses the CSS rule matching and applies styles directly
		
		error_log( "Widget Conversion Service: INLINE STYLES METHOD CALLED - widgets count: " . count($widgets) . ", elements count: " . count($elements) );
		error_log( "Widget Conversion Service: Applying inline styles directly to widgets" );
		
		// Apply inline styles recursively through the element/widget hierarchy
		return $this->apply_inline_styles_recursive( $widgets, $elements );
	}

	private function apply_inline_styles_recursive( $widgets, $elements ) {
		// Match widgets to elements by hierarchy position
		error_log( "Widget Conversion Service: apply_inline_styles_recursive called with " . count($widgets) . " widgets and " . count($elements) . " elements" );
		
		foreach ( $widgets as $widget_index => &$widget ) {
			error_log( "Widget Conversion Service: Processing widget {$widget_index}" );
			
			if ( isset( $elements[ $widget_index ] ) ) {
				$element = $elements[ $widget_index ];
				error_log( "Widget Conversion Service: Element {$widget_index} found, inline_css count: " . (isset($element['inline_css']) ? count($element['inline_css']) : 0) );
				
				if ( ! empty( $element['inline_css'] ) ) {
					error_log( "Widget Conversion Service: Applying " . count( $element['inline_css'] ) . " inline styles to widget {$widget_index}" );
					error_log( "Widget Conversion Service: Element inline_css: " . wp_json_encode($element['inline_css']) );
					
					// Convert inline CSS to computed styles format
					$inline_computed_styles = $this->convert_inline_css_to_computed_styles( $element['inline_css'] );
					
					// Add to existing applied_styles or create new
					if ( ! isset( $widget['applied_styles'] ) ) {
						$widget['applied_styles'] = [];
					}
					
					// Merge with existing computed styles (inline styles have high priority)
					$existing_computed = $widget['applied_styles']['computed_styles'] ?? [];
					$widget['applied_styles']['computed_styles'] = array_merge( $existing_computed, $inline_computed_styles );
					
					error_log( "Widget Conversion Service: Widget {$widget_index} now has " . count( $widget['applied_styles']['computed_styles'] ) . " computed styles" );
				}
				
				// Process children recursively
				if ( ! empty( $widget['children'] ) && ! empty( $element['children'] ) ) {
					$widget['children'] = $this->apply_inline_styles_recursive( $widget['children'], $element['children'] );
				}
			}
		}
		
		return $widgets;
	}


	private function convert_inline_css_to_computed_styles( $inline_css ) {
		// Convert inline CSS array to the computed styles format expected by widget creator
		$computed_styles = [];
		
		foreach ( $inline_css as $property => $style_data ) {
			$value = $style_data['value'];
			$important = $style_data['important'];
			
			// Use the property mapper to convert to atomic format
			$converted = $this->property_conversion_service->convert_property_to_v4_atomic( $property, $value );
			
			if ( $converted ) {
				// Widget creator expects computed_styles as associative array: property_name => atomic_value
				$property_name = $converted['property'];
				$atomic_value = $converted['value'];
				
				error_log( "Widget Conversion Service: Converting inline CSS {$property}:{$value} -> {$property_name}:" . wp_json_encode($atomic_value) );
				
				$computed_styles[ $property_name ] = $atomic_value;
				
				// TODO: Handle important flag and source tracking if needed in the future
			}
		}
		
		error_log( "Widget Conversion Service: Final computed_styles: " . wp_json_encode($computed_styles) );
		return $computed_styles;
	}

}
