<?php
namespace Elementor\Testing\Modules\CssConverter\Services;

use Elementor\Modules\CssConverter\Services\Widget\Widget_Error_Handler;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group error-handler
 */
class Test_Widget_Error_Handler extends Elementor_Test_Base {

	private $error_handler;

	public function setUp(): void {
		parent::setUp();
		$this->error_handler = new Widget_Error_Handler();
	}

	public function test_handles_widget_creation_failure() {
		$error_data = [
			'message' => 'Widget creation failed',
			'exception' => new \Exception( 'Test exception' ),
		];
		
		$context = [
			'widget' => [
				'widget_type' => 'e-heading',
				'element_data' => [
					'tag' => 'h1',
					'content' => 'Test Title',
					'attributes' => [ 'class' => 'test-class' ],
				],
			],
		];
		
		$result = $this->error_handler->handle_error( 'widget_creation_failed', $error_data, $context );
		
		// Should return HTML fallback widget
		$this->assertIsArray( $result );
		$this->assertEquals( 'widget', $result['elType'] );
		$this->assertEquals( 'html', $result['widgetType'] );
		$this->assertArrayHasKey( 'html', $result['settings'] );
		$this->assertStringContains( '<h1', $result['settings']['html'] );
		$this->assertStringContains( 'Test Title', $result['settings']['html'] );
		
		// Should have fallback info
		$this->assertArrayHasKey( 'fallback_info', $result );
		$this->assertEquals( 'e-heading', $result['fallback_info']['original_widget_type'] );
		$this->assertEquals( 'h1', $result['fallback_info']['original_tag'] );
	}

	public function test_handles_css_processing_failure() {
		$error_data = [
			'message' => 'CSS processing failed',
		];
		
		$context = [
			'widget' => [
				'widget_type' => 'e-text',
				'applied_styles' => [ 'color' => 'red' ],
				'computed_styles' => [ 'font-size' => '16px' ],
			],
		];
		
		$result = $this->error_handler->handle_error( 'css_processing_failed', $error_data, $context );
		
		// Should return widget without styling
		$this->assertIsArray( $result );
		$this->assertEquals( 'e-text', $result['widget_type'] );
		$this->assertArrayNotHasKey( 'applied_styles', $result );
		$this->assertArrayNotHasKey( 'computed_styles', $result );
	}

	public function test_handles_global_class_creation_failure() {
		$error_data = [
			'message' => 'Global class creation failed',
		];
		
		$context = [
			'widget' => [
				'widget_type' => 'e-heading',
				'settings' => [],
			],
			'css_styles' => [
				'color' => 'blue',
				'font-size' => '18px',
				'margin' => '10px',
			],
		];
		
		$result = $this->error_handler->handle_error( 'global_class_failed', $error_data, $context );
		
		// Should return widget with inline styles
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'settings', $result );
		$this->assertArrayHasKey( '_element_css_inline', $result['settings'] );
		$this->assertStringContains( 'color: blue', $result['settings']['_element_css_inline'] );
		$this->assertStringContains( 'font-size: 18px', $result['settings']['_element_css_inline'] );
	}

	public function test_handles_hierarchy_error() {
		$error_data = [
			'message' => 'Hierarchy processing failed',
		];
		
		$context = [
			'widgets' => [
				[
					'id' => 'parent',
					'widget_type' => 'e-flexbox',
					'children' => [
						[
							'id' => 'child1',
							'widget_type' => 'e-heading',
						],
						[
							'id' => 'child2',
							'widget_type' => 'e-text',
						],
					],
				],
			],
		];
		
		$result = $this->error_handler->handle_error( 'hierarchy_error', $error_data, $context );
		
		// Should return flattened widget list
		$this->assertIsArray( $result );
		$this->assertCount( 3, $result ); // parent + 2 children flattened
		
		// Check that children don't have children property
		foreach ( $result as $widget ) {
			$this->assertArrayNotHasKey( 'children', $widget );
		}
	}

	public function test_handles_post_creation_failure() {
		$error_data = [
			'message' => 'Post creation failed',
		];
		
		$context = [
			'operation' => 'post_creation',
		];
		
		$result = $this->error_handler->handle_error( 'post_creation_failed', $error_data, $context );
		
		// Should return safe defaults for post creation
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'post_title', $result );
		$this->assertArrayHasKey( 'post_type', $result );
		$this->assertArrayHasKey( 'post_status', $result );
		$this->assertEquals( 'draft', $result['post_status'] );
	}

	public function test_handles_warnings() {
		$warning_data = [
			'message' => 'This is a warning',
		];
		
		$context = [
			'widget_type' => 'e-heading',
		];
		
		$this->error_handler->handle_warning( 'styling_skipped', $warning_data, $context );
		
		$warnings = $this->error_handler->get_warning_log();
		$this->assertCount( 1, $warnings );
		
		$warning = $warnings[0];
		$this->assertEquals( 'styling_skipped', $warning['type'] );
		$this->assertEquals( 'This is a warning', $warning['message'] );
		$this->assertEquals( 'warning', $warning['severity'] );
		$this->assertArrayHasKey( 'timestamp', $warning );
	}

	public function test_determines_error_severity_correctly() {
		$test_cases = [
			'widget_creation_failed' => 'medium',
			'css_processing_failed' => 'low',
			'global_class_failed' => 'low',
			'hierarchy_error' => 'high',
			'post_creation_failed' => 'critical',
			'elementor_integration_failed' => 'critical',
			'unknown_error' => 'medium',
		];
		
		foreach ( $test_cases as $error_type => $expected_severity ) {
			$this->error_handler->handle_error( $error_type, [ 'message' => 'Test error' ], [] );
		}
		
		$errors = $this->error_handler->get_error_log();
		
		foreach ( $errors as $index => $error ) {
			$error_type = array_keys( $test_cases )[ $index ];
			$expected_severity = $test_cases[ $error_type ];
			$this->assertEquals( $expected_severity, $error['severity'] );
		}
	}

	public function test_identifies_recoverable_errors() {
		$recoverable_errors = [
			'widget_creation_failed',
			'css_processing_failed',
			'global_class_failed',
			'hierarchy_error',
			'post_creation_failed',
		];
		
		$non_recoverable_errors = [
			'elementor_integration_failed',
			'fatal_system_error',
		];
		
		foreach ( $recoverable_errors as $error_type ) {
			$this->error_handler->handle_error( $error_type, [ 'message' => 'Test error' ], [] );
		}
		
		foreach ( $non_recoverable_errors as $error_type ) {
			$this->error_handler->handle_error( $error_type, [ 'message' => 'Test error' ], [] );
		}
		
		$errors = $this->error_handler->get_error_log();
		
		// Check recoverable errors
		for ( $i = 0; $i < count( $recoverable_errors ); $i++ ) {
			$this->assertTrue( $errors[ $i ]['recoverable'] );
		}
		
		// Check non-recoverable errors
		for ( $i = count( $recoverable_errors ); $i < count( $errors ); $i++ ) {
			$this->assertFalse( $errors[ $i ]['recoverable'] );
		}
	}

	public function test_reconstructs_original_html() {
		$widget = [
			'element_data' => [
				'tag' => 'div',
				'content' => 'Test content',
				'attributes' => [
					'class' => 'test-class',
					'id' => 'test-id',
					'data-custom' => 'custom-value',
				],
			],
		];
		
		$error_data = [ 'message' => 'Test error' ];
		$context = [ 'widget' => $widget ];
		
		$result = $this->error_handler->handle_error( 'widget_creation_failed', $error_data, $context );
		$html = $result['settings']['html'];
		
		$this->assertStringContains( '<div', $html );
		$this->assertStringContains( 'class="test-class"', $html );
		$this->assertStringContains( 'id="test-id"', $html );
		$this->assertStringContains( 'data-custom="custom-value"', $html );
		$this->assertStringContains( 'data-elementor-converter-fallback="true"', $html );
		$this->assertStringContains( 'Test content', $html );
		$this->assertStringContains( '</div>', $html );
	}

	public function test_handles_self_closing_tags() {
		$widget = [
			'element_data' => [
				'tag' => 'img',
				'attributes' => [
					'src' => 'test.jpg',
					'alt' => 'Test image',
				],
			],
		];
		
		$error_data = [ 'message' => 'Test error' ];
		$context = [ 'widget' => $widget ];
		
		$result = $this->error_handler->handle_error( 'widget_creation_failed', $error_data, $context );
		$html = $result['settings']['html'];
		
		$this->assertStringContains( '<img', $html );
		$this->assertStringContains( 'src="test.jpg"', $html );
		$this->assertStringContains( 'alt="Test image"', $html );
		$this->assertStringContains( '/>', $html );
		$this->assertStringNotContains( '</img>', $html );
	}

	public function test_generates_comprehensive_error_report() {
		// Generate various errors and warnings
		$this->error_handler->handle_error( 'widget_creation_failed', [ 'message' => 'Error 1' ], [] );
		$this->error_handler->handle_error( 'widget_creation_failed', [ 'message' => 'Error 2' ], [] );
		$this->error_handler->handle_error( 'css_processing_failed', [ 'message' => 'Error 3' ], [] );
		$this->error_handler->handle_warning( 'styling_skipped', [ 'message' => 'Warning 1' ], [] );
		$this->error_handler->handle_warning( 'fallback_widget_created', [ 'message' => 'Warning 2' ], [] );
		
		$report = $this->error_handler->generate_error_report();
		
		// Check summary
		$this->assertArrayHasKey( 'summary', $report );
		$summary = $report['summary'];
		$this->assertEquals( 3, $summary['total_errors'] );
		$this->assertEquals( 2, $summary['total_warnings'] );
		$this->assertGreaterThan( 0, $summary['recoverable_errors'] );
		
		// Check grouped errors
		$this->assertArrayHasKey( 'errors_by_type', $report );
		$errors_by_type = $report['errors_by_type'];
		$this->assertArrayHasKey( 'widget_creation_failed', $errors_by_type );
		$this->assertCount( 2, $errors_by_type['widget_creation_failed'] );
		$this->assertArrayHasKey( 'css_processing_failed', $errors_by_type );
		$this->assertCount( 1, $errors_by_type['css_processing_failed'] );
		
		// Check grouped warnings
		$this->assertArrayHasKey( 'warnings_by_type', $report );
		$warnings_by_type = $report['warnings_by_type'];
		$this->assertArrayHasKey( 'styling_skipped', $warnings_by_type );
		$this->assertArrayHasKey( 'fallback_widget_created', $warnings_by_type );
		
		// Check recommendations
		$this->assertArrayHasKey( 'recommendations', $report );
		$this->assertIsArray( $report['recommendations'] );
		$this->assertNotEmpty( $report['recommendations'] );
		
		// Check recovery actions
		$this->assertArrayHasKey( 'recovery_actions_taken', $report );
		$this->assertIsArray( $report['recovery_actions_taken'] );
	}

	public function test_calculates_success_rate() {
		// Create mix of recoverable and non-recoverable errors
		$this->error_handler->handle_error( 'widget_creation_failed', [ 'message' => 'Recoverable 1' ], [] );
		$this->error_handler->handle_error( 'css_processing_failed', [ 'message' => 'Recoverable 2' ], [] );
		$this->error_handler->handle_error( 'elementor_integration_failed', [ 'message' => 'Fatal' ], [] );
		
		$report = $this->error_handler->generate_error_report();
		$success_rate = $report['summary']['success_rate'];
		
		// Should calculate success rate based on recoverable vs total errors
		$this->assertIsNumeric( $success_rate );
		$this->assertGreaterThanOrEqual( 0, $success_rate );
		$this->assertLessThanOrEqual( 100, $success_rate );
	}

	public function test_provides_contextual_recommendations() {
		$this->error_handler->handle_error( 'widget_creation_failed', [ 'message' => 'Test' ], [] );
		$this->error_handler->handle_error( 'css_processing_failed', [ 'message' => 'Test' ], [] );
		$this->error_handler->handle_error( 'hierarchy_error', [ 'message' => 'Test' ], [] );
		$this->error_handler->handle_error( 'post_creation_failed', [ 'message' => 'Test' ], [] );
		
		$report = $this->error_handler->generate_error_report();
		$recommendations = $report['recommendations'];
		
		$this->assertContains( 'Consider simplifying HTML structure or using supported HTML elements only.', $recommendations );
		$this->assertContains( 'Review CSS syntax and ensure compatibility with supported CSS properties.', $recommendations );
		$this->assertContains( 'Check HTML nesting structure for proper parent-child relationships.', $recommendations );
		$this->assertContains( 'Verify WordPress permissions and available disk space.', $recommendations );
	}

	public function test_tracks_error_statistics() {
		$this->error_handler->handle_error( 'widget_creation_failed', [ 'message' => 'Test' ], [] );
		$this->error_handler->handle_error( 'css_processing_failed', [ 'message' => 'Test' ], [] );
		$this->error_handler->handle_error( 'elementor_integration_failed', [ 'message' => 'Test' ], [] );
		$this->error_handler->handle_warning( 'styling_skipped', [ 'message' => 'Test' ], [] );
		
		$stats = $this->error_handler->get_error_stats();
		
		$this->assertEquals( 3, $stats['total_errors'] );
		$this->assertEquals( 1, $stats['total_warnings'] );
		$this->assertEquals( 2, $stats['recoverable_errors'] );
		$this->assertEquals( 1, $stats['fatal_errors'] );
	}

	public function test_clears_logs_and_stats() {
		$this->error_handler->handle_error( 'widget_creation_failed', [ 'message' => 'Test' ], [] );
		$this->error_handler->handle_warning( 'styling_skipped', [ 'message' => 'Test' ], [] );
		
		// Verify logs have content
		$this->assertNotEmpty( $this->error_handler->get_error_log() );
		$this->assertNotEmpty( $this->error_handler->get_warning_log() );
		
		// Clear logs
		$this->error_handler->clear_logs();
		
		// Verify logs are empty
		$this->assertEmpty( $this->error_handler->get_error_log() );
		$this->assertEmpty( $this->error_handler->get_warning_log() );
		
		$stats = $this->error_handler->get_error_stats();
		$this->assertEquals( 0, $stats['total_errors'] );
		$this->assertEquals( 0, $stats['total_warnings'] );
	}
}
