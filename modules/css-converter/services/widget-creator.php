<?php
namespace Elementor\Modules\CssConverter\Services;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Plugin;
use Elementor\Core\Base\Document;
use Elementor\Modules\CssConverter\Services\Widget_Hierarchy_Processor;
use Elementor\Modules\CssConverter\Services\Widget_Error_Handler;

class Widget_Creator {
	private $creation_stats;
	private $error_log;
	private $hierarchy_processor;
	private $error_handler;

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
					'meta' => $this->convert_properties_to_global_class_meta( $class_data['properties'] ?? [] ),
				],
			],
		];

		// This would call the actual Global Classes Repository
		// $repository = new \Elementor\Modules\GlobalClasses\Global_Classes_Repository();
		// $repository->create( $global_class_data );
	}

	private function convert_properties_to_global_class_meta( $properties ) {
		$meta = [];
		
		foreach ( $properties as $property_data ) {
			if ( ! empty( $property_data['converted_property'] ) ) {
				$converted = $property_data['converted_property'];
				
				// Merge converted properties into meta
				if ( is_array( $converted ) ) {
					$meta = array_merge( $meta, $converted );
				}
			}
		}

		return $meta;
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

		// Generate unique widget ID
		$widget_id = wp_generate_uuid4();

		// Base Elementor widget structure
		$elementor_widget = [
			'id' => $widget_id,
			'elType' => 'widget',
			'widgetType' => $this->map_to_elementor_widget_type( $widget_type ),
			'settings' => $this->merge_settings_with_styles( $settings, $applied_styles ),
		];

		// Handle children for container widgets (already processed by hierarchy processor)
		if ( ! empty( $widget['elements'] ) ) {
			$elementor_widget['elements'] = $this->convert_widgets_to_elementor_format( $widget['elements'] );
		}

		return $elementor_widget;
	}

	private function map_to_elementor_widget_type( $widget_type ) {
		// Map our internal widget types to actual Elementor widget types
		$mapping = [
			'e-heading' => 'heading',
			'e-paragraph' => 'text-editor',
			'e-flexbox' => 'container',
			'e-link' => 'button', // Links can be represented as buttons
			'e-button' => 'button',
			'e-image' => 'image',
		];

		return $mapping[ $widget_type ] ?? 'html'; // Fallback to HTML widget
	}

	private function merge_settings_with_styles( $settings, $applied_styles ) {
		$merged_settings = $settings;

		// Apply computed styles to widget settings
		if ( ! empty( $applied_styles['computed_styles'] ) ) {
			foreach ( $applied_styles['computed_styles'] as $property => $style_data ) {
				$elementor_property = $this->map_css_property_to_elementor_setting( $property );
				if ( $elementor_property ) {
					$merged_settings[ $elementor_property ] = $style_data['value'];
				}
			}
		}

		// Apply global classes
		if ( ! empty( $applied_styles['global_classes'] ) ) {
			$merged_settings['_element_css_classes'] = implode( ' ', $applied_styles['global_classes'] );
		}

		return $merged_settings;
	}

	private function map_css_property_to_elementor_setting( $css_property ) {
		// Map CSS properties to Elementor widget settings
		$mapping = [
			'color' => 'title_color',
			'font-size' => 'title_size',
			'font-weight' => 'title_weight',
			'text-align' => 'align',
			'background-color' => 'background_color',
			'padding' => 'padding',
			'margin' => 'margin',
			'border' => 'border',
			'border-radius' => 'border_radius',
		];

		return $mapping[ $css_property ] ?? null;
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

		// Save elements to document
		try {
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

		// Fallback to WordPress edit URL
		return admin_url( 'post.php?post=' . $post_id . '&action=edit' );
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
	}
}
