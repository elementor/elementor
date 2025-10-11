<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgetsV2;

use Elementor\Modules\CssConverter\Services\AtomicWidgetsV2\Atomic_Widgets_Orchestrator;
use Elementor\Modules\CssConverter\Services\AtomicWidgetsV2\Performance_Monitor;

class PerformanceTest extends AtomicWidgetV2TestCase {

	private Atomic_Widgets_Orchestrator $orchestrator;
	private Performance_Monitor $performance_monitor;

	protected function setUp(): void {
		parent::setUp();
		$this->orchestrator = new Atomic_Widgets_Orchestrator( false, true );
		$this->performance_monitor = new Performance_Monitor( true );
	}

	public function test_performance_monitor_basic_functionality(): void {
		$this->performance_monitor->start_timer( 'test_operation' );
		
		// Simulate some work
		usleep( 10000 ); // 10ms
		
		$duration = $this->performance_monitor->end_timer( 'test_operation' );
		
		$this->assertIsFloat( $duration );
		$this->assertGreaterThan( 0.01, $duration ); // Should be at least 10ms
		$this->assertLessThan( 0.1, $duration ); // Should be less than 100ms
	}

	public function test_memory_snapshot_functionality(): void {
		$this->performance_monitor->take_memory_snapshot( 'before_operation' );
		
		// Allocate some memory
		$large_array = array_fill( 0, 1000, 'test_data' );
		
		$this->performance_monitor->take_memory_snapshot( 'after_operation' );
		
		$snapshots = $this->performance_monitor->get_memory_snapshots();
		
		$this->assertArrayHasKey( 'before_operation', $snapshots );
		$this->assertArrayHasKey( 'after_operation', $snapshots );
		
		$before = $snapshots['before_operation']['memory_usage'];
		$after = $snapshots['after_operation']['memory_usage'];
		
		$this->assertGreaterThan( $before, $after );
		
		// Clean up
		unset( $large_array );
	}

	public function test_benchmark_operation_functionality(): void {
		$result = $this->performance_monitor->benchmark_operation( 'test_benchmark', function() {
			usleep( 5000 ); // 5ms
			return 'benchmark_result';
		});
		
		$this->assertEquals( 'benchmark_result', $result );
		
		$metric = $this->performance_monitor->get_metric( 'test_benchmark' );
		$this->assertNotNull( $metric );
		$this->assertArrayHasKey( 'duration', $metric );
		$this->assertArrayHasKey( 'memory_used', $metric );
	}

	public function test_performance_summary_generation(): void {
		// Run multiple operations
		$this->performance_monitor->start_timer( 'operation_1' );
		usleep( 10000 );
		$this->performance_monitor->end_timer( 'operation_1' );
		
		$this->performance_monitor->start_timer( 'operation_2' );
		usleep( 5000 );
		$this->performance_monitor->end_timer( 'operation_2' );
		
		$summary = $this->performance_monitor->get_performance_summary();
		
		$this->assertArrayHasKey( 'total_operations', $summary );
		$this->assertArrayHasKey( 'total_duration', $summary );
		$this->assertArrayHasKey( 'average_duration', $summary );
		$this->assertArrayHasKey( 'slowest_operation', $summary );
		$this->assertArrayHasKey( 'peak_memory_usage', $summary );
		
		$this->assertEquals( 2, $summary['total_operations'] );
		$this->assertGreaterThan( 0, $summary['total_duration'] );
		$this->assertEquals( 'operation_1', $summary['slowest_operation']['name'] );
	}

	public function test_simple_html_conversion_performance(): void {
		$html = '<div style="padding: 20px;"><h1 style="font-size: 32px;">Test</h1><p style="font-size: 16px;">Content</p></div>';
		
		$start_time = microtime( true );
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		$end_time = microtime( true );
		
		$duration = ( $end_time - $start_time ) * 1000; // Convert to milliseconds
		
		$this->assertTrue( $result['success'] );
		$this->assertLessThan( 100, $duration, 'Simple conversion should complete within 100ms' );
		
		// Verify performance data is included
		$this->assertArrayHasKey( 'performance', $result );
		$performance = $result['performance'];
		$this->assertArrayHasKey( 'total_duration', $performance );
		$this->assertGreaterThan( 0, $performance['total_duration'] );
	}

	public function test_medium_complexity_performance(): void {
		$html = '<div style="max-width: 800px; margin: 0 auto; padding: 40px;">';
		
		for ( $i = 0; $i < 10; $i++ ) {
			$html .= "<section style=\"margin-bottom: 30px;\">
						<h2 style=\"font-size: 24px; color: #333;\">Section {$i}</h2>
						<p style=\"font-size: 16px; line-height: 1.6;\">Content for section {$i}</p>
						<button style=\"background: #007bff; color: white; padding: 10px 20px;\">Button {$i}</button>
					  </section>";
		}
		
		$html .= '</div>';
		
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		
		$this->assertTrue( $result['success'] );
		
		$performance = $result['performance'];
		$this->assertLessThan( 500, $performance['total_duration'], 'Medium complexity should complete within 500ms' );
		
		// Verify acceptable performance
		$this->assertTrue( 
			$this->orchestrator->is_performance_acceptable(),
			'Performance should be within acceptable limits'
		);
	}

	public function test_large_content_performance_limits(): void {
		$html = '<div style="max-width: 1200px;">';
		
		// Generate larger content
		for ( $i = 0; $i < 100; $i++ ) {
			$html .= "<div style=\"padding: 20px; margin: 10px; background: #f8f9fa;\">
						<h3 style=\"font-size: 20px;\">Item {$i}</h3>
						<p style=\"font-size: 14px;\">Description for item {$i}</p>
						<div style=\"display: flex; gap: 10px;\">
							<button style=\"background: #28a745; color: white; padding: 8px 16px;\">Action {$i}</button>
							<a href=\"#link{$i}\" style=\"color: #007bff;\">Link {$i}</a>
						</div>
					  </div>";
		}
		
		$html .= '</div>';
		
		$start_memory = memory_get_usage( true );
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		$end_memory = memory_get_usage( true );
		
		$memory_used = $end_memory - $start_memory;
		
		$this->assertTrue( $result['success'] );
		
		// Performance assertions
		$performance = $result['performance'];
		$this->assertLessThan( 2000, $performance['total_duration'], 'Large content should complete within 2 seconds' );
		$this->assertLessThan( 50 * 1024 * 1024, $memory_used, 'Should use less than 50MB additional memory' );
		
		// Verify stats for large content
		$stats = $result['stats'];
		$this->assertGreaterThan( 300, $stats['total_elements_parsed'] );
		$this->assertGreaterThan( 200, $stats['total_widgets_created'] );
	}

	public function test_performance_warnings_detection(): void {
		// Create a scenario that might trigger performance warnings
		$html = '<div>';
		
		// Generate content with many nested elements
		for ( $i = 0; $i < 20; $i++ ) {
			$html .= str_repeat( '<div style="padding: 1px;">', $i + 1 );
			$html .= "<p style=\"font-size: 14px;\">Deeply nested content {$i}</p>";
			$html .= str_repeat( '</div>', $i + 1 );
		}
		
		$html .= '</div>';
		
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		
		$this->assertTrue( $result['success'] );
		
		// Check for performance warnings
		$performance_warnings = $this->orchestrator->get_performance_monitor()->get_performance_warnings();
		
		// May or may not have warnings depending on system performance
		$this->assertIsArray( $performance_warnings );
	}

	public function test_concurrent_conversion_performance(): void {
		$html_samples = [
			'<div><h1 style="font-size: 32px;">Sample 1</h1><p>Content 1</p></div>',
			'<div><h2 style="font-size: 24px;">Sample 2</h2><p>Content 2</p></div>',
			'<div><h3 style="font-size: 20px;">Sample 3</h3><p>Content 3</p></div>',
		];
		
		$results = [];
		$start_time = microtime( true );
		
		foreach ( $html_samples as $index => $html ) {
			$orchestrator = new Atomic_Widgets_Orchestrator( false, true );
			$results[] = $orchestrator->convert_html_to_atomic_widgets( $html );
		}
		
		$end_time = microtime( true );
		$total_duration = ( $end_time - $start_time ) * 1000;
		
		// All conversions should succeed
		foreach ( $results as $result ) {
			$this->assertTrue( $result['success'] );
		}
		
		// Total time should be reasonable for multiple conversions
		$this->assertLessThan( 300, $total_duration, 'Multiple conversions should complete within 300ms' );
	}

	public function test_memory_leak_detection(): void {
		$initial_memory = memory_get_usage( true );
		
		// Run multiple conversions to check for memory leaks
		for ( $i = 0; $i < 10; $i++ ) {
			$html = "<div style=\"padding: {$i}px;\"><h1>Test {$i}</h1><p>Content {$i}</p></div>";
			$orchestrator = new Atomic_Widgets_Orchestrator( false, true );
			$result = $orchestrator->convert_html_to_atomic_widgets( $html );
			$this->assertTrue( $result['success'] );
			
			// Force garbage collection
			if ( function_exists( 'gc_collect_cycles' ) ) {
				gc_collect_cycles();
			}
		}
		
		$final_memory = memory_get_usage( true );
		$memory_increase = $final_memory - $initial_memory;
		
		// Memory increase should be reasonable (less than 10MB for 10 conversions)
		$this->assertLessThan( 10 * 1024 * 1024, $memory_increase, 'Memory usage should not increase significantly' );
	}

	public function test_performance_acceptable_thresholds(): void {
		$html = '<div style="padding: 20px;"><h1>Test</h1><p>Content</p></div>';
		
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		$this->assertTrue( $result['success'] );
		
		// Test with default thresholds
		$this->assertTrue( $this->orchestrator->is_performance_acceptable() );
		
		// Test with strict thresholds
		$strict_thresholds = [
			'max_total_duration' => 0.1, // 100ms
			'max_memory_usage' => 10 * 1024 * 1024, // 10MB
			'max_single_operation' => 0.05, // 50ms
		];
		
		$is_acceptable = $this->orchestrator->is_performance_acceptable( $strict_thresholds );
		$this->assertIsBool( $is_acceptable );
		
		// Test with very lenient thresholds
		$lenient_thresholds = [
			'max_total_duration' => 10.0, // 10 seconds
			'max_memory_usage' => 100 * 1024 * 1024, // 100MB
			'max_single_operation' => 5.0, // 5 seconds
		];
		
		$this->assertTrue( $this->orchestrator->is_performance_acceptable( $lenient_thresholds ) );
	}

	public function test_detailed_performance_metrics_structure(): void {
		$html = '<div><h1>Test</h1><p>Content</p></div>';
		
		$result = $this->orchestrator->convert_html_to_atomic_widgets( $html );
		$this->assertTrue( $result['success'] );
		
		$detailed_metrics = $this->orchestrator->get_detailed_performance_metrics();
		
		$this->assertIsArray( $detailed_metrics );
		
		foreach ( $detailed_metrics as $operation_name => $metrics ) {
			$this->assertIsString( $operation_name );
			$this->assertIsArray( $metrics );
			
			$this->assertArrayHasKey( 'duration_ms', $metrics );
			$this->assertArrayHasKey( 'memory_used', $metrics );
			$this->assertArrayHasKey( 'start_memory', $metrics );
			$this->assertArrayHasKey( 'end_memory', $metrics );
			
			$this->assertIsNumeric( $metrics['duration_ms'] );
			$this->assertIsString( $metrics['memory_used'] );
			$this->assertIsString( $metrics['start_memory'] );
			$this->assertIsString( $metrics['end_memory'] );
		}
	}
}
