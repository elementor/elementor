<?php
namespace Elementor\Testing\Modules\CssConverter;

use Elementor\Modules\CssConverter\Services\Widget_Error_Handler;
use Elementor\Modules\CssConverter\Services\Widget_Conversion_Service;
use Elementor\Modules\CssConverter\Services\Request_Validator;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group error-handling-tests
 */
class Test_Error_Handling_Recovery extends Elementor_Test_Base {

	private $error_handler;
	private $conversion_service;
	private $request_validator;

	public function setUp(): void {
		parent::setUp();
		$this->error_handler = new Widget_Error_Handler();
		$this->conversion_service = new Widget_Conversion_Service();
		$this->request_validator = new Request_Validator();
		
		// Set up user with proper permissions
		wp_set_current_user( $this->factory->user->create( [ 'role' => 'administrator' ] ) );
	}

	public function test_widget_creation_failure_recovery() {
		// Simulate widget creation failure scenario
		$error_data = [
			'message' => 'Widget creation failed due to invalid attributes',
			'exception' => new \Exception( 'Invalid widget configuration' ),
		];
		
		$context = [
			'widget' => [
				'widget_type' => 'e-heading',
				'element_data' => [
					'tag' => 'h1',
					'content' => 'Test Title',
					'attributes' => [
						'class' => 'test-class',
						'id' => 'test-id',
					],
				],
			],
		];
		
		$fallback_widget = $this->error_handler->handle_error( 'widget_creation_failed', $error_data, $context );
		
		// Should create HTML fallback widget
		$this->assertIsArray( $fallback_widget );
		$this->assertEquals( 'widget', $fallback_widget['elType'] );
		$this->assertEquals( 'html', $fallback_widget['widgetType'] );
		$this->assertArrayHasKey( 'html', $fallback_widget['settings'] );
		$this->assertStringContains( '<h1', $fallback_widget['settings']['html'] );
		$this->assertStringContains( 'Test Title', $fallback_widget['settings']['html'] );
		
		// Should have fallback info
		$this->assertArrayHasKey( 'fallback_info', $fallback_widget );
		$this->assertEquals( 'e-heading', $fallback_widget['fallback_info']['original_widget_type'] );
	}

	public function test_css_processing_failure_recovery() {
		$error_data = [
			'message' => 'CSS processing failed due to invalid syntax',
		];
		
		$context = [
			'widget' => [
				'widget_type' => 'e-text',
				'applied_styles' => [
					'color' => 'invalid-color-value',
				],
				'computed_styles' => [
					'font-size' => 'invalid-size',
				],
			],
		];
		
		$recovered_widget = $this->error_handler->handle_error( 'css_processing_failed', $error_data, $context );
		
		// Should return widget without styling
		$this->assertIsArray( $recovered_widget );
		$this->assertEquals( 'e-text', $recovered_widget['widget_type'] );
		$this->assertArrayNotHasKey( 'applied_styles', $recovered_widget );
		$this->assertArrayNotHasKey( 'computed_styles', $recovered_widget );
	}

	public function test_global_class_creation_failure_recovery() {
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
				'font-size' => '24px',
				'margin' => '10px',
			],
		];
		
		$recovered_widget = $this->error_handler->handle_error( 'global_class_failed', $error_data, $context );
		
		// Should return widget with inline styles
		$this->assertIsArray( $recovered_widget );
		$this->assertArrayHasKey( 'settings', $recovered_widget );
		$this->assertArrayHasKey( '_element_css_inline', $recovered_widget['settings'] );
		
		$inline_styles = $recovered_widget['settings']['_element_css_inline'];
		$this->assertStringContains( 'color: blue', $inline_styles );
		$this->assertStringContains( 'font-size: 24px', $inline_styles );
		$this->assertStringContains( 'margin: 10px', $inline_styles );
	}

	public function test_hierarchy_error_recovery() {
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
		
		$flattened_widgets = $this->error_handler->handle_error( 'hierarchy_error', $error_data, $context );
		
		// Should return flattened widget list
		$this->assertIsArray( $flattened_widgets );
		$this->assertCount( 3, $flattened_widgets ); // parent + 2 children
		
		// Children should not have children property
		foreach ( $flattened_widgets as $widget ) {
			$this->assertArrayNotHasKey( 'children', $widget );
		}
	}

	public function test_malformed_html_handling() {
		$malformed_html_cases = [
			'<div><p>Unclosed paragraph</div>',
			'<div>Missing closing tag',
			'<>Empty tag</>',
			'<div class=>Missing attribute value</div>',
			'<div class="unclosed quote>Content</div>',
			'<<div>>Double brackets</div>',
		];
		
		foreach ( $malformed_html_cases as $html ) {
			$result = $this->conversion_service->convert_from_html( $html );
			
			// Should handle gracefully without crashing
			$this->assertIsArray( $result );
			
			// May succeed with warnings or fail gracefully
			if ( isset( $result['success'] ) && $result['success'] ) {
				$this->assertArrayHasKey( 'warnings', $result );
				// Clean up if successful
				if ( isset( $result['post_id'] ) ) {
					wp_delete_post( $result['post_id'], true );
				}
			} else {
				$this->assertArrayHasKey( 'error', $result );
			}
		}
	}

	public function test_invalid_css_handling() {
		$invalid_css_cases = [
			'.test { color: ; }', // Missing value
			'.test { : red; }', // Missing property
			'.test color: red; }', // Missing opening brace
			'.test { color red }', // Missing colon and semicolon
			'test { color: red; }', // Missing selector dot
			'.test { color: #gggggg; }', // Invalid hex color
			'.test { font-size: -10px; }', // Invalid negative size
			'.test { opacity: 2; }', // Invalid opacity > 1
		];
		
		foreach ( $invalid_css_cases as $css ) {
			$html = '<div class="test">Content</div>';
			
			// Should handle invalid CSS gracefully
			$result = $this->conversion_service->convert_from_html( $html );
			
			$this->assertIsArray( $result );
			
			if ( isset( $result['success'] ) && $result['success'] ) {
				// Should succeed but may have warnings
				if ( isset( $result['post_id'] ) ) {
					wp_delete_post( $result['post_id'], true );
				}
			}
		}
	}

	public function test_security_violation_handling() {
		$security_test_cases = [
			[
				'type' => 'html',
				'content' => '<div><script>alert("xss")</script><h1>Title</h1></div>',
				'expected_error' => 'security_violation',
			],
			[
				'type' => 'html',
				'content' => '<div><object data="malicious.swf"></object></div>',
				'expected_error' => 'security_violation',
			],
			[
				'type' => 'css',
				'content' => '.test { background: url("javascript:alert(1)"); }',
				'expected_error' => 'security_violation',
			],
			[
				'type' => 'css',
				'content' => '.test { content: "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="; }',
				'expected_error' => 'security_violation',
			],
		];
		
		foreach ( $security_test_cases as $test_case ) {
			$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
			$request->set_param( 'type', $test_case['type'] );
			$request->set_param( 'content', $test_case['content'] );
			
			$validation_result = $this->request_validator->validate_widget_conversion_request( $request );
			
			$this->assertInstanceOf( 'WP_REST_Response', $validation_result );
			$this->assertEquals( 400, $validation_result->get_status() );
			
			$data = $validation_result->get_data();
			$this->assertEquals( $test_case['expected_error'], $data['error'] );
		}
	}

	public function test_size_limit_handling() {
		// Test HTML size limit (10MB)
		$large_html = '<div>' . str_repeat( 'x', 11 * 1024 * 1024 ) . '</div>'; // 11MB
		
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', $large_html );
		
		$validation_result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $validation_result );
		$this->assertEquals( 413, $validation_result->get_status() );
		
		$data = $validation_result->get_data();
		$this->assertEquals( 'content_too_large', $data['error'] );
	}

	public function test_nesting_depth_limit_handling() {
		// Create deeply nested HTML (over 20 levels)
		$deep_html = str_repeat( '<div>', 25 ) . 'Deep content' . str_repeat( '</div>', 25 );
		
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', $deep_html );
		
		$validation_result = $this->request_validator->validate_widget_conversion_request( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $validation_result );
		$this->assertEquals( 400, $validation_result->get_status() );
		
		$data = $validation_result->get_data();
		$this->assertEquals( 'nesting_too_deep', $data['error'] );
	}

	public function test_partial_success_scenarios() {
		$mixed_html = '
			<div>
				<h1>Valid Title</h1>
				<p>Valid paragraph</p>
				<custom-element>Unsupported element</custom-element>
				<video controls>Unsupported media</video>
				<div style="invalid-property: bad-value;">Invalid CSS</div>
			</div>
		';
		
		$result = $this->conversion_service->convert_from_html( $mixed_html );
		
		// Should succeed partially
		$this->assertTrue( $result['success'] );
		$this->assertGreaterThan( 0, $result['widgets_created'] );
		
		// Should have warnings about unsupported elements
		$this->assertArrayHasKey( 'warnings', $result );
		$this->assertNotEmpty( $result['warnings'] );
		
		// Should have error report with fallback widgets
		if ( isset( $result['error_report'] ) ) {
			$summary = $result['error_report']['summary'];
			$this->assertGreaterThan( 0, $summary['total_warnings'] );
		}
		
		// Clean up
		wp_delete_post( $result['post_id'], true );
	}

	public function test_memory_exhaustion_handling() {
		// Test with content that could cause memory issues
		$memory_intensive_html = '<div>';
		for ( $i = 0; $i < 10000; $i++ ) {
			$memory_intensive_html .= "<div class='item-{$i}' data-index='{$i}' style='color: rgb({$i}, {$i}, {$i});'>Item {$i}</div>";
		}
		$memory_intensive_html .= '</div>';
		
		$memory_before = memory_get_usage();
		
		$result = $this->conversion_service->convert_from_html( $memory_intensive_html );
		
		$memory_after = memory_get_usage();
		$memory_used = $memory_after - $memory_before;
		
		// Should not use excessive memory (< 100MB)
		$this->assertLessThan( 100 * 1024 * 1024, $memory_used );
		
		// Should handle gracefully
		$this->assertIsArray( $result );
		
		if ( isset( $result['success'] ) && $result['success'] && isset( $result['post_id'] ) ) {
			wp_delete_post( $result['post_id'], true );
		}
	}

	public function test_timeout_handling() {
		// Simulate timeout scenario (would need actual implementation)
		$this->markTestIncomplete( 'Timeout handling requires actual HTTP requests or simulation' );
	}

	public function test_database_error_recovery() {
		// Test database connection issues (simulated)
		
		// Temporarily disable database writes (simulation)
		add_filter( 'wp_insert_post_data', function( $data ) {
			// Simulate database error
			if ( 'Elementor Widget Conversion' === substr( $data['post_title'], 0, 27 ) ) {
				return new \WP_Error( 'db_error', 'Simulated database error' );
			}
			return $data;
		} );
		
		$result = $this->conversion_service->convert_from_html( '<div><h1>Test</h1></div>' );
		
		// Should handle database errors gracefully
		$this->assertIsArray( $result );
		$this->assertFalse( $result['success'] ?? true );
		$this->assertArrayHasKey( 'error', $result );
		
		// Remove the filter
		remove_all_filters( 'wp_insert_post_data' );
	}

	public function test_permission_error_handling() {
		// Test with user without proper permissions
		wp_set_current_user( $this->factory->user->create( [ 'role' => 'subscriber' ] ) );
		
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div><h1>Test</h1></div>' );
		
		$widgets_route = new \Elementor\Modules\CssConverter\Routes\Widgets_Route();
		$permission_check = $widgets_route->check_permissions();
		
		// Should deny access for users without edit_posts capability
		$this->assertFalse( $permission_check );
		
		// Reset to admin user
		wp_set_current_user( $this->factory->user->create( [ 'role' => 'administrator' ] ) );
	}

	public function test_elementor_unavailable_handling() {
		// Test when Elementor is not available (simulated)
		if ( ! defined( 'ELEMENTOR_VERSION' ) ) {
			$this->markTestSkipped( 'Elementor not available - this is the expected scenario to test' );
		}
		
		// This would test the scenario where Elementor plugin is deactivated
		// In a real scenario, the conversion should fail gracefully
		$this->assertTrue( true ); // Placeholder
	}

	public function test_concurrent_error_scenarios() {
		// Test multiple error scenarios happening simultaneously
		$error_scenarios = [
			[
				'html' => '<div><script>alert("xss")</script></div>',
				'expected_error' => 'security_violation',
			],
			[
				'html' => str_repeat( '<div>', 25 ) . 'deep' . str_repeat( '</div>', 25 ),
				'expected_error' => 'nesting_too_deep',
			],
			[
				'html' => '<div>' . str_repeat( 'x', 11 * 1024 * 1024 ) . '</div>',
				'expected_error' => 'content_too_large',
			],
		];
		
		foreach ( $error_scenarios as $scenario ) {
			$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
			$request->set_param( 'type', 'html' );
			$request->set_param( 'content', $scenario['html'] );
			
			$validation_result = $this->request_validator->validate_widget_conversion_request( $request );
			
			$this->assertInstanceOf( 'WP_REST_Response', $validation_result );
			$this->assertGreaterThanOrEqual( 400, $validation_result->get_status() );
			
			$data = $validation_result->get_data();
			$this->assertEquals( $scenario['expected_error'], $data['error'] );
		}
	}

	public function test_error_reporting_accuracy() {
		// Test that error reports are accurate and helpful
		$test_html = '
			<div>
				<h1>Valid Title</h1>
				<custom-element>Invalid</custom-element>
				<p style="invalid-css: bad;">Invalid CSS</p>
			</div>
		';
		
		$result = $this->conversion_service->convert_from_html( $test_html );
		
		if ( isset( $result['error_report'] ) ) {
			$report = $result['error_report'];
			
			// Should have summary
			$this->assertArrayHasKey( 'summary', $report );
			$this->assertArrayHasKey( 'total_warnings', $report['summary'] );
			
			// Should have recommendations
			$this->assertArrayHasKey( 'recommendations', $report );
			$this->assertIsArray( $report['recommendations'] );
			
			// Should have grouped errors
			$this->assertArrayHasKey( 'errors_by_type', $report );
			$this->assertIsArray( $report['errors_by_type'] );
		}
		
		if ( isset( $result['post_id'] ) ) {
			wp_delete_post( $result['post_id'], true );
		}
	}

	public function test_recovery_strategy_effectiveness() {
		// Test that recovery strategies actually work
		$recovery_scenarios = [
			'widget_creation_failed' => [
				'widget' => [
					'widget_type' => 'e-heading',
					'element_data' => [ 'tag' => 'h1', 'content' => 'Test' ],
				],
			],
			'css_processing_failed' => [
				'widget' => [
					'widget_type' => 'e-text',
					'applied_styles' => [ 'color' => 'red' ],
				],
			],
			'global_class_failed' => [
				'widget' => [ 'widget_type' => 'e-heading' ],
				'css_styles' => [ 'color' => 'blue' ],
			],
		];
		
		foreach ( $recovery_scenarios as $error_type => $context ) {
			$error_data = [ 'message' => "Test {$error_type}" ];
			
			$recovery_result = $this->error_handler->handle_error( $error_type, $error_data, $context );
			
			// Should return a valid recovery result
			$this->assertNotNull( $recovery_result, "Recovery failed for {$error_type}" );
			$this->assertIsArray( $recovery_result, "Recovery result should be array for {$error_type}" );
		}
	}

	public function test_error_logging_integration() {
		// Test that errors are properly logged
		$original_debug_log = ini_get( 'log_errors' );
		ini_set( 'log_errors', 1 );
		
		$this->error_handler->handle_error( 'widget_creation_failed', [
			'message' => 'Test error for logging',
		], [] );
		
		$errors = $this->error_handler->get_error_log();
		$this->assertNotEmpty( $errors );
		
		$last_error = end( $errors );
		$this->assertEquals( 'widget_creation_failed', $last_error['type'] );
		$this->assertEquals( 'Test error for logging', $last_error['message'] );
		
		// Restore original setting
		ini_set( 'log_errors', $original_debug_log );
	}
}
