<?php
namespace Elementor\Modules\CssConverter\Services\Logging;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Conversion_Logger {
	private array $conversion_log;

	public function start_conversion_log( string $html, array $css_urls ): array {
		$this->conversion_log = [
			'start_time' => microtime( true ),
			'input_size' => strlen( $html ),
			'css_urls_count' => count( $css_urls ),
			'options' => [],
			'warnings' => [],
			'errors' => [],
		];

		return $this->conversion_log;
	}

	public function add_parsing_stats( array $elements, array $validation_issues ): void {
		$this->conversion_log['parsed_elements'] = count( $elements );
		
		if ( ! empty( $validation_issues ) ) {
			$this->conversion_log['warnings'] = array_merge( 
				$this->conversion_log['warnings'], 
				$validation_issues 
			);
		}
	}

	public function add_mapping_stats( array $mapping_stats ): void {
		$this->conversion_log['mapping_stats'] = $mapping_stats;
	}

	public function add_css_size( int $css_size ): void {
		$this->conversion_log['css_size'] = $css_size;
	}

	public function add_css_processing_stats( array $stats ): void {
		$this->conversion_log['css_processing'] = $stats;
	}

	public function add_widget_creation_stats( array $stats ): void {
		$this->conversion_log['widget_creation'] = $stats;
	}

	public function add_performance_stats( float $start_time ): void {
		$end_time = microtime( true );
		$this->conversion_log['end_time'] = $end_time;
		$this->conversion_log['total_time'] = $end_time - $start_time;
	}

	public function add_error( string $message, string $trace = '' ): void {
		$this->conversion_log['errors'][] = [
			'message' => esc_html( $message ),
			'trace' => esc_html( $trace ),
		];
	}

	public function add_warning( string $message ): void {
		$this->conversion_log['warnings'][] = esc_html( $message );
	}

	public function set_options( array $options ): void {
		$this->conversion_log['options'] = $options;
	}

	public function finalize_log(): array {
		if ( ! isset( $this->conversion_log['end_time'] ) ) {
			$this->add_performance_stats( $this->conversion_log['start_time'] );
		}

		return $this->conversion_log;
	}

	public function get_current_log(): array {
		return $this->conversion_log ?? [];
	}
}
