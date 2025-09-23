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

	public function __construct() {
		$this->data_parser = new Atomic_Data_Parser();
		$this->json_creator = new Atomic_Widget_JSON_Creator();
		$this->styles_integrator = new Widget_Styles_Integrator();
		$this->stats_calculator = new Conversion_Stats_Calculator();
	}

	public function convert_html_to_atomic_widgets( string $html, array $options = [] ): array {
		if ( empty( trim( $html ) ) ) {
			return $this->build_empty_result();
		}

		// Phase 1: Parse HTML and prepare data
		$widget_data_array = $this->data_parser->parse_html_for_atomic_widgets( $html );
		if ( empty( $widget_data_array ) ) {
			return $this->build_parsing_failed_result();
		}

		// Phase 2: Create widgets using Atomic Widgets Module
		$widgets = $this->create_widgets_from_data( $widget_data_array );
		if ( empty( $widgets ) ) {
			return $this->build_widget_creation_failed_result();
		}

		// Phase 3: Integrate styles into widgets
		$widgets_with_styles = $this->integrate_styles_into_widgets( $widgets, $widget_data_array );

		// Generate conversion stats
		$stats = $this->stats_calculator->calculate_conversion_stats( $widget_data_array, $widgets_with_styles );

		return $this->build_success_result( $widgets_with_styles, $stats );
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

	private function create_widgets_from_data( array $widget_data_array ): array {
		$widgets = [];

		foreach ( $widget_data_array as $widget_data ) {
			$widget = $this->json_creator->create_widget_json( $widget_data );
			if ( $widget ) {
				$widgets[] = $widget;
			}
		}

		return $widgets;
	}

	private function integrate_styles_into_widgets( array $widgets, array $widget_data_array ): array {
		$widgets_with_styles = [];

		foreach ( $widgets as $index => $widget ) {
			$widget_data = $widget_data_array[ $index ] ?? [];
			$atomic_props = $widget_data['atomic_props'] ?? [];

			if ( ! empty( $atomic_props ) ) {
				$widget = $this->styles_integrator->integrate_styles_into_widget( $widget, $atomic_props );
			}

			$widgets_with_styles[] = $widget;
		}

		return $widgets_with_styles;
	}

	private function build_empty_result(): array {
		return [
			'success' => false,
			'error' => 'HTML content is empty.',
			'widgets' => [],
			'stats' => $this->stats_calculator->get_empty_stats(),
		];
	}

	private function build_parsing_failed_result(): array {
		return [
			'success' => false,
			'error' => 'HTML parsing failed or no supported elements found.',
			'widgets' => [],
			'stats' => $this->stats_calculator->get_empty_stats(),
		];
	}

	private function build_widget_creation_failed_result(): array {
		return [
			'success' => false,
			'error' => 'Widget creation failed. Atomic Widgets Module may not be available.',
			'widgets' => [],
			'stats' => $this->stats_calculator->get_empty_stats(),
		];
	}

	private function build_success_result( array $widgets, array $stats ): array {
		return [
			'success' => true,
			'widgets' => $widgets,
			'stats' => $stats,
		];
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
}
