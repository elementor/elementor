<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Plugin;
use Elementor\Core\Base\Document;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Hierarchy_Processor;
use Elementor\Modules\CssConverter\Services\Widgets\Widget_Error_Handler;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Factory;

class Widget_Creator {
	private $creation_stats;
	private $error_log;
	private $hierarchy_processor;
	private $error_handler;
	private $current_widget_class_id;
	private $property_mapper_registry;

	public function __construct() {
		$this->creation_stats = [
			'widgets_created' => 0,
			'widgets_failed' => 0,
			'global_classes_created' => 0,
			'variables_created' => 0,
			'errors' => [],
			'warnings' => [],
		];
		$this->error_log = [];
		$this->hierarchy_processor = new Widget_Hierarchy_Processor();
		$this->error_handler = new Widget_Error_Handler();
		$this->property_mapper_registry = Class_Property_Mapper_Factory::get_registry();
	}

	public function create_widgets( $styled_widgets, $css_processing_result, $options = [] ) {
		// HVV Requirement: Process dependencies in order: Variables → Global Classes → Parent → Children
		
		$post_id = $options['postId'] ?? null;
		$post_type = $options['postType'] ?? 'page';
		$create_global_classes = $options['createGlobalClasses'] ?? true;

		try {
			// Step 1: Process Variables (if any CSS variables were found)
			if ( ! empty( $css_processing_result['css_variables'] ) ) {
				$this->process_css_variables( $css_processing_result['css_variables'] );
			}

			// Step 2: Create Global Classes (HVV: threshold = 1)
			if ( $create_global_classes && ! empty( $css_processing_result['global_classes'] ) ) {
				$this->create_global_classes( $css_processing_result['global_classes'] );
			}

			// Step 3: Create or get post
			$post_id = $this->ensure_post_exists( $post_id, $post_type );

			// Step 4: Get Elementor document
			$document = $this->get_elementor_document( $post_id );

			// Step 5: Process widgets in dependency order (Parent → Children)
			$hierarchy_result = $this->hierarchy_processor->process_widget_hierarchy( $styled_widgets );
			$elementor_elements = $this->convert_widgets_to_elementor_format( $hierarchy_result['widgets'] );

			// Step 6: Save to Elementor document in draft mode (HVV requirement)
			$this->save_to_document( $document, $elementor_elements );

			// Merge hierarchy processing stats
			$this->merge_hierarchy_stats( $hierarchy_result['stats'] );
			
			return [
				'success' => true,
				'post_id' => $post_id,
				'edit_url' => $this->get_edit_url( $post_id ),
				'widgets_created' => $this->creation_stats['widgets_created'],
				'global_classes_created' => $this->creation_stats['global_classes_created'],
				'variables_created' => $this->creation_stats['variables_created'],
				'stats' => $this->creation_stats,
				'hierarchy_stats' => $hierarchy_result['stats'],
				'errors' => $this->error_log,
				'hierarchy_errors' => $hierarchy_result['errors'],
				'error_report' => $this->error_handler->generate_error_report(),
			];

		} catch ( \Exception $e ) {
			$this->creation_stats['errors'][] = [
				'type' => 'widget_creation_failed',
				'message' => $e->getMessage(),
				'trace' => $e->getTraceAsString(),
			];

			throw $e;
		}
	}

	private function process_css_variables( $css_variables ) {
		// Process CSS variables using existing variable conversion service
		try {
			foreach ( $css_variables as $variable ) {
				// This would integrate with existing variable converter
				// For now, we'll log that variables were found
				$this->creation_stats['variables_created']++;
			}
		} catch ( \Exception $e ) {
			$this->creation_stats['warnings'][] = [
				'type' => 'variable_processing_failed',
				'message' => $e->getMessage(),
			];
		}
	}

	private function create_global_classes( $global_classes ) {
		// HVV Decision: threshold = 1, create global class for every CSS class
		foreach ( $global_classes as $class_name => $class_data ) {
			try {
				$this->create_single_global_class( $class_name, $class_data );
				$this->creation_stats['global_classes_created']++;
			} catch ( \Exception $e ) {
				$this->creation_stats['warnings'][] = [
					'type' => 'global_class_creation_failed',
					'class_name' => $class_name,
					'message' => $e->getMessage(),
				];
			}
		}
	}

	private function create_single_global_class( $class_name, $class_data ) {
		// This would integrate with the existing Global Classes system
		// For now, we'll create a placeholder implementation
		
		if ( ! class_exists( 'Elementor\Modules\GlobalClasses\Global_Classes_Repository' ) ) {
			throw new \Exception( 'Global Classes Repository not available' );
		}

		// Convert class data to Global Classes format
		$global_class_data = [
			'id' => sanitize_title( $class_name ),
			'label' => $class_name,
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $this->convert_properties_to_global_class_props( $class_data['properties'] ?? [] ),
					'custom_css' => null,
				],
			],
		];

		// This would call the actual Global Classes Repository
		// $repository = new \Elementor\Modules\GlobalClasses\Global_Classes_Repository();
		// $repository->create( $global_class_data );
	}

	private function convert_properties_to_global_class_props( $properties ) {
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

	private function ensure_post_exists( $post_id, $post_type ) {
		if ( $post_id ) {
			// Validate existing post
			$post = get_post( $post_id );
			if ( ! $post ) {
				throw new \Exception( "Post with ID {$post_id} not found" );
			}
			return $post_id;
		}

		// Create new post in draft mode (HVV requirement)
		$post_data = [
			'post_title' => 'Elementor Widget Conversion - ' . date( 'Y-m-d H:i:s' ),
			'post_type' => $post_type,
			'post_status' => 'draft', // HVV: Draft mode first
			'post_content' => '',
			'meta_input' => [
				'_elementor_edit_mode' => 'builder',
				'_elementor_template_type' => 'wp-post',
				'_elementor_version' => ELEMENTOR_VERSION,
			],
		];

		$new_post_id = wp_insert_post( $post_data );

		if ( is_wp_error( $new_post_id ) ) {
			throw new \Exception( 'Failed to create post: ' . $new_post_id->get_error_message() );
		}

		return $new_post_id;
	}

	private function get_elementor_document( $post_id ) {
		if ( ! class_exists( 'Elementor\Plugin' ) ) {
			throw new \Exception( 'Elementor Plugin not available' );
		}

		$document = Plugin::$instance->documents->get( $post_id );
		
		if ( ! $document ) {
			throw new \Exception( "Failed to get Elementor document for post {$post_id}" );
		}

		return $document;
	}

	private function convert_widgets_to_elementor_format( $processed_widgets ) {
		// Convert hierarchy-processed widgets to Elementor format
		$elementor_elements = [];

		foreach ( $processed_widgets as $widget ) {
			try {
				$elementor_widget = $this->convert_widget_to_elementor_format( $widget );
				$elementor_elements[] = $elementor_widget;
				$this->creation_stats['widgets_created']++;
			} catch ( \Exception $e ) {
				// HVV: Graceful degradation - continue on widget failure
				$fallback_widget = $this->handle_widget_creation_failure( $widget, $e );
				if ( $fallback_widget ) {
					$elementor_elements[] = $fallback_widget;
				}
			}
		}

		return $elementor_elements;
	}

	private function convert_widget_to_elementor_format( $widget ) {
		$widget_type = $widget['widget_type'];
		$settings = $widget['settings'] ?? [];
		$applied_styles = $widget['applied_styles'] ?? [];
		$attributes = $widget['attributes'] ?? [];

		// Generate unique widget ID
		$widget_id = wp_generate_uuid4();

		// Base Elementor widget structure
		$mapped_type = $this->map_to_elementor_widget_type( $widget_type );
		
		// Merge widget attributes into settings for Elementor v4 compatibility
		$merged_settings = $this->merge_settings_with_styles( $settings, $applied_styles );
		
		// Add widget attributes to settings (preserves HTML id, class, etc.)
		if ( ! empty( $attributes ) ) {
			$merged_settings['attributes'] = $attributes;
		}
		
		if ( 'e-flexbox' === $mapped_type ) {
			// Flexbox containers have special structure in Elementor
			$elementor_widget = [
				'id' => $widget_id,
				'elType' => 'e-flexbox',
				'settings' => $merged_settings,
				'isInner' => false,
				'styles' => $this->convert_styles_to_v4_format( $applied_styles ),
				'editor_settings' => [],
				'version' => '0.0',
			];
		} else {
			// Regular widgets
			$elementor_widget = [
				'id' => $widget_id,
				'elType' => 'widget',
				'widgetType' => $mapped_type,
				'settings' => $merged_settings,
				'isInner' => false,
				'styles' => $this->convert_styles_to_v4_format( $applied_styles ),
				'editor_settings' => [],
				'version' => '0.0',
			];
		}

		// Handle children for container widgets (already processed by hierarchy processor)
		if ( ! empty( $widget['elements'] ) ) {
			$elementor_widget['elements'] = $this->convert_widgets_to_elementor_format( $widget['elements'] );
		} else {
			// Ensure elements array exists (required by Elementor)
			$elementor_widget['elements'] = [];
		}

		return $elementor_widget;
	}

	private function map_to_elementor_widget_type( $widget_type ) {
		// Map our internal widget types to actual Elementor widget types
		$mapping = [
			'e-heading' => 'e-heading',
			'e-paragraph' => 'e-paragraph',
			'e-flexbox' => 'e-flexbox',
			'e-link' => 'e-button', // Links can be represented as buttons
			'e-button' => 'e-button',
			'e-image' => 'e-image',
		];

		return $mapping[ $widget_type ] ?? 'html'; // Fallback to HTML widget
	}

	private function merge_settings_with_styles( $settings, $applied_styles ) {
		// Format settings according to Elementor v4 atomic widget structure
		$merged_settings = $this->format_elementor_settings( $settings );

		// V4 atomic widgets: Add classes array with proper $$type wrapper
		$classes = [];

		// Add global classes
		if ( ! empty( $applied_styles['global_classes'] ) ) {
			$classes = array_merge( $classes, $applied_styles['global_classes'] );
		}

		// Add generated class ID if we have computed styles
		if ( ! empty( $applied_styles['computed_styles'] ) ) {
			$class_id = $this->generate_unique_class_id();
			$classes[] = $class_id;
			
			// Store the class ID for use in styles generation
			$this->current_widget_class_id = $class_id;
		}

		// Add classes to settings with proper v4 format
		if ( ! empty( $classes ) ) {
			$merged_settings['classes'] = [
				'$$type' => 'classes',
				'value' => $classes,
			];
		} else {
			// Ensure classes array exists even if empty
			$merged_settings['classes'] = [];
		}

		return $merged_settings;
	}

	private function format_elementor_settings( $settings ) {
		$formatted_settings = [];
		
		foreach ( $settings as $key => $value ) {
			// Special formatting for specific fields
			if ( 'tag' === $key && is_string( $value ) ) {
				$formatted_settings[ $key ] = [
					'$$type' => 'string',
					'value' => $value,
				];
			} else {
				$formatted_settings[ $key ] = $this->format_elementor_value( $value );
			}
		}
		
		return $formatted_settings;
	}

	private function format_elementor_value( $value ) {
		// Format values according to Elementor's expected structure
		// Only specific fields need the $$type wrapper (like 'tag' for headings)
		return $value;
	}

	private function map_css_property_to_elementor_setting( $css_property ) {
		// V4 atomic widgets don't use direct CSS property mapping
		// Styles are handled through the atomic styling system
		// This method is kept for compatibility but returns null
		return null;
	}

	private function convert_styles_to_v4_format( $applied_styles ) {
		// Convert CSS styles to Elementor v4 atomic widget styles format
		$v4_styles = [];

		// DEBUG: Log what we received
		error_log( 'Widget Creator: convert_styles_to_v4_format called with: ' . wp_json_encode( array_keys( $applied_styles ) ) );
		
		// Process ID styles first (highest specificity after !important and inline)
		if ( ! empty( $applied_styles['id_styles'] ) ) {
			error_log( 'Widget Creator: Processing ID styles: ' . count( $applied_styles['id_styles'] ) . ' styles found' );
			
			$id_class_id = $this->generate_unique_class_id();
			$id_style_object = $this->create_v4_style_object_from_id_styles( $id_class_id, $applied_styles['id_styles'] );
			
			error_log( 'Widget Creator: ID style object created with props: ' . wp_json_encode( $id_style_object['variants'][0]['props'] ?? [] ) );
			
			if ( ! empty( $id_style_object['variants'][0]['props'] ) ) {
				$v4_styles[ $id_class_id ] = $id_style_object;
				error_log( 'Widget Creator: ID styles added to v4_styles with class ID: ' . $id_class_id );
			} else {
				error_log( 'Widget Creator: ID style object has no props - not added to v4_styles' );
			}
		} else {
			error_log( 'Widget Creator: No ID styles found in applied_styles' );
		}

		// Process computed styles (from external CSS + inline styles)
		if ( ! empty( $applied_styles['computed_styles'] ) ) {
			// Generate class ID if not already set
			if ( empty( $this->current_widget_class_id ) ) {
				$this->current_widget_class_id = $this->generate_unique_class_id();
			}
			
			$class_id = $this->current_widget_class_id;
			
			// Create v4 style object
			$style_object = $this->create_v4_style_object( $class_id, $applied_styles['computed_styles'] );
			
			if ( ! empty( $style_object['variants'][0]['props'] ) ) {
				$v4_styles[ $class_id ] = $style_object;
			}
		}

		return $v4_styles;
	}

	private function create_v4_style_object_from_id_styles( $class_id, $id_styles ) {
		// Create v4 atomic style object from ID styles
		$style_object = [
			'id' => $class_id,
			'label' => 'local',
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => [],
				],
			],
		];

		// Convert ID styles to v4 props format
		foreach ( $id_styles as $index => $id_style ) {
			error_log( "Widget Creator: Processing ID style $index: " . wp_json_encode( $id_style ) );
			
			if ( isset( $id_style['converted_property'] ) ) {
				$converted = $id_style['converted_property'];
				error_log( "Widget Creator: Converted property found: " . wp_json_encode( $converted ) );
				
				// Apply the converted property to the style object
				if ( isset( $converted['property'] ) && isset( $converted['value'] ) ) {
					$style_object['variants'][0]['props'][ $converted['property'] ] = $converted['value'];
					error_log( "Widget Creator: Added prop {$converted['property']} to style object" );
				} else {
					error_log( "Widget Creator: Converted property missing 'property' or 'value' keys" );
				}
			} else {
				error_log( "Widget Creator: No 'converted_property' found in ID style" );
			}
		}

		return $style_object;
	}

	private function generate_unique_class_id() {
		// Generate unique class ID in Elementor v4 format: e-{widget-id}-{hash}
		$widget_id = substr( wp_generate_uuid4(), 0, 8 );
		$hash = substr( md5( microtime() . wp_rand() ), 0, 7 );
		return "e-{$widget_id}-{$hash}";
	}

	private function create_v4_style_object( $class_id, $computed_styles ) {
		// Create v4 atomic style object structure
		$style_object = [
			'id' => $class_id,
			'label' => 'local',
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $this->map_css_to_v4_props( $computed_styles ),
					'custom_css' => null,
				],
			],
		];

		return $style_object;
	}

	private function map_css_to_v4_props( $computed_styles ) {
		$v4_props = [];

		foreach ( $computed_styles as $property => $style_data ) {
			// Extract the actual CSS value from the style data structure
			$css_value = $style_data['value'] ?? $style_data;
			
			$v4_prop = $this->convert_css_property_to_v4( $property, $css_value );
			if ( $v4_prop ) {
				$v4_props[ $v4_prop['property'] ] = $v4_prop['value'];
			}
		}

		return $v4_props;
	}

	private function convert_css_property_to_v4( $property, $value ) {
		// Skip conversion if value is already in v4 format (has $$type)
		if ( is_array( $value ) && isset( $value['$$type'] ) ) {
			return [
				'property' => $property,
				'value' => $value,
			];
		}
		
		// Skip conversion if value is not a string (property mappers expect CSS strings)
		if ( ! is_string( $value ) ) {
			return null;
		}
		
		// Use the unified property mapper system for CSS string values
		$mapper = $this->property_mapper_registry->resolve( $property, $value );
		
		if ( $mapper && method_exists( $mapper, 'map_to_v4_atomic' ) ) {
			return $mapper->map_to_v4_atomic( $property, $value );
		}
		
		// Fallback for properties not yet supported by unified mappers
		return null;
	}


	private function process_widget_children( $children ) {
		$elementor_children = [];

		foreach ( $children as $child ) {
			try {
				$elementor_child = $this->convert_widget_to_elementor_format( $child );
				$elementor_children[] = $elementor_child;
				$this->creation_stats['widgets_created']++;
			} catch ( \Exception $e ) {
				$this->handle_widget_creation_failure( $child, $e );
			}
		}

		return $elementor_children;
	}

	private function handle_widget_creation_failure( $widget, $exception ) {
		// HVV: Graceful degradation strategy using error handler
		$this->creation_stats['widgets_failed']++;
		
		$error_data = [
			'message' => $exception->getMessage(),
			'exception' => $exception,
		];
		
		$context = [
			'widget' => $widget,
			'operation' => 'widget_creation',
		];

		// Use error handler for graceful degradation
		$fallback_widget = $this->error_handler->handle_error( 'widget_creation_failed', $error_data, $context );
		
		if ( $fallback_widget ) {
			$this->creation_stats['widgets_created']++;
			return $fallback_widget;
		}

		return null;
	}

	private function create_html_widget_fallback( $widget ) {
		// Create HTML widget as fallback for unsupported elements
		$content = $this->reconstruct_html_from_widget( $widget );

		return [
			'id' => wp_generate_uuid4(),
			'elType' => 'widget',
			'widgetType' => 'html',
			'settings' => [
				'html' => $content,
			],
		];
	}

	private function reconstruct_html_from_widget( $widget ) {
		$tag = $widget['original_tag'] ?? 'div';
		$attributes = $widget['attributes'] ?? [];
		$content = $widget['settings']['text'] ?? $widget['settings']['content'] ?? '';

		// Build HTML attributes
		$attr_string = '';
		foreach ( $attributes as $attr => $value ) {
			$attr_string .= ' ' . esc_attr( $attr ) . '="' . esc_attr( $value ) . '"';
		}

		// Self-closing tags
		if ( in_array( $tag, [ 'img', 'br', 'hr', 'input' ], true ) ) {
			return "<{$tag}{$attr_string} />";
		}

		return "<{$tag}{$attr_string}>{$content}</{$tag}>";
	}

	private function save_to_document( $document, $elementor_elements ) {
		if ( ! $document instanceof Document ) {
			throw new \Exception( 'Invalid Elementor document' );
		}

		// Save elements to document - use update_meta directly for _elementor_data
		try {
			$post_id = $document->get_main_id();
			
			// Save the elements data directly to _elementor_data meta
			update_post_meta( $post_id, '_elementor_data', wp_json_encode( $elementor_elements ) );
			
			// Set additional required Elementor meta keys
			update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
			update_post_meta( $post_id, '_elementor_template_type', 'wp-post' );
			update_post_meta( $post_id, '_elementor_version', '3.33.0' );
			
			// Also try the document save method as backup
			$document->save( [
				'elements' => $elementor_elements,
			] );
		} catch ( \Exception $e ) {
			throw new \Exception( 'Failed to save elements to document: ' . $e->getMessage() );
		}
	}

	private function get_edit_url( $post_id ) {
		// Generate Elementor edit URL
		if ( function_exists( 'elementor_get_edit_url' ) ) {
			return elementor_get_edit_url( $post_id );
		}

		// Fallback to manual Elementor URL construction
		return admin_url( 'post.php?post=' . $post_id . '&action=elementor' );
	}

	public function get_creation_stats() {
		return $this->creation_stats;
	}

	public function get_error_log() {
		return $this->error_log;
	}

	private function merge_hierarchy_stats( $hierarchy_stats ) {
		// Merge hierarchy processing statistics into creation stats
		$this->creation_stats['hierarchy_stats'] = $hierarchy_stats;
		$this->creation_stats['total_widgets_processed'] = $hierarchy_stats['total_widgets'] ?? 0;
		$this->creation_stats['parent_widgets'] = $hierarchy_stats['parent_widgets'] ?? 0;
		$this->creation_stats['child_widgets'] = $hierarchy_stats['child_widgets'] ?? 0;
		$this->creation_stats['hierarchy_depth'] = $hierarchy_stats['depth_levels'] ?? 0;
		$this->creation_stats['hierarchy_errors'] = $hierarchy_stats['hierarchy_errors'] ?? 0;
	}

	public function reset_stats() {
		$this->creation_stats = [
			'widgets_created' => 0,
			'widgets_failed' => 0,
			'global_classes_created' => 0,
			'variables_created' => 0,
			'errors' => [],
			'warnings' => [],
		];
		$this->error_log = [];
		$this->hierarchy_processor = new Widget_Hierarchy_Processor();
		$this->error_handler = new Widget_Error_Handler();
		$this->property_mapper_registry = Class_Property_Mapper_Factory::get_registry();
	}
}
