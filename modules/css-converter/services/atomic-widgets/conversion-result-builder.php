<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Conversion_Result_Builder {
	
	private Conversion_Stats_Calculator $stats_calculator;
	
	public function __construct() {
		$this->stats_calculator = new Conversion_Stats_Calculator();
	}
	
	public function build_success_result( array $widgets, array $parsed_elements ): array {
		return [
			'success' => true,
			'widgets' => $widgets,
			'stats' => $this->stats_calculator->calculate_stats( $parsed_elements, $widgets ),
			'error' => null,
		];
	}
	
	public function build_empty_result(): array {
		return [
			'success' => false,
			'widgets' => [],
			'stats' => $this->get_empty_stats(),
			'error' => 'Empty HTML provided',
		];
	}
	
	public function build_parsing_failed_result(): array {
		return [
			'success' => false,
			'widgets' => [],
			'stats' => $this->get_empty_stats(),
			'error' => 'HTML parsing failed',
		];
	}
	
	public function build_widget_creation_failed_result(): array {
		return [
			'success' => false,
			'widgets' => [],
			'stats' => $this->get_empty_stats(),
			'error' => 'Widget creation failed',
		];
	}
	
	private function get_empty_stats(): array {
		return [
			'total_elements_parsed' => 0,
			'total_widgets_created' => 0,
			'widget_types_created' => [],
			'supported_elements' => 0,
			'unsupported_elements' => 0,
		];
	}
}
