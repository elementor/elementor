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
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;

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
		
		
		$this->initialize_unified_css_processor_with_required_dependencies();
		
		$this->widget_creator = new Widget_Creator( $use_zero_defaults );
	}

	public function convert_from_url( $url, $css_urls = [], $follow_imports = false, $options = [] ) {
		
		$timeout = $this->get_html_fetch_timeout_with_filter_support();
		
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
		
		if ( empty( $css_urls ) ) {
			$css_urls = $this->extract_css_urls_from_html_if_not_provided( $html );
		}

		return $this->convert_from_html( $html, $css_urls, $follow_imports, $options );
	}


	public function convert_from_html( $html, $css_urls = [], $follow_imports = false, $options = [] ) {
		$this->configure_css_converter_to_use_zero_defaults();
		
		$conversion_log = [
			'start_time' => microtime( true ),
			'input_size' => strlen( $html ),
			'css_urls_count' => count( $css_urls ),
			'options' => $options,
			'warnings' => [],
			'errors' => [],
		];

		try {
		$elements = $this->parse_html_elements_from_input( $html );
		$conversion_log['parsed_elements'] = count( $elements );
		
		
		$this->skip_debug_logging_for_performance();

			$validation_issues = $this->validate_html_structure_with_max_depth_limit( $elements );
			if ( ! empty( $validation_issues ) ) {
				$conversion_log['warnings'] = array_merge( $conversion_log['warnings'], $validation_issues );
			}

		$all_css = $this->extract_all_css_including_inline_styles( $html, $css_urls, $follow_imports, $elements );
		$conversion_log['css_size'] = strlen( $all_css );

		$mapped_widgets = $this->map_html_elements_to_widgets( $elements );
		$mapping_stats = $this->widget_mapper->get_mapping_stats( $elements );
		$conversion_log['mapping_stats'] = $mapping_stats;
		

		$unified_processing_result = $this->process_css_and_widgets_with_unified_approach( $all_css, $mapped_widgets );
		
		$resolved_widgets = $unified_processing_result['widgets'];
		$css_class_rules = $unified_processing_result['css_class_rules'] ?? [];
		$conversion_log['css_processing'] = $unified_processing_result['stats'];
		
		
		$this->skip_debug_logging_for_performance();
		$styled_widgets = $this->prepare_widgets_with_resolved_styles_for_creation( $resolved_widgets );
		
		$widgets_with_resolved_styles_for_global_classes = $resolved_widgets;
		
		$global_classes = $this->generate_global_classes_from_css_class_rules( $css_class_rules );
		
		if ( ! empty( $global_classes ) ) {
			$this->store_global_classes_in_kit_meta_instead_of_widget_data( $global_classes, $options );
		}
		
		$this->ensure_inline_styles_use_optimized_global_classes_pipeline();

			$creation_result = $this->create_widgets_with_resolved_styles( $widgets_with_resolved_styles_for_global_classes, $options, $global_classes );
			$conversion_log['widget_creation'] = $creation_result['stats'];
			$widgets_created = $this->ensure_widgets_created_is_array_to_fix_count_error( $creation_result );
			
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

		$matches = [];
		$this->extract_inline_css_from_style_tags_using_regex_to_avoid_dom_parsing_issues( $html, $matches );
		foreach ( $matches[1] as $css_content ) {
			$all_css .= trim( $css_content ) . "\n";
		}

		if ( ! empty( $elements ) && $create_global_classes ) {
			$inline_css = $this->extract_inline_css_from_style_attributes_of_parsed_elements( $elements );
			if ( ! empty( $inline_css ) ) {
				$all_css .= $inline_css . "\n";
			}
		} elseif ( ! empty( $elements ) && ! $create_global_classes ) {
			$this->skip_css_rule_creation_when_not_creating_global_classes();
		}

		if ( ! empty( $css_urls ) ) {
			$css_fetch_result = $this->fetch_external_css_files_using_unified_processor( $css_urls, $follow_imports );
			$all_css .= $css_fetch_result['css'];
		}

		return $all_css;
	}

	private function extract_inline_css_from_elements( &$elements, &$element_counter = null ) {
		$inline_css = '';
		
		if ( null === $element_counter ) {
			$element_counter = $this->initialize_element_counter_if_not_passed_from_parent_call();
		}

		foreach ( $elements as &$element ) {
			if ( ! empty( $element['inline_css'] ) ) {
				
				$element_counter++;
				
				$element_tag = $this->get_element_tag_for_debug_logging( $element );
				$element_id = $this->get_element_id_for_debug_logging( $element );
				
				$class_name = $this->create_unique_class_name_for_element( $element_counter );
				
				$css_rules = $this->convert_inline_css_to_css_rule_format( $element );
				
				if ( ! empty( $css_rules ) ) {
					$css_rule_block = ".{$class_name} {\n" . implode( "\n", $css_rules ) . "\n}\n\n";
					$inline_css .= $css_rule_block;
					
					$this->skip_debug_logging_for_performance();
					
					$this->store_generated_class_name_in_element_for_later_reference( $element, $class_name );
					
					$this->apply_generated_class_to_html_element_preserving_original_classes( $element, $class_name );
					
				}
			} else {
				$this->skip_processing_element_without_inline_css();
			}
			
			if ( ! empty( $element['children'] ) ) {
				$child_css = $this->process_child_elements_recursively_passing_counter_by_reference( $element, $element_counter );
				$inline_css .= $child_css;
			}
		}

		return $inline_css;
	}


	private function note_removed_methods_no_longer_needed_due_to_optimized_global_classes_pipeline(): void {
		// Intentionally empty - apply_inline_styles_to_widgets and apply_inline_styles_recursive methods removed
		// All styling now goes through the optimized global classes pipeline
	}


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

		$this->extract_css_from_style_tags_only_without_inline_style_conversion( $html, $matches );
		foreach ( $matches[1] as $css_content ) {
			$all_css .= trim( $css_content ) . "\n";
		}

		if ( ! empty( $css_urls ) ) {
			foreach ( $css_urls as $url ) {
				try {
					$full_url = $this->convert_relative_urls_to_full_http_urls( $url );
					
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
					$this->handle_css_fetch_errors_without_logging_for_performance();
				}
			}
		}

		$this->skip_debug_logging_for_performance();

		return $all_css;
	}

	private function resolve_css_url( string $url ): string {
		if ( $this->is_already_full_url( $url ) ) {
			return $url;
		}

		$base_url = $this->convert_relative_url_to_full_http_url();
		
		$url = $this->remove_leading_slash_to_avoid_double_slashes( $url );
		
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
			
			// CRITICAL FIX: Remove resolved_styles to ensure widgets use the legacy applied_styles path
			// This prevents duplicate class extraction between Atomic_Widget_Data_Formatter and merge_settings_with_styles
			unset( $prepared_widget['resolved_styles'] );
			
			// Recursively prepare child widgets
			if ( ! empty( $widget['children'] ) ) {
				$prepared_widget['children'] = $this->prepare_widgets_recursively( $widget['children'] );
			}
			
			$prepared_widgets[] = $prepared_widget;
		}
		
		return $prepared_widgets;
	}

	private function create_widgets_with_resolved_styles( array $widgets_with_resolved_styles, array $options, array $global_classes = null ): array {
		// Convert widgets with resolved styles to the format expected by existing widget creator
		$styled_widgets = $this->prepare_widgets_recursively( $widgets_with_resolved_styles );
		
		// Use pre-generated global classes if provided, otherwise generate from resolved styles (legacy fallback)
		if ( $global_classes === null ) {
			$global_classes = $this->generate_global_classes_from_resolved_styles( $widgets_with_resolved_styles );
		}
		
		
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
	
	private function generate_global_classes_from_css_rules( array $css_class_rules ): array {
		$global_classes = [];
		
		
		foreach ( $css_class_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];
			
			if ( empty( $selector ) || empty( $properties ) ) {
				continue;
			}
			
			
			// Convert CSS class selector to global class format
			$class_name = ltrim( $selector, '.' ); // Remove the dot
			
			// Convert properties to the format expected by Widget Creator
			$converted_properties = [];
			foreach ( $properties as $property ) {
				$prop_name = $property['property'] ?? '';
				$prop_value = $property['value'] ?? '';
				
				if ( ! empty( $prop_name ) && ! empty( $prop_value ) ) {
					$converted_properties[ $prop_name ] = $prop_value;
				}
			}
			
			if ( ! empty( $converted_properties ) ) {
				$global_classes[ $class_name ] = [
					'selector' => $selector,
					'properties' => $converted_properties,
					'source' => 'css-class-rule',
				];
				
			}
		}
		
		return $global_classes;
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
	
	private function store_global_classes_in_kit( array $global_classes, array $options ): void {
		if ( empty( $global_classes ) ) {
			return;
		}
		
		
		try {
			// Check if Elementor Plugin is available
			if ( ! defined( 'ELEMENTOR_VERSION' ) || ! \Elementor\Plugin::$instance ) {
				return;
			}
			
			// Check if kits manager is available
			if ( ! \Elementor\Plugin::$instance->kits_manager ) {
				return;
			}
			
			// Get the active kit
			$active_kit = \Elementor\Plugin::$instance->kits_manager->get_active_kit();
			if ( ! $active_kit ) {
				return;
			}
			
			
			$repository = Global_Classes_Repository::make();
			
			// Determine context: preview for editor, frontend for published pages
			$is_preview = isset( $options['context'] ) && $options['context'] === 'preview';
			if ( ! $is_preview ) {
				// Check if we're in the editor or preview mode
				$is_preview = is_preview() || ( defined( 'ELEMENTOR_VERSION' ) && \Elementor\Plugin::$instance->editor->is_edit_mode() );
			}
			
			$context = $is_preview ? Global_Classes_Repository::CONTEXT_PREVIEW : Global_Classes_Repository::CONTEXT_FRONTEND;
			$repository->context( $context );
			
			
			// Get existing global classes from Kit
			$existing = $repository->all();
			$existing_items = $existing->get_items()->all();
			$existing_order = $existing->get_order()->all();
			
			
			// CRITICAL FIX: Convert global classes to proper Elementor atomic format with 'variants' structure
			$formatted_global_classes = [];
			foreach ( $global_classes as $class_id => $class_data ) {
				// Convert CSS Converter format to Elementor atomic format
				$styles = $class_data['styles'] ?? $class_data;
				$properties = $styles['properties'] ?? [];
				
				// Convert CSS properties to atomic props format
				$atomic_props = [];
				foreach ( $properties as $property => $value ) {
					$atomic_props[ $property ] = $this->convert_css_property_to_atomic_format( $property, $value );
				}
				
				$formatted_global_classes[ $class_id ] = [
					'id' => $class_id,
					'label' => $class_id, // Use class ID as label for CSS Converter generated classes
					'type' => 'class', // CRITICAL FIX: Add the missing type field that atomic system expects
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => $atomic_props,
							'custom_css' => null,
						],
					],
				];
			}
			
			// Merge CSS Converter classes with existing classes
			$updated_items = array_merge( $existing_items, $formatted_global_classes );
			$updated_order = array_merge( $existing_order, array_keys( $formatted_global_classes ) );
			
			// Remove duplicates from order and re-index to ensure proper array (not associative)
			$updated_order = array_values( array_unique( $updated_order ) );
			
			
			// Store in Kit meta - this will trigger cache invalidation automatically
			$repository->put( $updated_items, $updated_order );
			
			
		} catch ( \Exception $e ) {
		}
	}

	private function count_properties_in_global_classes( array $global_classes ): int {
		$total_properties = 0;
		
		foreach ( $global_classes as $class_data ) {
			$total_properties += count( $class_data['properties'] ?? [] );
		}
		
		return $total_properties;
	}

	private function convert_css_property_to_atomic_format( string $property, $value ) {
		// Convert CSS properties to atomic format based on the atomic styles schema
		switch ( $property ) {
			case 'background':
				return $this->convert_background_to_atomic_format( $value );
			
			case 'color':
				return $this->convert_color_to_atomic_format( $value );
			
			case 'font-size':
			case 'width':
			case 'height':
			case 'margin':
			case 'padding':
				return $this->convert_size_to_atomic_format( $value );
			
			default:
				// For unsupported properties, return as string and let atomic system handle it
				return $value;
		}
	}

	private function convert_background_to_atomic_format( $value ) {
		// Handle different background types
		if ( is_string( $value ) ) {
			// Check if it's a gradient
			if ( strpos( $value, 'gradient' ) !== false ) {
				// For now, store gradients as custom CSS since atomic format is complex
				return [
					'custom_css' => $value
				];
			}
			
			// Check if it's a color
			if ( $this->is_color_value( $value ) ) {
				return [
					'color' => [
						'$$type' => 'color',
						'value' => $this->normalize_color_value( $value )
					]
				];
			}
		}
		
		// Fallback to custom CSS
		return [
			'custom_css' => $value
		];
	}

	private function convert_color_to_atomic_format( $value ) {
		return [
			'$$type' => 'color',
			'value' => $this->normalize_color_value( $value )
		];
	}

	private function convert_size_to_atomic_format( $value ) {
		$parsed = $this->parse_size_value( $value );
		if ( $parsed ) {
			return [
				'$$type' => 'size',
				'value' => [
					'size' => $parsed['size'],
					'unit' => $parsed['unit']
				]
			];
		}
		
		return $value; // Fallback to original value
	}

	private function is_color_value( $value ) {
		// Simple color detection
		return preg_match( '/^#[0-9a-f]{3,6}$/i', $value ) || 
		       preg_match( '/^rgb\(/', $value ) || 
		       preg_match( '/^rgba\(/', $value ) ||
		       in_array( strtolower( $value ), [ 'red', 'blue', 'green', 'black', 'white', 'transparent' ] );
	}

	private function normalize_color_value( $value ) {
		// Convert color names to hex values
		$color_map = [
			'red' => '#ff0000',
			'blue' => '#0000ff',
			'green' => '#008000',
			'black' => '#000000',
			'white' => '#ffffff',
			'transparent' => 'transparent'
		];
		
		$lower_value = strtolower( $value );
		if ( isset( $color_map[ $lower_value ] ) ) {
			return $color_map[ $lower_value ];
		}
		
		return $value; // Return as-is for hex, rgb, rgba values
	}

	private function parse_size_value( $value ) {
		// Parse size values like "16px", "1em", "100%"
		if ( preg_match( '/^(\d*\.?\d+)(px|em|rem|%|vh|vw|auto)$/', $value, $matches ) ) {
			return [
				'size' => floatval( $matches[1] ),
				'unit' => $matches[2]
			];
		}
		
		return null;
	}

	private function initialize_unified_css_processor_with_required_dependencies(): void {
		$css_parser = new \Elementor\Modules\CssConverter\Parsers\CssParser();
		$specificity_calculator = new Css_Specificity_Calculator();
		$this->unified_css_processor = new Unified_Css_Processor(
			$css_parser,
			$this->property_conversion_service,
			$specificity_calculator
		);
	}

	private function get_html_fetch_timeout_with_filter_support(): int {
		return apply_filters( 'elementor_widget_converter_timeout', 30 );
	}

	private function extract_css_urls_from_html_if_not_provided( string $html ): array {
		return $this->html_parser->extract_linked_css( $html );
	}

	private function configure_css_converter_to_use_zero_defaults(): void {
		$this->use_zero_defaults = true;
		$this->widget_creator = new Widget_Creator( $this->use_zero_defaults );
	}

	private function parse_html_elements_from_input( string $html ): array {
		return $this->html_parser->parse( $html );
	}

	private function validate_html_structure_with_max_depth_limit( array $elements ): array {
		return $this->html_parser->validate_html_structure( $elements, 20 );
	}

	private function extract_all_css_including_inline_styles( string $html, array $css_urls, bool $follow_imports, array &$elements ): string {
		return $this->extract_all_css( $html, $css_urls, $follow_imports, $elements, true );
	}

	private function map_html_elements_to_widgets( array $elements ): array {
		return $this->widget_mapper->map_elements( $elements );
	}

	private function process_css_and_widgets_with_unified_approach( string $all_css, array $mapped_widgets ): array {
		return $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets );
	}

	private function prepare_widgets_with_resolved_styles_for_creation( array $resolved_widgets ): array {
		return $resolved_widgets;
	}

	private function generate_global_classes_from_css_class_rules( array $css_class_rules ): array {
		return $this->generate_global_classes_from_css_rules( $css_class_rules );
	}

	private function store_global_classes_in_kit_meta_instead_of_widget_data( array $global_classes, array $options ): void {
		$this->store_global_classes_in_kit( $global_classes, $options );
	}

	private function ensure_inline_styles_use_optimized_global_classes_pipeline(): void {
		// Intentionally empty - inline styles now always use optimized global classes pipeline
	}

	private function ensure_widgets_created_is_array_to_fix_count_error( array $creation_result ) {
		return $creation_result['widgets_created'] ?? 0;
	}

	private function extract_inline_css_from_style_tags_using_regex_to_avoid_dom_parsing_issues( string $html, array &$matches ): void {
		preg_match_all( '/<style[^>]*>(.*?)<\/style>/is', $html, $matches );
	}

	private function extract_inline_css_from_style_attributes_of_parsed_elements( array &$elements ): string {
		return $this->extract_inline_css_from_elements( $elements );
	}

	private function skip_css_rule_creation_when_not_creating_global_classes(): void {
		// Intentionally empty - skipping CSS rule creation when not creating global classes
	}

	private function fetch_external_css_files_using_unified_processor( array $css_urls, bool $follow_imports ): array {
		return $this->unified_css_processor->fetch_css_from_urls( $css_urls, $follow_imports );
	}

	private function initialize_element_counter_if_not_passed_from_parent_call(): int {
		return 0;
	}

	private function get_element_tag_for_debug_logging( array $element ): string {
		return $element['tag'] ?? 'unknown';
	}

	private function get_element_id_for_debug_logging( array $element ): string {
		return $element['attributes']['id'] ?? 'no-id';
	}

	private function create_unique_class_name_for_element( int $element_counter ): string {
		return 'inline-element-' . $element_counter;
	}

	private function convert_inline_css_to_css_rule_format( array $element ): array {
		$css_rules = [];
		foreach ( $element['inline_css'] as $property => $style_data ) {
			$value = $style_data['value'];
			$important = $style_data['important'] ? ' !important' : '';
			$css_rules[] = "  {$property}: {$value}{$important};";
		}
		return $css_rules;
	}

	private function store_generated_class_name_in_element_for_later_reference( array &$element, string $class_name ): void {
		$element['generated_class'] = $class_name;
	}

	private function apply_generated_class_to_html_element_preserving_original_classes( array &$element, string $class_name ): void {
		$existing_classes = $element['attributes']['class'] ?? '';
		if ( ! empty( $existing_classes ) ) {
			$element['attributes']['class'] = $existing_classes . ' ' . $class_name;
		} else {
			$element['attributes']['class'] = $class_name;
		}
	}

	private function skip_processing_element_without_inline_css(): void {
		// Intentionally empty - skipping element without inline CSS
	}

	private function process_child_elements_recursively_passing_counter_by_reference( array $element, int &$element_counter ): string {
		return $this->extract_inline_css_from_elements( $element['children'], $element_counter );
	}

	private function extract_css_from_style_tags_only_without_inline_style_conversion( string $html, array &$matches ): void {
		preg_match_all( '/<style[^>]*>(.*?)<\/style>/is', $html, $matches );
	}

	private function convert_relative_urls_to_full_http_urls( string $url ): string {
		return $this->resolve_css_url( $url );
	}

	private function handle_css_fetch_errors_without_logging_for_performance(): void {
		// Intentionally empty - error handling without logging for performance
	}

	private function is_already_full_url( string $url ): bool {
		return strpos( $url, 'http' ) === 0;
	}

	private function convert_relative_url_to_full_http_url(): string {
		return home_url();
	}

	private function remove_leading_slash_to_avoid_double_slashes( string $url ): string {
		return ltrim( $url, '/' );
	}

	private function skip_debug_logging_for_performance(): void {
		// Intentionally empty - debug logging removed for performance optimization
	}

}
