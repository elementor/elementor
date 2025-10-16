<?php
namespace Elementor\Modules\CssConverter\Services\GlobalClasses;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Performance_Logger {
	private $comparisons = [];

	public function log_comparison( string $action, float $elapsed_time, int $variants_checked ): void {
		$this->comparisons[] = [
			'action' => $action,
			'elapsed_time' => $elapsed_time,
			'variants_checked' => $variants_checked,
			'timestamp' => time(),
		];
	}

	public function get_stats(): array {
		if ( empty( $this->comparisons ) ) {
			return [
				'total_comparisons' => 0,
				'total_time' => 0,
				'average_time' => 0,
				'max_time' => 0,
			];
		}

		$times = array_column( $this->comparisons, 'elapsed_time' );
		$reused_count = 0;
		$created_count = 0;

		foreach ( $this->comparisons as $comparison ) {
			if ( 'reused' === $comparison['action'] ) {
				++$reused_count;
			} elseif ( 'created' === $comparison['action'] ) {
				++$created_count;
			}
		}

		return [
			'total_comparisons' => count( $this->comparisons ),
			'total_time' => array_sum( $times ),
			'average_time' => array_sum( $times ) / count( $times ),
			'max_time' => max( $times ),
			'reused_count' => $reused_count,
			'created_count' => $created_count,
		];
	}
}
