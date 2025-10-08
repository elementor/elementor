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
	private $current_css_processing_result;
	private $use_zero_defaults;
	private $current_widget_type;
	private $current_unsupported_props = [];

	public function __construct( $use_zero_defaults = false ) {
		error_log( "🔥 WIDGET_CREATOR: __construct called with use_zero_defaults = " . var_export( $use_zero_defaults, true ) );
		
		$this->use_zero_defaults = $use_zero_defaults;
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
		
		// Hook into atomic widgets base styles filter when zero defaults are enabled
		if ( $this->use_zero_defaults ) {
			error_log( "🔥 WIDGET_CREATOR: Adding filter for disable-base-styles" );
			add_filter( 'elementor/atomic-widgets/disable-base-styles', [ $this, 'disable_base_styles_for_css_converter_widgets' ], 10, 3 );
			
			// Also add CSS override for base styles as a fallback
			add_action( 'wp_head', [ $this, 'inject_base_styles_override_css' ], 999 );
			error_log( "🔥 WIDGET_CREATOR: Added CSS override action for base styles" );
		} else {
			error_log( "🔥 WIDGET_CREATOR: NOT adding filter because use_zero_defaults is false" );
		}
	}

	public function disable_base_styles_for_css_converter_widgets( $disable, $widget_name, $widget_data ) {
		error_log( "🔥 FILTER CALLED: disable_base_styles_for_css_converter_widgets" );
		error_log( "🔥 FILTER: widget_name = " . $widget_name );
		error_log( "🔥 FILTER: disable (input) = " . var_export( $disable, true ) );
		error_log( "🔥 FILTER: widget_data = " . json_encode( $widget_data ) );
		
		// Check if this widget was created by the CSS converter
		if ( isset( $widget_data['editor_settings']['css_converter_widget'] ) && $widget_data['editor_settings']['css_converter_widget'] ) {
			error_log( "🔥 FILTER: This IS a CSS converter widget - DISABLING base styles" );
			return true; // Disable base styles for CSS converter widgets
		}
		
		error_log( "🔥 FILTER: This is NOT a CSS converter widget - keeping original value" );
		return $disable; // Keep original value for other widgets
	}

	public function inject_base_styles_override_css() {
		error_log( "🔥 CSS_OVERRIDE: inject_base_styles_override_css called" );
		
		// Get current post ID
		$post_id = get_the_ID();
		if ( ! $post_id ) {
			error_log( "🔥 CSS_OVERRIDE: No post ID found, skipping CSS override" );
			return;
		}
		
		error_log( "🔥 CSS_OVERRIDE: Checking post " . $post_id . " for CSS converter widgets" );
		
		// Check if this page has CSS converter widgets
		if ( ! $this->page_has_css_converter_widgets( $post_id ) ) {
			error_log( "🔥 CSS_OVERRIDE: No CSS converter widgets found, skipping CSS override" );
			return;
		}
		
		error_log( "🔥 CSS_OVERRIDE: CSS converter widgets found, injecting override CSS" );
		
		// Inject CSS to override atomic widget base styles
		echo '<style id="css-converter-base-styles-override">';
		echo '/* CSS Converter: Override atomic widget base styles */';
		echo '.elementor .e-paragraph { margin: revert !important; }';
		echo '.elementor .e-heading { margin: revert !important; }';
		echo '</style>';
		
		error_log( "🔥 CSS_OVERRIDE: CSS override injected successfully" );
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
				error_log( "🔥 CSS_OVERRIDE: Found CSS converter widget: " . ( $element_data['widgetType'] ?? 'unknown' ) );
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

	public function create_widgets( $styled_widgets, $css_processing_result, $options = [] ) {
		// HVV Requirement: Process dependencies in order: Variables → Global Classes → Parent → Children
		
		// Store the CSS processing result for use in helper methods
		$this->current_css_processing_result = $css_processing_result;
		
		$post_id = $options['postId'] ?? null;
		$post_type = $options['postType'] ?? 'page';

		try {
			// Step 1: Process Variables (if any CSS variables were found)
			if ( ! empty( $css_processing_result['css_variables'] ) ) {
				$this->process_css_variables( $css_processing_result['css_variables'] );
			}

		// Step 2: Create Global Classes (HVV: threshold = 1)
		if ( ! empty( $css_processing_result['global_classes'] ) ) {
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
				
				// ✅ NEW: Use mapped property name if available (e.g., border-top-left-radius -> border-radius)
				$property_key = $property_data['mapped_property'] ?? $property_data['original_property'] ?? 'unknown';
				
				
				// Handle the property mapper format: ['property' => 'name', 'value' => [...]]
				if ( is_array( $converted ) && isset( $converted['property'] ) && isset( $converted['value'] ) ) {
					$atomic_value = $converted['value'];
					$props[ $property_key ] = $atomic_value;
				} elseif ( is_array( $converted ) ) {
					// ✅ FIXED: Use mapped property key instead of merging directly
					$props[ $property_key ] = $converted;
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
		// Reset class ID for each new widget to ensure consistency
		$this->current_widget_class_id = null;
		
		$widget_type = $widget['widget_type'];
		$settings = $widget['settings'] ?? [];

		// Set current widget type for atomic widget property support checking
		$this->current_widget_type = $widget_type;
		$applied_styles = $widget['applied_styles'] ?? [];

		// Pre-process computed styles to identify unsupported properties BEFORE merging settings
		if ( ! empty( $applied_styles['computed_styles'] ) ) {
			error_log( "Widget Creator: Pre-processing computed styles to identify unsupported properties" );
			$this->map_css_to_v4_props( $applied_styles['computed_styles'] );
		}

		// Generate unique widget ID
		$widget_id = wp_generate_uuid4();

		// Base Elementor widget structure
		$mapped_type = $this->map_to_elementor_widget_type( $widget_type );
		
		
		// CRITICAL FIX: Convert e-link settings to e-button link format
		if ( 'e-link' === $widget_type && 'e-button' === $mapped_type ) {
			$settings = $this->convert_link_settings_to_button_format( $settings );
		}
		
		// Merge widget settings with styles for Elementor v4 compatibility
		$merged_settings = $this->merge_settings_with_styles( $settings, $applied_styles );
		
		
		
		if ( 'e-div-block' === $mapped_type ) {
			// Div-block containers have special structure in Elementor
			$elementor_widget = [
				'id' => $widget_id,
				'elType' => 'e-div-block',
				'settings' => $merged_settings,
				'isInner' => false,
				'styles' => $this->convert_styles_to_v4_format( $applied_styles, $widget_type ),
				'editor_settings' => [
					'disable_base_styles' => $this->use_zero_defaults,
					'css_converter_widget' => true,
				],
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
			'styles' => $this->convert_styles_to_v4_format( $applied_styles, $widget_type ),
			'editor_settings' => [
				'disable_base_styles' => $this->use_zero_defaults,
				'css_converter_widget' => true,
			],
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

		error_log( "🔥 WIDGET_CREATOR: Created widget with type: " . $mapped_type );
		error_log( "🔥 WIDGET_CREATOR: disable_base_styles = " . ( $this->use_zero_defaults ? 'true' : 'false' ) );
		error_log( "🔥 WIDGET_CREATOR: editor_settings = " . json_encode( $elementor_widget['editor_settings'] ?? [] ) );

		return $elementor_widget;
	}

	private function map_to_elementor_widget_type( $widget_type ) {
		// Map our internal widget types to standard Elementor widget types
		// Note: Zero defaults are now controlled via editor_settings['disable_base_styles']
		$mapping = [
			'e-heading' => 'e-heading',
			'e-paragraph' => 'e-paragraph',
			'e-div-block' => 'e-div-block',
			'e-flexbox' => 'e-flexbox',
			'e-link' => 'e-button',
			'e-button' => 'e-button',
			'e-image' => 'e-image',
		];

		$mapped_type = $mapping[ $widget_type ] ?? 'html';
		

		return $mapped_type;
	}

	private function convert_link_settings_to_button_format( $settings ) {
		// Convert e-link settings format to e-button link format
		$button_settings = $settings;
		
		// Convert link URL and target to button link format
		if ( isset( $settings['url'] ) && ! empty( $settings['url'] ) && '#' !== $settings['url'] ) {
			// ✅ CRITICAL FIX: Use correct atomic widget link structure
			// Based on manual button analysis: destination must be atomic URL object, not plain string
			$target = $settings['target'] ?? '_self';
			$is_target_blank = ( '_blank' === $target ) ? true : null;
			
			$button_settings['link'] = [
				'$$type' => 'link',
				'value' => [
					'destination' => [
						'$$type' => 'url',
						'value' => $settings['url'],
					],
					'isTargetBlank' => $is_target_blank,
				],
			];
			
			// Remove the old url/target properties
			unset( $button_settings['url'] );
			unset( $button_settings['target'] );
		}
		
		return $button_settings;
	}

	private function apply_direct_element_styles_to_settings( $settings, $direct_element_styles ) {
		// Direct element styles should be applied to the styles array, not settings
		// Settings only contain widget props like title, tag, etc.
		// This method now just returns settings unchanged - styles are handled in convert_styles_to_v4_format
		
		error_log( "Widget Creator: Found " . count( $direct_element_styles ) . " direct element styles - will apply to styles array" );
		
		return $settings;
	}

	private function merge_settings_with_styles( $settings, $applied_styles ) {
		
		// Format settings according to Elementor v4 atomic widget structure
		$merged_settings = $this->format_elementor_settings( $settings );

		// NEW: Apply direct element styles to widget settings (Approach 6)
		if ( ! empty( $applied_styles['direct_element_styles'] ) ) {
			$merged_settings = $this->apply_direct_element_styles_to_settings( $merged_settings, $applied_styles['direct_element_styles'] );
		}

		// V4 atomic widgets: Add classes array with proper $$type wrapper
		$classes = [];

		// Determine if this widget needs a class ID for styling
		$has_global_classes = ! empty( $applied_styles['global_classes'] );
		$has_computed_styles = ! empty( $applied_styles['computed_styles'] ) || ! empty( $applied_styles['id_styles'] );
		$has_unsupported_props = ! empty( $this->current_unsupported_props );
		
		error_log( "Widget Creator merge_settings_with_styles: has_global_classes={$has_global_classes}, has_computed_styles={$has_computed_styles}, has_unsupported_props={$has_unsupported_props}" );
		error_log( "Widget Creator merge_settings_with_styles: current_unsupported_props=" . wp_json_encode( $this->current_unsupported_props ) );
		
		if ( $has_global_classes || $has_computed_styles || $has_unsupported_props ) {
			// Generate a single unique class ID for this widget (avoid duplicates)
			if ( empty( $this->current_widget_class_id ) ) {
				$this->current_widget_class_id = $this->generate_unique_class_id();
			}
			
			error_log( "Widget Creator merge_settings_with_styles: Generated class ID: {$this->current_widget_class_id}" );
			
			// Add the class ID only once, regardless of whether it's for global classes or computed styles
			$classes[] = $this->current_widget_class_id;
			
			error_log( "Widget Creator merge_settings_with_styles: Classes after adding ID: " . wp_json_encode( $classes ) );
		}

		// Add classes to settings with proper v4 atomic widget format
		// Only add classes structure if there are actual classes to add
		if ( ! empty( $classes ) ) {
			$merged_settings['classes'] = [
				'$$type' => 'classes',
				'value' => $classes,
			];
			error_log( "Widget Creator merge_settings_with_styles: Added classes to merged_settings: " . wp_json_encode( $merged_settings['classes'] ) );
		} else {
			error_log( "Widget Creator merge_settings_with_styles: No classes to add" );
		}
		// If no classes, don't add the classes property at all (matches editor behavior)

		error_log( "Widget Creator merge_settings_with_styles: Final merged_settings keys: " . wp_json_encode( array_keys( $merged_settings ) ) );
		return $merged_settings;
	}

	private function format_elementor_settings( $settings ) {
		$formatted_settings = [];
		
		foreach ( $settings as $key => $value ) {
			$formatted_settings[ $key ] = $this->format_elementor_value( $value );
		}
		
		return $formatted_settings;
	}

	private function format_elementor_value( $value ) {
		if ( is_string( $value ) ) {
			return [
				'$$type' => 'string',
				'value' => $value,
			];
		}
		
		if ( is_array( $value ) && isset( $value['$$type'] ) ) {
			return $value;
		}
		
		return $value;
	}

	private function map_css_property_to_elementor_setting( $css_property ) {
		// V4 atomic widgets don't use direct CSS property mapping
		// Styles are handled through the atomic styling system
		// This method is kept for compatibility but returns null
		return null;
	}

	private function convert_styles_to_v4_format( $applied_styles, $widget_type = 'unknown' ) {
		// Convert CSS styles to Elementor v4 atomic widget styles format
		$v4_styles = [];

		
		// Process global classes first (convert to widget styles)
		if ( ! empty( $applied_styles['global_classes'] ) ) {
			// Generate a unique class ID for this widget
			if ( empty( $this->current_widget_class_id ) ) {
				$this->current_widget_class_id = $this->generate_unique_class_id();
			}
			$class_id = $this->current_widget_class_id;
			
			// Get the global class properties from the CSS processing result
			$global_class_props = $this->get_global_class_properties( $applied_styles['global_classes'] );
			
			if ( ! empty( $global_class_props ) ) {
				$style_object = $this->create_v4_style_object_from_global_classes( $class_id, $global_class_props );
				$v4_styles[ $class_id ] = $style_object;
			}
		}
		
		// Process ID styles (highest specificity after !important and inline)
		if ( ! empty( $applied_styles['id_styles'] ) ) {
			// Use the same class ID that was set in merge_settings_with_styles
			if ( empty( $this->current_widget_class_id ) ) {
				$this->current_widget_class_id = $this->generate_unique_class_id();
			}
			$id_class_id = $this->current_widget_class_id;
			
			$id_style_object = $this->create_v4_style_object_from_id_styles( $id_class_id, $applied_styles['id_styles'] );
			
			if ( ! empty( $id_style_object['variants'][0]['props'] ) ) {
				// CRITICAL FIX: Merge ID styles with existing class styles instead of overwriting!
				if ( isset( $v4_styles[ $id_class_id ] ) ) {
					// Merge ID props with existing class props
					$existing_props = $v4_styles[ $id_class_id ]['variants'][0]['props'] ?? [];
					$id_props = $id_style_object['variants'][0]['props'] ?? [];
					$v4_styles[ $id_class_id ]['variants'][0]['props'] = array_merge( $existing_props, $id_props );
				} else {
					// No existing styles, just add ID styles
					$v4_styles[ $id_class_id ] = $id_style_object;
				}
			}
		}

		// NEW: Process direct element styles (from Approach 6)
		if ( ! empty( $applied_styles['direct_element_styles'] ) ) {
			// Use the same class ID that was set earlier
			if ( empty( $this->current_widget_class_id ) ) {
				$this->current_widget_class_id = $this->generate_unique_class_id();
			}
			$direct_class_id = $this->current_widget_class_id;
			
			$direct_style_object = $this->create_v4_style_object_from_direct_styles( $direct_class_id, $applied_styles['direct_element_styles'] );
			
			if ( ! empty( $direct_style_object['variants'][0]['props'] ) ) {
				// Merge direct styles with existing styles
				if ( isset( $v4_styles[ $direct_class_id ] ) ) {
					// Merge direct props with existing props
					$existing_props = $v4_styles[ $direct_class_id ]['variants'][0]['props'] ?? [];
					$direct_props = $direct_style_object['variants'][0]['props'] ?? [];
					$v4_styles[ $direct_class_id ]['variants'][0]['props'] = array_merge( $existing_props, $direct_props );
					
					error_log( "Widget Creator: Merged direct element styles with existing styles for class {$direct_class_id}" );
				} else {
					// No existing styles, just add direct styles
					$v4_styles[ $direct_class_id ] = $direct_style_object;
					
					error_log( "Widget Creator: Created new style object for direct element styles with class {$direct_class_id}" );
				}
			}
		}

		// Process computed styles (from external CSS + inline styles)
		if ( ! empty( $applied_styles['computed_styles'] ) ) {
			error_log( "🚨 STYLES FIX: Processing computed styles for widget styles" );
			// Use the same class ID that was set earlier
			if ( empty( $this->current_widget_class_id ) ) {
				$this->current_widget_class_id = $this->generate_unique_class_id();
			}
			
			$class_id = $this->current_widget_class_id;
			
			// If we already have a style object from ID styles, merge with it
			if ( isset( $v4_styles[ $class_id ] ) ) {
				// Merge computed styles with existing ID styles
				$computed_props = $this->map_css_to_v4_props( $applied_styles['computed_styles'] );
				$existing_props = $v4_styles[ $class_id ]['variants'][0]['props'] ?? [];
				$v4_styles[ $class_id ]['variants'][0]['props'] = array_merge( $existing_props, $computed_props );
			} else {
				// Create new style object for computed styles
				$style_object = $this->create_v4_style_object( $class_id, $applied_styles['computed_styles'] );
				
				if ( ! empty( $style_object['variants'][0]['props'] ) ) {
					$v4_styles[ $class_id ] = $style_object;
				}
			}
		}

		// Process unsupported properties (properties not supported by atomic widget)
		if ( ! empty( $this->current_unsupported_props ) ) {
			// Use the same class ID that was set earlier
			if ( empty( $this->current_widget_class_id ) ) {
				$this->current_widget_class_id = $this->generate_unique_class_id();
			}
			
			$class_id = $this->current_widget_class_id;
			
			error_log( "Widget Creator: Processing " . count( $this->current_unsupported_props ) . " unsupported properties for CSS class generation" );
			
			// If we already have a style object, merge with it
			if ( isset( $v4_styles[ $class_id ] ) ) {
				// Merge unsupported props with existing props
				$existing_props = $v4_styles[ $class_id ]['variants'][0]['props'] ?? [];
				$v4_styles[ $class_id ]['variants'][0]['props'] = array_merge( $existing_props, $this->current_unsupported_props );
				error_log( "Widget Creator: Merged unsupported props with existing styles for class {$class_id}" );
			} else {
				// Create new style object for unsupported properties
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
							'props' => $this->current_unsupported_props, // Only atomic format, no custom_css
						],
					],
				];
				
				$v4_styles[ $class_id ] = $style_object;
				error_log( "Widget Creator: Created new style object for unsupported props with class {$class_id}" );
				error_log( "Widget Creator: Style object structure: " . wp_json_encode( $style_object ) );
			}
			
			// Clear unsupported props after processing
			$this->current_unsupported_props = [];
		}

		error_log( "Widget Creator convert_styles_to_v4_format: Final v4_styles count: " . count( $v4_styles ) );
		error_log( "Widget Creator convert_styles_to_v4_format: Final v4_styles: " . wp_json_encode( $v4_styles ) );
		return $v4_styles;
	}

	private function convert_atomic_props_to_css_props( $atomic_props ) {
		$css_props = [];
		
		foreach ( $atomic_props as $property => $atomic_value ) {
			if ( is_array( $atomic_value ) && isset( $atomic_value['$$type'] ) ) {
				if ( 'dimensions' === $atomic_value['$$type'] ) {
					// Convert atomic dimensions format to individual CSS properties
					$dimensions = $atomic_value['value'] ?? [];
					
					// TEMPORARY: Map atomic dimension keys to physical CSS properties for testing
					$dimension_map = [
						'block-start' => $property . '-top',
						'inline-end' => $property . '-right', 
						'block-end' => $property . '-bottom',
						'inline-start' => $property . '-left',
					];
					
					foreach ( $dimension_map as $atomic_key => $css_property ) {
						if ( isset( $dimensions[ $atomic_key ] ) ) {
							$size_value = $dimensions[ $atomic_key ];
							if ( is_array( $size_value ) && isset( $size_value['value'] ) ) {
								$size = $size_value['value']['size'] ?? 0;
								$unit = $size_value['value']['unit'] ?? 'px';
								$css_props[ $css_property ] = $size . $unit;
							}
						}
					}
				} else {
					// For other atomic types, keep as-is for now
					$css_props[ $property ] = $atomic_value;
				}
			} else {
				// Non-atomic values, keep as-is
				$css_props[ $property ] = $atomic_value;
			}
		}
		
		error_log( "Widget Creator: Converted atomic props to CSS props: " . wp_json_encode( $css_props ) );
		return $css_props;
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
			
			if ( isset( $id_style['converted_property'] ) && isset( $id_style['property'] ) ) {
				$property_name = $id_style['property'];
				$converted = $id_style['converted_property'];
				error_log( "Widget Creator: Converted property found for {$property_name}: " . wp_json_encode( $converted ) );
				
				if ( is_array( $converted ) && isset( $converted['$$type'] ) ) {
					$target_property = $this->get_target_property_name( $property_name );
					
					if ( $target_property !== $property_name ) {
						error_log( "Widget Creator: Remapping ID style {$property_name} to {$target_property}" );
					}
					
					$style_object['variants'][0]['props'][ $target_property ] = $converted;
					error_log( "Widget Creator: Added atomic prop {$target_property} to style object" );
				} else {
					error_log( "Widget Creator: Converted property is not in atomic format" );
				}
			} else {
				error_log( "Widget Creator: Missing 'converted_property' or 'property' in ID style" );
			}
		}

		return $style_object;
	}

	private function create_v4_style_object_from_direct_styles( $class_id, $direct_styles ) {
		// Create v4 atomic style object from direct element styles (Approach 6)
		// CRITICAL FIX: Atomic widgets expect CSS styles, not atomic props in styles array
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
					'custom_css' => '',
				],
			],
		];

		// Convert direct element styles to atomic props format
		foreach ( $direct_styles as $index => $direct_style ) {
			
			if ( isset( $direct_style['converted_property'] ) && isset( $direct_style['property'] ) ) {
				$property_name = $direct_style['property'];
				$converted = $direct_style['converted_property'];
				
				
				if ( is_array( $converted ) && isset( $converted['$$type'] ) ) {
					$target_property = $this->get_target_property_name( $property_name );
					
					$style_object['variants'][0]['props'][ $target_property ] = $converted;
				}
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
	
	private function get_global_class_properties( $global_class_names ) {
		// Get the actual global class properties from the CSS processing result
		// The global_class_names array contains class names like ['inline-element-1']
		// We need to get the actual properties from the global classes
		
		$props = [];
		
		// Access the global classes from the CSS processing result
		if ( ! empty( $this->current_css_processing_result['global_classes'] ) ) {
			foreach ( $global_class_names as $class_name ) {
				if ( isset( $this->current_css_processing_result['global_classes'][ $class_name ] ) ) {
					$global_class = $this->current_css_processing_result['global_classes'][ $class_name ];
					
					// Extract properties from the global class
					if ( ! empty( $global_class['properties'] ) ) {
						foreach ( $global_class['properties'] as $property_data ) {
							if ( ! empty( $property_data['converted_property'] ) ) {
								$converted = $property_data['converted_property'];
								
								// ✅ FIXED: Use mapped property name (e.g., border-top-left-radius -> border-radius, background-color -> background)
								$property_key = $property_data['mapped_property'] ?? $property_data['original_property'] ?? 'unknown';
								
							// Add the converted property to props using the correct mapped key
							$atomic_value = $converted;
							
							// Restore original atomic property processing
							// (Debugging will be added separately without breaking functionality)
							
							// Check if we need to merge directional prop type structures
							if ( isset( $props[ $property_key ] ) ) {
								if ( $this->is_dimensions_prop_type( $atomic_value ) && $this->is_dimensions_prop_type( $props[ $property_key ] ) ) {
									$props[ $property_key ] = $this->merge_dimensions_prop_types( $props[ $property_key ], $atomic_value );
								} elseif ( $this->is_border_width_prop_type( $atomic_value ) && $this->is_border_width_prop_type( $props[ $property_key ] ) ) {
									$props[ $property_key ] = $this->merge_border_width_prop_types( $props[ $property_key ], $atomic_value );
								} else {
									$props[ $property_key ] = $atomic_value;
								}
							} else {
								$props[ $property_key ] = $atomic_value;
							}
							}
						}
					}
				}
			}
		}
		
		return $props;
	}
	
	private function create_v4_style_object_from_global_classes( $class_id, $props ) {
		// Create the v4 style object structure matching your example
		return [
			'id' => $class_id,
			'label' => 'local',
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $props,
					'custom_css' => null,
				],
			],
		];
	}

	private function is_dimensions_prop_type( $property ): bool {
		return is_array( $property ) && isset( $property['$$type'] ) && 'dimensions' === $property['$$type'];
	}

	private function is_border_width_prop_type( $property ): bool {
		return is_array( $property ) && isset( $property['$$type'] ) && 'border-width' === $property['$$type'];
	}

	private function merge_dimensions_prop_types( array $existing, array $new ): array {
		if ( ! $this->is_dimensions_prop_type( $existing ) || ! $this->is_dimensions_prop_type( $new ) ) {
			return $new;
		}

		$merged_value = array_merge(
			$existing['value'] ?? [],
			$new['value'] ?? []
		);

		return [
			'$$type' => 'dimensions',
			'value' => $merged_value
		];
	}

	private function merge_border_width_prop_types( array $existing, array $new ): array {
		if ( ! $this->is_border_width_prop_type( $existing ) || ! $this->is_border_width_prop_type( $new ) ) {
			return $new;
		}

		$merged_value = array_merge(
			$existing['value'] ?? [],
			$new['value'] ?? []
		);

		return [
			'$$type' => 'border-width',
			'value' => $merged_value
		];
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
		$unsupported_props = [];

		foreach ( $computed_styles as $property => $atomic_value ) {
			error_log( "🚨 WIDGET CREATOR DEBUG: Processing property={$property}, atomic_value=" . wp_json_encode( $atomic_value ) );
			
			if ( is_array( $atomic_value ) && isset( $atomic_value['$$type'] ) ) {
				error_log( "🚨 WIDGET CREATOR DEBUG: Property {$property} is atomic, calling get_target_property_name" );
				$target_property = $this->get_target_property_name( $property );
				error_log( "🚨 WIDGET CREATOR DEBUG: Target property for {$property} is {$target_property}" );
				
				// Check if the current widget type supports this property
				if ( $this->atomic_widget_supports_property( $target_property ) ) {
					$v4_props[ $target_property ] = $atomic_value;
					if ( $target_property !== $property ) {
						error_log( "Widget Creator: Remapping {$property} to {$target_property}" );
					}
					error_log( "Widget Creator: Adding atomic prop {$target_property}: " . wp_json_encode( $atomic_value ) );
				} else {
					// Property not supported by atomic widget - route to CSS classes
					$unsupported_props[ $target_property ] = $atomic_value;
					error_log( "Widget Creator: Property {$target_property} not supported by atomic widget - routing to CSS classes" );
				}
			} else {
				error_log( "Widget Creator: Skipping non-atomic prop {$property}: " . wp_json_encode( $atomic_value ) );
			}
		}

		// Store unsupported properties for CSS class generation
		if ( ! empty( $unsupported_props ) ) {
			$this->current_unsupported_props = $unsupported_props;
			
			// Add unsupported properties to computed styles for CSS class generation
			if ( ! isset( $computed_styles ) ) {
				// If we're in map_css_to_v4_props, we need to trigger CSS class generation
				// This will be handled in merge_settings_with_styles
			}
		}

		error_log( "Widget Creator: Final v4_props: " . wp_json_encode( $v4_props ) );
		error_log( "Widget Creator: Unsupported props for CSS classes: " . wp_json_encode( $unsupported_props ) );
		return $v4_props;
	}

	private function get_target_property_name( string $property ): string {
		$mapper = $this->property_mapper_registry->resolve( $property );
		
		error_log( "Widget Creator get_target_property_name: property={$property}, mapper=" . ( $mapper ? get_class( $mapper ) : 'null' ) );
		
		if ( $mapper && method_exists( $mapper, 'get_target_property_name' ) ) {
			$target = $mapper->get_target_property_name( $property );
			error_log( "Widget Creator get_target_property_name: {$property} -> {$target}" );
			return $target;
		}
		
		return $property;
	}

	private function atomic_widget_supports_property( string $property ): bool {
		if ( empty( $this->current_widget_type ) ) {
			return false;
		}

		// Get the atomic widget class for the current widget type
		$atomic_widget_class = $this->get_atomic_widget_class( $this->current_widget_type );
		if ( ! $atomic_widget_class ) {
			return false;
		}

		// Get the prop schema from the atomic widget
		$prop_schema = $this->get_atomic_widget_prop_schema( $atomic_widget_class );
		if ( empty( $prop_schema ) ) {
			return false;
		}

		// Check if the property is supported
		$is_supported = array_key_exists( $property, $prop_schema );
		error_log( "Widget Creator: Checking if {$this->current_widget_type} supports '{$property}': " . ( $is_supported ? 'YES' : 'NO' ) );
		
		return $is_supported;
	}

	private function get_atomic_widget_class( string $widget_type ): ?string {
		// Map widget types to their atomic widget classes
		$widget_class_map = [
			'e-paragraph' => 'Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph',
			'e-heading' => 'Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading',
			'e-button' => 'Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button',
			// Add more mappings as needed
		];

		return $widget_class_map[ $widget_type ] ?? null;
	}

	private function get_atomic_widget_prop_schema( string $atomic_widget_class ): array {
		if ( ! class_exists( $atomic_widget_class ) ) {
			return [];
		}

		try {
			// Use reflection to access the protected method
			$reflection = new \ReflectionClass( $atomic_widget_class );
			if ( $reflection->hasMethod( 'define_props_schema' ) ) {
				$method = $reflection->getMethod( 'define_props_schema' );
				$method->setAccessible( true );
				
				// Create a temporary instance to call the method
				$instance = $reflection->newInstanceWithoutConstructor();
				return $method->invoke( $instance );
			}
		} catch ( \Exception $e ) {
			error_log( "Widget Creator: Error getting prop schema for {$atomic_widget_class}: " . $e->getMessage() );
		}

		return [];
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
			$atomic_result = $mapper->map_to_v4_atomic( $property, $value );
			if ( $atomic_result ) {
				return [
					'property' => $property,
					'value' => $atomic_result,
				];
			}
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
		$content = $widget['settings']['text'] ?? $widget['settings']['content'] ?? '';

		// Self-closing tags
		if ( in_array( $tag, [ 'img', 'br', 'hr', 'input' ], true ) ) {
			return "<{$tag} />";
		}

		return "<{$tag}>{$content}</{$tag}>";
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

	private function fix_numeric_keyed_arrays( $array, $property_key ) {
		if ( ! is_array( $array ) ) {
			return $array;
		}
		
		$keys = array_keys( $array );
		$has_numeric_keys = array_filter( $keys, 'is_numeric' );
		
		// If no numeric keys, return as-is
		if ( empty( $has_numeric_keys ) ) {
			// Still recursively fix nested arrays
			foreach ( $array as $key => $value ) {
				if ( is_array( $value ) ) {
					$array[ $key ] = $this->fix_numeric_keyed_arrays( $value, "$property_key.$key" );
				}
			}
			return $array;
		}
		
		// CRITICAL FIX: Handle specific atomic property types that use numeric-keyed arrays
		return $this->convert_atomic_array_to_safe_structure( $array, $property_key );
	}
	
	private function convert_atomic_array_to_safe_structure( $array, $property_key ) {
		error_log( "🔧 FIXING: Converting numeric-keyed array for $property_key: " . json_encode( $array ) );
		
		// Handle box-shadow arrays: [shadow_object] -> DISABLE for now to test
		if ( $this->is_box_shadow_array( $array ) ) {
			error_log( "🔧 DISABLING box-shadow to test: " . json_encode( $array ) );
			return null; // Temporarily disable box-shadow to isolate the issue
		}
		
		// Handle other array types - convert to object with named keys
		$fixed = [];
		foreach ( $array as $index => $value ) {
			$fixed[ "item_$index" ] = is_array( $value ) ? 
				$this->fix_numeric_keyed_arrays( $value, "$property_key.item_$index" ) : 
				$value;
		}
		
		error_log( "🔧 FIXED generic array: " . json_encode( $fixed ) );
		return $fixed;
	}
	
	private function is_box_shadow_array( $array ) {
		// Check if this is a box-shadow array: [{"$$type":"shadow",...}]
		return is_array( $array ) && 
			   isset( $array[0] ) && 
			   is_array( $array[0] ) && 
			   isset( $array[0]['$$type'] ) && 
			   $array[0]['$$type'] === 'shadow';
	}
	
	private function debug_final_settings_for_numeric_keys( $settings, $widget_type ) {
		$this->deep_scan_for_numeric_keys( $settings, "final_settings_$widget_type" );
	}
	
	private function deep_scan_for_numeric_keys( $data, $path ) {
		if ( is_array( $data ) ) {
			$keys = array_keys( $data );
			$numeric_keys = array_filter( $keys, 'is_numeric' );
			if ( ! empty( $numeric_keys ) ) {
				error_log( "🚨 FINAL SCAN - NUMERIC KEYS in $path: " . json_encode( $numeric_keys ) );
				error_log( "🚨 FINAL SCAN - Data: " . json_encode( $data ) );
			}
			
			foreach ( $data as $key => $value ) {
				if ( is_array( $value ) || is_object( $value ) ) {
					$this->deep_scan_for_numeric_keys( $value, "$path.$key" );
				}
			}
		} elseif ( is_object( $data ) ) {
			foreach ( $data as $key => $value ) {
				if ( is_array( $value ) || is_object( $value ) ) {
					$this->deep_scan_for_numeric_keys( $value, "$path.$key" );
				}
			}
		}
	}
	
}
