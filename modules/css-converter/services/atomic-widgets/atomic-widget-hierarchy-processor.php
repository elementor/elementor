<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widget_Hierarchy_Processor {
	
	private array $processed_widget_ids = [];
	
	public function process_widget_hierarchy( array $widgets ): array {
		$this->processed_widget_ids = [];
		
		return $this->process_widgets_recursively( $widgets );
	}
	
	private function process_widgets_recursively( array $widgets ): array {
		$processed = [];
		
		foreach ( $widgets as $widget ) {
			$processed_widget = $this->process_single_widget( $widget );
			
			if ( $processed_widget !== null ) {
				$processed[] = $processed_widget;
			}
		}
		
		return $processed;
	}
	
	private function process_single_widget( array $widget ): ?array {
		if ( $this->has_circular_reference( $widget ) ) {
			error_log( "CSS Converter: Circular reference detected for widget: " . ( $widget['id'] ?? 'unknown' ) );
			return null;
		}
		
		$this->processed_widget_ids[] = $widget['id'];
		
		$processed_widget = $this->apply_widget_processing( $widget );
		
		if ( ! empty( $widget['elements'] ) ) {
			$processed_widget['elements'] = $this->process_widgets_recursively( $widget['elements'] );
		}
		
		return $processed_widget;
	}
	
	private function has_circular_reference( array $widget ): bool {
		$widget_id = $widget['id'] ?? '';
		
		return in_array( $widget_id, $this->processed_widget_ids, true );
	}
	
	private function apply_widget_processing( array $widget ): array {
		$widget_type = $widget['widgetType'] ?? '';
		
		switch ( $widget_type ) {
			case 'e-heading':
				return $this->process_heading_widget( $widget );
				
			case 'e-paragraph':
				return $this->process_paragraph_widget( $widget );
				
			case 'e-button':
				return $this->process_button_widget( $widget );
				
			case 'e-image':
				return $this->process_image_widget( $widget );
				
			case 'e-flexbox':
				return $this->process_flexbox_widget( $widget );
				
			default:
				return $widget;
		}
	}
	
	private function process_heading_widget( array $widget ): array {
		$settings = $widget['settings'] ?? [];
		
		if ( empty( $settings['title'] ) || $settings['title'] === 'This is a title' ) {
			$text_content = $this->extract_text_from_settings( $settings );
			
			if ( ! empty( $text_content ) ) {
				$settings['title'] = $text_content;
			}
		}
		
		$widget['settings'] = $settings;
		
		return $widget;
	}
	
	private function process_paragraph_widget( array $widget ): array {
		$settings = $widget['settings'] ?? [];
		
		if ( empty( $settings['paragraph'] ) || $settings['paragraph'] === 'Type your paragraph here' ) {
			$text_content = $this->extract_text_from_settings( $settings );
			
			if ( ! empty( $text_content ) ) {
				$settings['paragraph'] = $text_content;
			}
		}
		
		$widget['settings'] = $settings;
		
		return $widget;
	}
	
	private function process_button_widget( array $widget ): array {
		$settings = $widget['settings'] ?? [];
		
		if ( empty( $settings['text'] ) || $settings['text'] === 'Button' ) {
			$text_content = $this->extract_text_from_settings( $settings );
			
			if ( ! empty( $text_content ) ) {
				$settings['text'] = $text_content;
			}
		}
		
		$widget['settings'] = $settings;
		
		return $widget;
	}
	
	private function process_image_widget( array $widget ): array {
		$settings = $widget['settings'] ?? [];
		
		if ( empty( $settings['alt'] ) ) {
			$settings['alt'] = $this->generate_alt_text_from_src( $settings['src'] ?? '' );
		}
		
		$widget['settings'] = $settings;
		
		return $widget;
	}
	
	private function process_flexbox_widget( array $widget ): array {
		$settings = $widget['settings'] ?? [];
		
		$settings = $this->apply_flexbox_defaults( $settings );
		
		$widget['settings'] = $settings;
		
		return $widget;
	}
	
	private function extract_text_from_settings( array $settings ): string {
		if ( isset( $settings['text'] ) && is_string( $settings['text'] ) ) {
			return trim( $settings['text'] );
		}
		
		if ( isset( $settings['attributes']['data-text'] ) ) {
			return trim( $settings['attributes']['data-text'] );
		}
		
		return '';
	}
	
	private function generate_alt_text_from_src( string $src ): string {
		if ( empty( $src ) ) {
			return '';
		}
		
		$filename = basename( parse_url( $src, PHP_URL_PATH ) );
		$name_without_extension = pathinfo( $filename, PATHINFO_FILENAME );
		
		return ucwords( str_replace( [ '-', '_' ], ' ', $name_without_extension ) );
	}
	
	private function apply_flexbox_defaults( array $settings ): array {
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
	
	public function validate_widget_structure( array $widget ): bool {
		$required_fields = [ 'id', 'elType', 'widgetType', 'settings' ];
		
		foreach ( $required_fields as $field ) {
			if ( ! array_key_exists( $field, $widget ) ) {
				return false;
			}
		}
		
		if ( ! empty( $widget['elements'] ) && ! is_array( $widget['elements'] ) ) {
			return false;
		}
		
		return true;
	}
	
	public function get_widget_hierarchy_depth( array $widgets ): int {
		$max_depth = 0;
		
		foreach ( $widgets as $widget ) {
			$depth = $this->calculate_widget_depth( $widget, 1 );
			$max_depth = max( $max_depth, $depth );
		}
		
		return $max_depth;
	}
	
	private function calculate_widget_depth( array $widget, int $current_depth ): int {
		if ( empty( $widget['elements'] ) ) {
			return $current_depth;
		}
		
		$max_child_depth = $current_depth;
		
		foreach ( $widget['elements'] as $child_widget ) {
			$child_depth = $this->calculate_widget_depth( $child_widget, $current_depth + 1 );
			$max_child_depth = max( $max_child_depth, $child_depth );
		}
		
		return $max_child_depth;
	}
}
