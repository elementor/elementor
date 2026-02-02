<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CSS_Variable_Processor {
	private array $processing_stats = [];

	public function __construct() {
		$this->processing_stats = [
			'variables_processed' => 0,
			'definitions_processed' => 0,
			'warnings' => [],
		];
	}

	public function process_css_variables( array $css_variables ): array {
		try {
			foreach ( $css_variables as $variable ) {
				++$this->processing_stats['variables_processed'];
			}

			return [
				'success' => true,
				'variables_processed' => $this->processing_stats['variables_processed'],
			];
		} catch ( \Exception $e ) {
			$this->processing_stats['warnings'][] = [
				'type' => 'variable_processing_failed',
				'message' => $e->getMessage(),
			];

			return [
				'success' => false,
				'error' => $e->getMessage(),
			];
		}
	}

	public function process_css_variable_definitions( array $css_variable_definitions ): array {
		try {
			if ( empty( $css_variable_definitions ) ) {
				return [
					'success' => true,
					'definitions_processed' => 0,
				];
			}

			foreach ( $css_variable_definitions as $variable_name => $variable_data ) {
				++$this->processing_stats['definitions_processed'];
			}

			return [
				'success' => true,
				'definitions_processed' => $this->processing_stats['definitions_processed'],
			];
		} catch ( \Exception $e ) {
			$this->processing_stats['warnings'][] = [
				'type' => 'css_variable_definitions_processing_failed',
				'message' => $e->getMessage(),
			];

			return [
				'success' => false,
				'error' => $e->getMessage(),
			];
		}
	}

	public function get_processing_stats(): array {
		return $this->processing_stats;
	}

	public function reset_stats(): void {
		$this->processing_stats = [
			'variables_processed' => 0,
			'definitions_processed' => 0,
			'warnings' => [],
		];
	}
}
