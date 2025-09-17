<?php
namespace Elementor\Modules\CssConverter\Services\Widget;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Hierarchy_Processor {
	private $processing_stats;
	private $error_log;

	public function __construct() {
		$this->processing_stats = [
			'total_widgets' => 0,
			'parent_widgets' => 0,
			'child_widgets' => 0,
			'depth_levels' => 0,
			'hierarchy_errors' => 0,
		];
		$this->error_log = [];
	}

	public function process_widget_hierarchy( $widgets ) {
		// HVV Requirement: Process in dependency order - Parent → Children
		
		$this->processing_stats['total_widgets'] = count( $widgets );
		
		// Step 1: Widgets already have hierarchy structure from Widget Mapper
		// No need to rebuild hierarchy tree - use existing nested structure
		
		// Step 2: Process widgets in dependency order (parents first)
		$processed_widgets = $this->process_tree_hierarchically( $widgets );
		
		// Step 3: Validate hierarchy integrity
		$this->validate_hierarchy_integrity( $processed_widgets );
		
		return [
			'widgets' => $processed_widgets,
			'stats' => $this->processing_stats,
			'errors' => $this->error_log,
		];
	}

	private function build_hierarchy_tree( $widgets ) {
		$tree = [];
		$widget_map = [];
		
		// First pass: Create widget map and identify root widgets
		foreach ( $widgets as $widget ) {
			$widget_id = $widget['id'] ?? $this->generate_widget_id( $widget );
			$widget['id'] = $widget_id;
			$widget['children'] = [];
			$widget_map[ $widget_id ] = $widget;
			
			// Root widgets have no parent or parent_id is null/empty
			if ( empty( $widget['parent_id'] ) ) {
				$tree[] = &$widget_map[ $widget_id ];
			}
		}
		
		// Second pass: Build parent-child relationships
		foreach ( $widget_map as $widget_id => $widget ) {
			if ( ! empty( $widget['parent_id'] ) ) {
				$parent_id = $widget['parent_id'];
				
				if ( isset( $widget_map[ $parent_id ] ) ) {
					$widget_map[ $parent_id ]['children'][] = &$widget_map[ $widget_id ];
				} else {
					// Orphaned widget - add to root level
					$this->error_log[] = [
						'type' => 'orphaned_widget',
						'widget_id' => $widget_id,
						'missing_parent_id' => $parent_id,
						'message' => "Widget {$widget_id} references missing parent {$parent_id}",
					];
					$tree[] = &$widget_map[ $widget_id ];
				}
			}
		}
		
		return $tree;
	}

	private function process_tree_hierarchically( $tree, $depth = 0 ) {
		$processed_widgets = [];
		
		$this->processing_stats['depth_levels'] = max( $this->processing_stats['depth_levels'], $depth );
		
		foreach ( $tree as $widget ) {
			try {
				// Process current widget
				$processed_widget = $this->process_single_widget( $widget, $depth );
				
				// Count widget types
				if ( $depth === 0 ) {
					$this->processing_stats['parent_widgets']++;
				} else {
					$this->processing_stats['child_widgets']++;
				}
				
				// Process children recursively
				if ( ! empty( $widget['children'] ) ) {
					$processed_children = $this->process_tree_hierarchically( $widget['children'], $depth + 1 );
					$processed_widget['elements'] = $processed_children;
				}
				
				$processed_widgets[] = $processed_widget;
				
			} catch ( \Exception $e ) {
				$this->handle_hierarchy_processing_error( $widget, $e, $depth );
			}
		}
		
		return $processed_widgets;
	}

	private function process_single_widget( $widget, $depth ) {
		// Add hierarchy metadata to widget
		$widget['hierarchy_depth'] = $depth;
		$widget['is_parent'] = ! empty( $widget['children'] );
		$widget['processing_order'] = $this->calculate_processing_order( $widget, $depth );
		
		// Validate widget structure
		$this->validate_widget_structure( $widget );
		
		// Apply hierarchy-specific processing
		if ( $widget['is_parent'] ) {
			$widget = $this->process_parent_widget( $widget );
		} else {
			$widget = $this->process_child_widget( $widget );
		}
		
		return $widget;
	}

	private function process_parent_widget( $widget ) {
		// Special processing for parent/container widgets
		
		// Ensure e-flexbox widgets have proper layout settings
		if ( 'e-flexbox' === $widget['widget_type'] ) {
			$widget['settings'] = $this->apply_container_defaults( $widget['settings'] ?? [] );
		}
		
		// Apply parent-specific styling
		if ( ! empty( $widget['applied_styles'] ) ) {
			$widget['settings'] = $this->apply_parent_styles( $widget['settings'], $widget['applied_styles'] );
		}
		
		return $widget;
	}

	private function process_child_widget( $widget ) {
		// Special processing for child/content widgets
		
		// Apply child-specific styling
		if ( ! empty( $widget['applied_styles'] ) ) {
			$widget['settings'] = $this->apply_child_styles( $widget['settings'], $widget['applied_styles'] );
		}
		
		// Ensure content widgets have proper content settings
		if ( in_array( $widget['widget_type'], [ 'e-heading', 'e-text', 'e-button' ], true ) ) {
			$widget['settings'] = $this->apply_content_defaults( $widget['settings'], $widget );
		}
		
		return $widget;
	}

	private function apply_container_defaults( $settings ) {
		// Apply default e-flexbox settings for Elementor v4 atomic widgets
		$defaults = [
			'direction' => 'column',
			'wrap' => 'nowrap',
			'justify_content' => 'flex-start',
			'align_items' => 'stretch',
			'gap' => [
				'column' => '0',
				'row' => '0',
			],
		];
		
		return array_merge( $defaults, $settings );
	}

	private function apply_parent_styles( $settings, $applied_styles ) {
		// v4 Atomic Widgets: Most styling is handled in Widget Creator's convert_styles_to_v4_format()
		// This method now only handles layout configuration settings, not visual styling
		
		if ( ! empty( $applied_styles['computed_styles'] ) ) {
			foreach ( $applied_styles['computed_styles'] as $property => $style_data ) {
				switch ( $property ) {
					case 'flex-direction':
						// Layout configuration setting for e-flexbox
						$settings['direction'] = $style_data['value'];
						break;
					case 'justify-content':
						// Layout configuration setting for e-flexbox
						$settings['justify_content'] = $this->map_css_justify_content( $style_data['value'] );
						break;
					case 'align-items':
						// Layout configuration setting for e-flexbox
						$settings['align_items'] = $this->map_css_align_items( $style_data['value'] );
						break;
					case 'gap':
						// Layout configuration setting for e-flexbox
						$settings['gap'] = $style_data['value'];
						break;
					// Removed: display, padding, margin - these are styling properties, handled in v4 styles array
				}
			}
		}
		
		return $settings;
	}

	private function apply_child_styles( $settings, $applied_styles ) {
		// v4 Atomic Widgets: All styling is handled in Widget Creator's convert_styles_to_v4_format()
		// This method is now a no-op as child widget styling goes into the styles array, not settings
		
		// All visual styling (color, font-size, font-weight, text-align, line-height, etc.)
		// is now handled by the v4 atomic styling system in Widget Creator
		
		return $settings;
	}

	private function apply_content_defaults( $settings, $widget ) {
		// Apply default content settings based on widget type
		
		switch ( $widget['widget_type'] ) {
			case 'e-heading':
				$defaults = [
					'title' => $widget['settings']['text'] ?? 'This is a title',
					'tag' => $widget['settings']['tag'] ?? 'h2',
					'classes' => [],
					'link' => null,
					'attributes' => null,
				];
				break;
			case 'e-paragraph':
				$defaults = [
					'paragraph' => $widget['settings']['text'] ?? 'Type your paragraph here',
					'classes' => [],
					'link' => null,
					'attributes' => null,
				];
				break;
			case 'e-button':
				$defaults = [
					'text' => $widget['settings']['text'] ?? 'Button',
					'classes' => [],
					'link' => [
						'url' => $widget['attributes']['href'] ?? '#',
						'is_external' => false,
						'nofollow' => false,
					],
					'attributes' => null,
				];
				break;
			case 'e-image':
				$defaults = [
					'image' => [
						'url' => $widget['attributes']['src'] ?? '',
						'alt' => $widget['attributes']['alt'] ?? '',
					],
					'classes' => [],
					'attributes' => null,
				];
				break;
			default:
				$defaults = [];
		}
		
		return array_merge( $defaults, $settings );
	}

	private function validate_widget_structure( $widget ) {
		$required_fields = [ 'widget_type', 'settings' ];
		
		foreach ( $required_fields as $field ) {
			if ( ! isset( $widget[ $field ] ) ) {
				throw new \Exception( "Widget missing required field: {$field}" );
			}
		}
		
		// Validate widget type
		$supported_types = [ 'e-heading', 'e-text', 'e-paragraph', 'e-flexbox', 'e-button', 'e-image', 'e-link' ];
		if ( ! in_array( $widget['widget_type'], $supported_types, true ) ) {
			throw new \Exception( "Unsupported widget type: {$widget['widget_type']}" );
		}
	}

	private function validate_hierarchy_integrity( $processed_widgets ) {
		// Validate that hierarchy is properly formed
		$this->validate_no_circular_references( $processed_widgets );
		$this->validate_depth_limits( $processed_widgets );
		$this->validate_parent_child_compatibility( $processed_widgets );
	}

	private function validate_no_circular_references( $widgets, $visited = [], $path = [] ) {
		foreach ( $widgets as $index => $widget ) {
			// Use a combination of widget type and position as identifier since widgets don't have IDs yet
			$widget_identifier = $widget['widget_type'] . '_' . $index;
			
			if ( in_array( $widget_identifier, $path, true ) ) {
				throw new \Exception( "Circular reference detected in widget hierarchy: " . implode( ' -> ', $path ) . ' -> ' . $widget_identifier );
			}
			
			if ( ! in_array( $widget_identifier, $visited, true ) ) {
				$visited[] = $widget_identifier;
				$new_path = array_merge( $path, [ $widget_identifier ] );
				
				if ( ! empty( $widget['elements'] ) ) {
					$this->validate_no_circular_references( $widget['elements'], $visited, $new_path );
				}
			}
		}
	}

	private function validate_depth_limits( $widgets, $current_depth = 0 ) {
		$max_depth = apply_filters( 'elementor_widget_converter_max_depth', 10 );
		
		if ( $current_depth > $max_depth ) {
			throw new \Exception( "Widget hierarchy exceeds maximum depth of {$max_depth}" );
		}
		
		foreach ( $widgets as $widget ) {
			if ( ! empty( $widget['elements'] ) ) {
				$this->validate_depth_limits( $widget['elements'], $current_depth + 1 );
			}
		}
	}

	private function validate_parent_child_compatibility( $widgets ) {
		foreach ( $widgets as $widget ) {
			if ( ! empty( $widget['elements'] ) ) {
				$this->validate_parent_can_contain_children( $widget );
				$this->validate_parent_child_compatibility( $widget['elements'] );
			}
		}
	}

	private function validate_parent_can_contain_children( $parent_widget ) {
		$container_types = [ 'e-flexbox' ];
		
		if ( ! in_array( $parent_widget['widget_type'], $container_types, true ) ) {
			$this->error_log[] = [
				'type' => 'invalid_parent_child_relationship',
				'parent_type' => $parent_widget['widget_type'],
				'message' => "Widget type {$parent_widget['widget_type']} cannot contain child widgets",
			];
		}
	}

	private function handle_hierarchy_processing_error( $widget, $exception, $depth ) {
		$this->processing_stats['hierarchy_errors']++;
		
		$error_data = [
			'type' => 'hierarchy_processing_error',
			'widget_id' => $widget['id'] ?? 'unknown',
			'widget_type' => $widget['widget_type'] ?? 'unknown',
			'depth' => $depth,
			'error' => $exception->getMessage(),
		];
		
		$this->error_log[] = $error_data;
		
		// Re-throw for now, but could implement graceful degradation here
		throw $exception;
	}

	private function calculate_processing_order( $widget, $depth ) {
		// Calculate processing order based on depth and widget type
		$base_order = $depth * 1000;
		
		// Container widgets get processed first within their depth level
		if ( 'e-flexbox' === $widget['widget_type'] ) {
			$base_order += 100;
		}
		
		return $base_order;
	}

	private function generate_widget_id( $widget ) {
		return 'widget_' . wp_generate_uuid4();
	}

	// Helper methods for CSS value mapping
	private function map_css_justify_content( $value ) {
		$mapping = [
			'flex-start' => 'flex-start',
			'flex-end' => 'flex-end',
			'center' => 'center',
			'space-between' => 'space-between',
			'space-around' => 'space-around',
			'space-evenly' => 'space-evenly',
		];
		
		return $mapping[ $value ] ?? 'flex-start';
	}

	private function map_css_align_items( $value ) {
		$mapping = [
			'flex-start' => 'flex-start',
			'flex-end' => 'flex-end',
			'center' => 'center',
			'stretch' => 'stretch',
			'baseline' => 'baseline',
		];
		
		return $mapping[ $value ] ?? 'stretch';
	}


	private function determine_heading_size( $tag ) {
		$sizes = [
			'h1' => 'xxl',
			'h2' => 'xl',
			'h3' => 'large',
			'h4' => 'medium',
			'h5' => 'small',
			'h6' => 'xs',
		];
		
		return $sizes[ $tag ] ?? 'large';
	}

	private function map_heading_tag_to_size( $tag ) {
		return str_replace( 'h', '', $tag );
	}

	public function get_processing_stats() {
		return $this->processing_stats;
	}

	public function get_error_log() {
		return $this->error_log;
	}
}
