<?php
namespace Elementor\Modules\CssConverter\Services\Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Conversion_Response_Builder {
	public function build_success_response( array $stats, array $conversion_log ): array {
		$final_result = [
			'success' => true,
		];

		// Add core conversion data
		$final_result = array_merge( $final_result, $stats );

		// Add conversion log and metadata
		$final_result['conversion_log'] = $conversion_log;
		$final_result['warnings'] = $conversion_log['warnings'] ?? [];

		return $final_result;
	}

	public function build_error_response( \Exception $e, array $conversion_log ): array {
		$conversion_log['errors'][] = [
			'message' => esc_html( $e->getMessage() ),
			'trace' => esc_html( $e->getTraceAsString() ),
		];

		return [
			'success' => false,
			'error' => esc_html( $e->getMessage() ),
			'conversion_log' => $conversion_log,
			'warnings' => $conversion_log['warnings'] ?? [],
			'errors' => $conversion_log['errors'] ?? [],
		];
	}

	public function format_final_result( array $components ): array {
		$required_fields = [
			'success',
			'widgets_created',
			'widgets',
			'global_classes_created',
			'global_classes',
			'class_name_mappings',
			'debug_duplicate_detection',
			'variables_created',
			'compound_classes_created',
			'compound_classes',
			'post_id',
			'edit_url',
			'conversion_log',
			'warnings',
			'errors',
			'flattened_classes_created',
			'reset_styles_detected',
			'element_selectors_processed',
			'direct_widget_styles_applied',
			'reset_css_file_generated',
			'reset_styles_stats',
			'complex_reset_styles_count',
		];

		$result = [];
		foreach ( $required_fields as $field ) {
			$result[ $field ] = $components[ $field ] ?? $this->get_default_value( $field );
		}

		return $result;
	}

	private function get_default_value( string $field ) {
		$defaults = [
			'success' => false,
			'widgets_created' => 0,
			'widgets' => [],
			'global_classes_created' => 0,
			'global_classes' => [],
			'class_name_mappings' => [],
			'debug_duplicate_detection' => null,
			'variables_created' => 0,
			'compound_classes_created' => 0,
			'compound_classes' => [],
			'post_id' => null,
			'edit_url' => '',
			'conversion_log' => [],
			'warnings' => [],
			'errors' => [],
			'flattened_classes_created' => 0,
			'reset_styles_detected' => false,
			'element_selectors_processed' => 0,
			'direct_widget_styles_applied' => 0,
			'reset_css_file_generated' => false,
			'reset_styles_stats' => [],
			'complex_reset_styles_count' => 0,
		];

		return $defaults[ $field ] ?? null;
	}
}
