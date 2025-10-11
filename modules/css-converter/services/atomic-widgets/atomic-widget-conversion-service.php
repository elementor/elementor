<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widget_Conversion_Service {
	
	private Atomic_Html_Parser $html_parser;
	private Atomic_Widget_Factory $widget_factory;
	private Atomic_Widget_Hierarchy_Processor $hierarchy_processor;
	private Conversion_Result_Builder $result_builder;
	
	public function __construct() {
		$this->html_parser = new Atomic_Html_Parser();
		$this->widget_factory = new Atomic_Widget_Factory();
		$this->hierarchy_processor = new Atomic_Widget_Hierarchy_Processor();
		$this->result_builder = new Conversion_Result_Builder();
	}
	
	public function convert_html_to_widgets( string $html, array $options = [] ): array {
		if ( empty( trim( $html ) ) ) {
			return $this->result_builder->build_empty_result();
		}
		
		$parsed_elements = $this->parse_html_safely( $html );
		if ( empty( $parsed_elements ) ) {
			return $this->result_builder->build_parsing_failed_result();
		}
		
		$widgets = $this->create_widgets_from_elements( $parsed_elements );
		$processed_widgets = $this->hierarchy_processor->process_widget_hierarchy( $widgets );
		
		return $this->result_builder->build_success_result( 
			$processed_widgets, 
			$parsed_elements 
		);
	}
	
	private function parse_html_safely( string $html ): array {
		if ( ! $this->html_parser->can_parse( $html ) ) {
			return [];
		}
		
		return $this->html_parser->parse( $html );
	}
	
	private function create_widgets_from_elements( array $elements ): array {
		$widgets = [];
		
		foreach ( $elements as $element ) {
			$widget = $this->create_widget_from_element( $element );
			
			if ( $widget !== null ) {
				$widgets[] = $widget;
			}
		}
		
		return $widgets;
	}
	
	private function create_widget_from_element( array $element ): ?array {
		$widget_type = $element['widget_type'] ?? '';
		
		if ( ! $this->is_valid_widget_type( $widget_type ) ) {
			return null;
		}
		
		$widget = $this->widget_factory->create_widget( $widget_type, $element );
		if ( null === $widget ) {
			return null;
		}
		
		return $this->add_child_widgets_if_needed( $widget, $element );
	}
	
	private function is_valid_widget_type( string $widget_type ): bool {
		if ( empty( $widget_type ) ) {
			return false;
		}
		
		return $this->widget_factory->supports_widget_type( $widget_type );
	}
	
	private function add_child_widgets_if_needed( array $widget, array $element ): array {
		if ( empty( $element['children'] ) ) {
			return $widget;
		}
		
		$child_widgets = $this->create_widgets_from_elements( $element['children'] );
		$widget['elements'] = $child_widgets;
		
		return $widget;
	}
	
	
	public function get_supported_widget_types(): array {
		return $this->widget_factory->get_supported_widget_types();
	}
}
