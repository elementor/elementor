<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Performance_Monitor {

	private array $timers = [];
	private array $memory_snapshots = [];
	private array $metrics = [];
	private bool $enabled = false;

	public function __construct( bool $enabled = false ) {
		$this->enabled = $enabled;
	}

	public function enable(): void {
		$this->enabled = true;
	}

	public function disable(): void {
		$this->enabled = false;
	}

	public function start_timer( string $name ): void {
		if ( ! $this->enabled ) {
			return;
		}

		$this->timers[ $name ] = [
			'start' => microtime( true ),
			'memory_start' => memory_get_usage( true ),
		];
	}

	public function end_timer( string $name ): ?float {
		if ( ! $this->enabled || ! isset( $this->timers[ $name ] ) ) {
			return null;
		}

		$end_time = microtime( true );
		$end_memory = memory_get_usage( true );
		
		$duration = $end_time - $this->timers[ $name ]['start'];
		$memory_used = $end_memory - $this->timers[ $name ]['memory_start'];

		$this->metrics[ $name ] = [
			'duration' => $duration,
			'memory_used' => $memory_used,
			'start_memory' => $this->timers[ $name ]['memory_start'],
			'end_memory' => $end_memory,
		];

		unset( $this->timers[ $name ] );

		return $duration;
	}

	public function take_memory_snapshot( string $label ): void {
		if ( ! $this->enabled ) {
			return;
		}

		$this->memory_snapshots[ $label ] = [
			'memory_usage' => memory_get_usage( true ),
			'peak_memory' => memory_get_peak_usage( true ),
			'timestamp' => microtime( true ),
		];
	}

	public function get_metric( string $name ): ?array {
		return $this->metrics[ $name ] ?? null;
	}

	public function get_all_metrics(): array {
		return $this->metrics;
	}

	public function get_memory_snapshots(): array {
		return $this->memory_snapshots;
	}

	public function get_performance_summary(): array {
		if ( ! $this->enabled ) {
			return ['monitoring_disabled' => true];
		}

		$total_duration = 0;
		$total_memory = 0;
		$slowest_operation = null;
		$memory_intensive_operation = null;

		foreach ( $this->metrics as $name => $metric ) {
			$total_duration += $metric['duration'];
			$total_memory += $metric['memory_used'];

			if ( ! $slowest_operation || $metric['duration'] > $this->metrics[ $slowest_operation ]['duration'] ) {
				$slowest_operation = $name;
			}

			if ( ! $memory_intensive_operation || $metric['memory_used'] > $this->metrics[ $memory_intensive_operation ]['memory_used'] ) {
				$memory_intensive_operation = $name;
			}
		}

		return [
			'total_operations' => count( $this->metrics ),
			'total_duration' => round( $total_duration * 1000, 2 ), // Convert to milliseconds
			'total_memory_used' => $this->format_bytes( $total_memory ),
			'average_duration' => count( $this->metrics ) > 0 ? round( ( $total_duration / count( $this->metrics ) ) * 1000, 2 ) : 0,
			'slowest_operation' => $slowest_operation ? [
				'name' => $slowest_operation,
				'duration' => round( $this->metrics[ $slowest_operation ]['duration'] * 1000, 2 ),
			] : null,
			'memory_intensive_operation' => $memory_intensive_operation ? [
				'name' => $memory_intensive_operation,
				'memory_used' => $this->format_bytes( $this->metrics[ $memory_intensive_operation ]['memory_used'] ),
			] : null,
			'peak_memory_usage' => $this->format_bytes( memory_get_peak_usage( true ) ),
			'current_memory_usage' => $this->format_bytes( memory_get_usage( true ) ),
		];
	}

	public function get_detailed_metrics(): array {
		$detailed = [];

		foreach ( $this->metrics as $name => $metric ) {
			$detailed[ $name ] = [
				'duration_ms' => round( $metric['duration'] * 1000, 2 ),
				'memory_used' => $this->format_bytes( $metric['memory_used'] ),
				'start_memory' => $this->format_bytes( $metric['start_memory'] ),
				'end_memory' => $this->format_bytes( $metric['end_memory'] ),
			];
		}

		return $detailed;
	}

	public function benchmark_operation( string $name, callable $operation ) {
		$this->start_timer( $name );
		
		try {
			$result = $operation();
			$this->end_timer( $name );
			return $result;
		} catch ( \Exception $e ) {
			$this->end_timer( $name );
			throw $e;
		}
	}

	public function clear_metrics(): void {
		$this->metrics = [];
		$this->memory_snapshots = [];
		$this->timers = [];
	}

	public function is_performance_acceptable( array $thresholds = [] ): bool {
		$default_thresholds = [
			'max_total_duration' => 5.0, // 5 seconds
			'max_memory_usage' => 50 * 1024 * 1024, // 50MB
			'max_single_operation' => 2.0, // 2 seconds
		];

		$thresholds = array_merge( $default_thresholds, $thresholds );

		$summary = $this->get_performance_summary();

		// Check total duration
		if ( ( $summary['total_duration'] / 1000 ) > $thresholds['max_total_duration'] ) {
			return false;
		}

		// Check memory usage
		if ( memory_get_peak_usage( true ) > $thresholds['max_memory_usage'] ) {
			return false;
		}

		// Check individual operations
		foreach ( $this->metrics as $metric ) {
			if ( $metric['duration'] > $thresholds['max_single_operation'] ) {
				return false;
			}
		}

		return true;
	}

	public function get_performance_warnings( array $thresholds = [] ): array {
		$default_thresholds = [
			'slow_operation' => 1.0, // 1 second
			'memory_intensive' => 10 * 1024 * 1024, // 10MB
		];

		$thresholds = array_merge( $default_thresholds, $thresholds );
		$warnings = [];

		foreach ( $this->metrics as $name => $metric ) {
			if ( $metric['duration'] > $thresholds['slow_operation'] ) {
				$warnings[] = "Operation '{$name}' took " . round( $metric['duration'] * 1000, 2 ) . "ms (slow)";
			}

			if ( $metric['memory_used'] > $thresholds['memory_intensive'] ) {
				$warnings[] = "Operation '{$name}' used " . $this->format_bytes( $metric['memory_used'] ) . " (memory intensive)";
			}
		}

		return $warnings;
	}

	private function format_bytes( int $bytes ): string {
		$units = ['B', 'KB', 'MB', 'GB'];
		$bytes = max( $bytes, 0 );
		$pow = floor( ( $bytes ? log( $bytes ) : 0 ) / log( 1024 ) );
		$pow = min( $pow, count( $units ) - 1 );

		$bytes /= pow( 1024, $pow );

		return round( $bytes, 2 ) . ' ' . $units[ $pow ];
	}

	public function log_performance_summary(): void {
		if ( ! $this->enabled ) {
			return;
		}

		$summary = $this->get_performance_summary();
		$warnings = $this->get_performance_warnings();

		error_log( 'Atomic Widgets Performance Summary: ' . wp_json_encode( $summary ) );

		if ( ! empty( $warnings ) ) {
			error_log( 'Atomic Widgets Performance Warnings: ' . wp_json_encode( $warnings ) );
		}
	}
}

