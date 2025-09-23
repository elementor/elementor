<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Conversion_Stats_Calculator {
	
	private Atomic_Widget_Factory $widget_factory;
	
	public function __construct() {
		$this->widget_factory = new Atomic_Widget_Factory();
	}
	
	public function calculate_stats( array $parsed_elements, array $processed_widgets ): array {
		return [
			'total_elements_parsed' => $this->count_elements_recursively( $parsed_elements ),
			'total_widgets_created' => $this->count_widgets_recursively( $processed_widgets ),
			'widget_types_created' => $this->get_widget_type_counts( $processed_widgets ),
			'supported_elements' => $this->count_supported_elements( $parsed_elements ),
			'unsupported_elements' => $this->count_unsupported_elements( $parsed_elements ),
		];
	}
	
	private function count_elements_recursively( array $elements ): int {
		$count = count( $elements );
		
		foreach ( $elements as $element ) {
			if ( $this->has_children( $element ) ) {
				$count += $this->count_elements_recursively( $element['children'] );
			}
		}
		
		return $count;
	}
	
	private function count_widgets_recursively( array $widgets ): int {
		$count = count( $widgets );
		
		foreach ( $widgets as $widget ) {
			if ( $this->widget_has_elements( $widget ) ) {
				$count += $this->count_widgets_recursively( $widget['elements'] );
			}
		}
		
		return $count;
	}
	
	private function get_widget_type_counts( array $widgets ): array {
		$counts = [];
		
		foreach ( $widgets as $widget ) {
			$widget_type = $this->extract_widget_type( $widget );
			$counts[ $widget_type ] = $this->increment_count( $counts, $widget_type );
			
			if ( $this->widget_has_elements( $widget ) ) {
				$child_counts = $this->get_widget_type_counts( $widget['elements'] );
				$counts = $this->merge_counts( $counts, $child_counts );
			}
		}
		
		return $counts;
	}
	
	private function count_supported_elements( array $elements ): int {
		$count = 0;
		
		foreach ( $elements as $element ) {
			if ( $this->is_element_supported( $element ) ) {
				$count++;
			}
			
			if ( $this->has_children( $element ) ) {
				$count += $this->count_supported_elements( $element['children'] );
			}
		}
		
		return $count;
	}
	
	private function count_unsupported_elements( array $elements ): int {
		$count = 0;
		
		foreach ( $elements as $element ) {
			if ( ! $this->is_element_supported( $element ) ) {
				$count++;
			}
			
			if ( $this->has_children( $element ) ) {
				$count += $this->count_unsupported_elements( $element['children'] );
			}
		}
		
		return $count;
	}
	
	private function has_children( array $element ): bool {
		return ! empty( $element['children'] ) && is_array( $element['children'] );
	}
	
	private function widget_has_elements( array $widget ): bool {
		return ! empty( $widget['elements'] ) && is_array( $widget['elements'] );
	}
	
	private function extract_widget_type( array $widget ): string {
		return $widget['widgetType'] ?? 'unknown';
	}
	
	private function increment_count( array $counts, string $widget_type ): int {
		return ( $counts[ $widget_type ] ?? 0 ) + 1;
	}
	
	private function merge_counts( array $counts, array $child_counts ): array {
		foreach ( $child_counts as $type => $count ) {
			$counts[ $type ] = ( $counts[ $type ] ?? 0 ) + $count;
		}
		
		return $counts;
	}
	
	private function is_element_supported( array $element ): bool {
		$widget_type = $element['widget_type'] ?? '';
		
		return $this->widget_factory->supports_widget_type( $widget_type );
	}
}
