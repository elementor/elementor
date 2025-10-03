<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widgets_Orchestrator {

	private Atomic_Data_Parser $data_parser;
	private Atomic_Widget_JSON_Creator $json_creator;
	private Widget_Styles_Integrator $styles_integrator;
	private Conversion_Stats_Calculator $stats_calculator;
	private Error_Handler $error_handler;
	private Performance_Monitor $performance_monitor;

	public function __construct( bool $debug_mode = false, bool $performance_monitoring = false ) {
		$this->data_parser = new Atomic_Data_Parser();
		$this->json_creator = new Atomic_Widget_JSON_Creator();
		$this->styles_integrator = new Widget_Styles_Integrator();
		$this->stats_calculator = new Conversion_Stats_Calculator();
		$this->error_handler = new Error_Handler( $debug_mode );
		$this->performance_monitor = new Performance_Monitor( $performance_monitoring );
	}

	public function convert_html_to_atomic_widgets( string $html, array $options = [] ): array {
		$this->error_handler->clear_all();
		$this->performance_monitor->clear_metrics();
		$this->performance_monitor->start_timer( 'total_conversion' );
		$this->error_handler->log_conversion_attempt( $html, $options );

		// Validate input
		if ( empty( trim( $html ) ) ) {
			$this->error_handler->add_error( 'HTML content is empty', 'input_validation' );
			return $this->build_error_result();
		}

		// Check atomic widgets availability
		if ( ! $this->is_atomic_widgets_available() ) {
			$this->error_handler->add_error( 
				'Atomic Widgets Module is not available', 
				'atomic_widgets_unavailable',
				['required_classes' => ['Widget_Builder', 'Element_Builder']]
			);
			return $this->build_error_result();
		}

		// Phase 1: Parse HTML and prepare data
		$this->performance_monitor->start_timer( 'html_parsing' );
		$widget_data_array = $this->parse_html_with_error_handling( $html );
		$this->performance_monitor->end_timer( 'html_parsing' );

		if ( empty( $widget_data_array ) ) {
			return $this->build_error_result();
		}

		// Phase 2: Create widgets using Atomic Widgets Module
		$this->performance_monitor->start_timer( 'widget_creation' );
		$widgets = $this->create_widgets_with_error_handling( $widget_data_array );
		$this->performance_monitor->end_timer( 'widget_creation' );

		if ( empty( $widgets ) ) {
			return $this->build_error_result();
		}

		// Phase 3: Integrate styles into widgets
		$this->performance_monitor->start_timer( 'styles_integration' );
		$widgets_with_styles = $this->integrate_styles_with_error_handling( $widgets, $widget_data_array );
		$this->performance_monitor->end_timer( 'styles_integration' );

		// Generate conversion stats
		$this->performance_monitor->start_timer( 'stats_calculation' );
		$stats = $this->stats_calculator->calculate_conversion_stats( $widget_data_array, $widgets_with_styles );
		$this->performance_monitor->end_timer( 'stats_calculation' );

		$this->performance_monitor->end_timer( 'total_conversion' );

		$result = $this->build_success_result( $widgets_with_styles, $stats );
		$this->error_handler->log_conversion_result( $result );

		return $result;
	}

	public function convert_html_to_global_classes( string $html, array $options = [] ): array {
		$conversion_result = $this->convert_html_to_atomic_widgets( $html, $options );
		
		if ( ! $conversion_result['success'] ) {
			return [
				'success' => false,
				'error' => $conversion_result['error'] ?? 'Conversion failed',
				'global_classes' => ['items' => [], 'order' => []],
			];
		}

		$widgets = $conversion_result['widgets'];
		$global_classes = $this->styles_integrator->create_global_classes_from_widgets( $widgets );

		return [
			'success' => true,
			'global_classes' => $global_classes,
			'stats' => $conversion_result['stats'],
		];
	}

	private function parse_html_with_error_handling( string $html ): array {
		$widget_data_array = $this->data_parser->parse_html_for_atomic_widgets( $html );
		
		if ( empty( $widget_data_array ) ) {
			$this->error_handler->add_error( 
				'HTML parsing failed or no supported elements found', 
				'html_parsing_failed',
				['html_length' => strlen( $html )]
			);
			return [];
		}

		$this->error_handler->add_warning( 
			"Parsed {count} elements from HTML", 
			'html_parsing',
			['element_count' => count( $widget_data_array )]
		);

		return $widget_data_array;
	}

	private function create_widgets_with_error_handling( array $widget_data_array ): array {
		$widgets = [];
		$failed_count = 0;

		foreach ( $widget_data_array as $index => $widget_data ) {
			$widget = $this->json_creator->create_widget_json( $widget_data );
			
			if ( $widget ) {
				$widgets[] = $widget;
			} else {
				$failed_count++;
				$this->error_handler->add_warning(
					"Failed to create widget for element {$index}",
					'widget_creation_failed',
					[
						'widget_type' => $widget_data['widget_type'] ?? 'unknown',
						'element_tag' => $widget_data['tag'] ?? 'unknown',
					]
				);
			}
		}

		if ( $failed_count > 0 ) {
			$this->error_handler->add_warning(
				"Failed to create {$failed_count} out of " . count( $widget_data_array ) . " widgets",
				'widget_creation_summary'
			);
		}

		if ( empty( $widgets ) ) {
			$this->error_handler->add_error(
				'No widgets could be created from the parsed HTML',
				'widget_creation_failed'
			);
		}

		return $widgets;
	}

	private function integrate_styles_with_error_handling( array $widgets, array $widget_data_array ): array {
		$widgets_with_styles = [];
		$styles_integrated = 0;

		error_log( 'Orchestrator: Processing ' . count( $widgets ) . ' widgets with ' . count( $widget_data_array ) . ' widget data entries' );

		foreach ( $widgets as $index => $widget ) {
			$widget_data = $widget_data_array[ $index ] ?? [];
			$atomic_props = $widget_data['atomic_props'] ?? [];

			error_log( 'Orchestrator: Widget ' . $index . ' has ' . count( $atomic_props ) . ' atomic props' );

			if ( ! empty( $atomic_props ) ) {
				$widget = $this->styles_integrator->integrate_styles_into_widget( $widget, $atomic_props );
				$styles_integrated++;
			}

			$widgets_with_styles[] = $widget;
		}

		$this->error_handler->add_warning(
			"Integrated styles for {$styles_integrated} out of " . count( $widgets ) . " widgets",
			'styles_integration'
		);

		return $widgets_with_styles;
	}

	private function build_error_result(): array {
		$result = $this->error_handler->create_error_response();
		$result['stats'] = $this->stats_calculator->get_empty_stats();
		$result['performance'] = $this->performance_monitor->get_performance_summary();
		
		return $result;
	}

	private function build_success_result( array $widgets, array $stats ): array {
		$result = [
			'success' => true,
			'widgets' => $widgets,
			'stats' => $stats,
			'performance' => $this->performance_monitor->get_performance_summary(),
		];

		// Add warnings if any
		if ( $this->error_handler->has_warnings() ) {
			$result['warnings'] = $this->error_handler->format_errors_for_response();
		}

		// Add performance warnings
		$performance_warnings = $this->performance_monitor->get_performance_warnings();
		if ( ! empty( $performance_warnings ) ) {
			$result['performance_warnings'] = $performance_warnings;
		}

		return $result;
	}

	public function validate_conversion_result( array $result ): bool {
		if ( ! isset( $result['success'] ) ) {
			return false;
		}

		if ( $result['success'] ) {
			return isset( $result['widgets'] ) && 
				   is_array( $result['widgets'] ) && 
				   isset( $result['stats'] ) && 
				   is_array( $result['stats'] );
		} else {
			return isset( $result['error'] ) && is_string( $result['error'] );
		}
	}

	public function get_supported_html_tags(): array {
		return $this->data_parser->get_widget_mapper()->get_supported_tags();
	}

	public function get_supported_widget_types(): array {
		return $this->json_creator->get_supported_widget_types();
	}

	public function is_atomic_widgets_available(): bool {
		return class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Widget_Builder' ) &&
			   class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Element_Builder' );
	}

	public function get_conversion_capabilities(): array {
		return [
			'atomic_widgets_available' => $this->is_atomic_widgets_available(),
			'supported_html_tags' => $this->get_supported_html_tags(),
			'supported_widget_types' => $this->get_supported_widget_types(),
			'supported_css_properties' => $this->data_parser->get_props_converter()->get_supported_properties(),
		];
	}

	public function set_data_parser( Atomic_Data_Parser $parser ): void {
		$this->data_parser = $parser;
	}

	public function set_json_creator( Atomic_Widget_JSON_Creator $creator ): void {
		$this->json_creator = $creator;
	}

	public function set_styles_integrator( Widget_Styles_Integrator $integrator ): void {
		$this->styles_integrator = $integrator;
	}

	public function get_data_parser(): Atomic_Data_Parser {
		return $this->data_parser;
	}

	public function get_json_creator(): Atomic_Widget_JSON_Creator {
		return $this->json_creator;
	}

	public function get_styles_integrator(): Widget_Styles_Integrator {
		return $this->styles_integrator;
	}

	public function get_error_handler(): Error_Handler {
		return $this->error_handler;
	}

	public function get_performance_monitor(): Performance_Monitor {
		return $this->performance_monitor;
	}

	public function enable_debug_mode(): void {
		$this->error_handler->enable_debug_mode();
	}

	public function enable_performance_monitoring(): void {
		$this->performance_monitor->enable();
	}

	public function get_detailed_performance_metrics(): array {
		return $this->performance_monitor->get_detailed_metrics();
	}

	public function is_performance_acceptable( array $thresholds = [] ): bool {
		return $this->performance_monitor->is_performance_acceptable( $thresholds );
	}

	public function convert_with_validation( string $html, array $options = [] ): array {
		$result = $this->convert_html_to_atomic_widgets( $html, $options );
		
		// Additional validation
		if ( $result['success'] ) {
			$validation_errors = $this->validate_widgets( $result['widgets'] );
			if ( ! empty( $validation_errors ) ) {
				$result['validation_errors'] = $validation_errors;
			}
		}

		return $result;
	}

	private function validate_widgets( array $widgets ): array {
		$validation_errors = [];

		foreach ( $widgets as $index => $widget ) {
			$widget_type = $widget['widgetType'] ?? $widget['elType'] ?? '';
			
			if ( ! $this->json_creator->is_widget_type_supported( $widget_type ) ) {
				$validation_errors[] = "Widget {$index}: Unsupported widget type '{$widget_type}'";
				continue;
			}

			// Validate widget structure
			if ( ! $this->validate_widget_structure( $widget ) ) {
				$validation_errors[] = "Widget {$index}: Invalid widget structure";
			}

			// Validate against atomic widget schema if available
			if ( ! $this->json_creator->validate_widget_against_schema( $widget, $widget_type ) ) {
				$validation_errors[] = "Widget {$index}: Failed atomic widget schema validation";
			}

			// Recursively validate child widgets
			if ( ! empty( $widget['elements'] ) ) {
				$child_errors = $this->validate_widgets( $widget['elements'] );
				foreach ( $child_errors as $error ) {
					$validation_errors[] = "Widget {$index} -> {$error}";
				}
			}
		}

		return $validation_errors;
	}

	private function validate_widget_structure( array $widget ): bool {
		$required_fields = ['elType', 'settings'];
		
		foreach ( $required_fields as $field ) {
			if ( ! isset( $widget[ $field ] ) ) {
				return false;
			}
		}

		// Validate widget-specific fields
		if ( isset( $widget['widgetType'] ) ) {
			// Content widget validation
			return isset( $widget['settings'] ) && is_array( $widget['settings'] );
		} else {
			// Container element validation
			return isset( $widget['elements'] ) && is_array( $widget['elements'] );
		}
	}
}
