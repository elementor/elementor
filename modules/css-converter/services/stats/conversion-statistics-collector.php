<?php
namespace Elementor\Modules\CssConverter\Services\Stats;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Conversion_Statistics_Collector {
	public function collect_conversion_stats( array $processing_results, array $creation_results ): array {
		$css_stats = $this->collect_css_processing_stats( $processing_results );
		$widget_stats = $this->collect_widget_creation_stats( $creation_results );
		$modifier_stats = $this->collect_modifier_stats( $processing_results );
		
		return array_merge( $css_stats, $widget_stats, $modifier_stats );
	}

	public function collect_css_processing_stats( array $unified_processing_result ): array {
		$stats = $unified_processing_result['stats'] ?? [];
		
		return [
			'css_processing' => $stats,
			'global_classes_created' => $unified_processing_result['global_classes_created'] ?? 0,
			'global_classes' => $unified_processing_result['global_classes'] ?? [],
			'class_name_mappings' => $unified_processing_result['class_name_mappings'] ?? [],
			'debug_duplicate_detection' => $unified_processing_result['debug_duplicate_detection'] ?? null,
			'compound_classes' => $unified_processing_result['compound_classes'] ?? [],
		];
	}

	public function collect_widget_creation_stats( array $creation_result ): array {
		return [
			'widgets_created' => $creation_result['widgets_created'] ?? 0,
			'widgets' => $creation_result['widgets'] ?? [],
			'variables_created' => $creation_result['variables_created'] ?? 0,
			'post_id' => $creation_result['post_id'] ?? null,
			'edit_url' => $creation_result['edit_url'] ?? '',
			'errors' => $creation_result['errors'] ?? [],
		];
	}

	public function collect_modifier_stats( array $processing_results ): array {
		$css_class_modifiers = $processing_results['css_class_modifiers'] ?? [];
		
		return [
			'compound_classes_created' => $this->count_modifiers_by_type( $css_class_modifiers, 'compound' ),
			'flattened_classes_created' => $this->count_modifiers_by_type( $css_class_modifiers, 'flattening' ),
		];
	}

	public function collect_reset_styles_stats( array $processing_results ): array {
		$reset_styles_detected = $processing_results['reset_styles_detected'] ?? false;
		$reset_styles_stats = $processing_results['reset_styles_stats'] ?? [];
		$complex_reset_styles = $processing_results['complex_reset_styles'] ?? [];

		return [
			'reset_styles_detected' => $reset_styles_detected,
			'element_selectors_processed' => $reset_styles_stats['reset_element_styles'] ?? 0,
			'direct_widget_styles_applied' => $reset_styles_stats['direct_applicable_styles'] ?? 0,
			'reset_css_file_generated' => ! empty( $complex_reset_styles ),
			'reset_styles_stats' => $reset_styles_stats,
			'complex_reset_styles_count' => count( $complex_reset_styles ),
		];
	}

	public function collect_performance_stats( float $start_time ): array {
		$end_time = microtime( true );
		
		return [
			'start_time' => $start_time,
			'end_time' => $end_time,
			'total_time' => $end_time - $start_time,
		];
	}

	private function count_modifiers_by_type( array $modifiers, string $type ): int {
		$count = 0;
		foreach ( $modifiers as $modifier ) {
			if ( ( $modifier['type'] ?? '' ) === $type ) {
				$count += count( $modifier['mappings'] ?? [] );
			}
		}
		return $count;
	}
}
