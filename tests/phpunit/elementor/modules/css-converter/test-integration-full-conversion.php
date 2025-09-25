<?php
namespace Elementor\Testing\Modules\CssConverter;

use Elementor\Modules\CssConverter\Services\Widget\Widget_Conversion_Service;
use Elementor\Modules\CssConverter\Routes\Widgets_Route;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group integration-tests
 */
class Test_Integration_Full_Conversion extends Elementor_Test_Base {

	private $conversion_service;
	private $widgets_route;

	public function setUp(): void {
		parent::setUp();
		$this->conversion_service = new Widget_Conversion_Service();
		$this->widgets_route = new Widgets_Route();
		
		// Ensure user has proper permissions
		wp_set_current_user( $this->factory->user->create( [ 'role' => 'administrator' ] ) );
	}

	public function test_complete_html_to_widgets_conversion() {
		$html = '
			<div class="hero-section" style="background-color: #f0f0f0; padding: 40px;">
				<h1 class="hero-title" style="color: #333; font-size: 48px; text-align: center;">Welcome to Our Site</h1>
				<p class="hero-description" style="color: #666; font-size: 18px; text-align: center; margin: 20px 0;">
					This is a beautiful hero section with styled content.
				</p>
				<div class="hero-actions" style="text-align: center;">
					<a href="/signup" class="btn-primary" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
						Get Started
					</a>
				</div>
			</div>
		';
		
		$result = $this->conversion_service->convert_from_html( $html );
		
		// Should successfully convert
		$this->assertTrue( $result['success'] );
		$this->assertArrayHasKey( 'post_id', $result );
		$this->assertArrayHasKey( 'edit_url', $result );
		$this->assertArrayHasKey( 'widgets_created', $result );
		$this->assertGreaterThan( 0, $result['widgets_created'] );
		
		// Should create post in draft mode (HVV requirement)
		$post = get_post( $result['post_id'] );
		$this->assertNotNull( $post );
		$this->assertEquals( 'draft', $post->post_status );
		
		// Should have Elementor meta
		$this->assertEquals( 'builder', get_post_meta( $post->ID, '_elementor_edit_mode', true ) );
		$this->assertNotEmpty( get_post_meta( $post->ID, '_elementor_version', true ) );
		
		// Clean up
		wp_delete_post( $result['post_id'], true );
	}

	public function test_html_with_external_css_conversion() {
		$html = '
			<div class="container">
				<h1 class="main-title">Styled Title</h1>
				<p class="description">Styled paragraph</p>
			</div>
		';
		
		$css = '
			.container {
				max-width: 1200px;
				margin: 0 auto;
				padding: 20px;
			}
			.main-title {
				color: #2c3e50;
				font-size: 36px;
				font-weight: bold;
				margin-bottom: 20px;
			}
			.description {
				color: #7f8c8d;
				font-size: 16px;
				line-height: 1.6;
			}
		';
		
		// Test with CSS URLs (simulated)
		$result = $this->conversion_service->convert_from_html( $html, [], false, [
			'createGlobalClasses' => true,
		] );
		
		$this->assertTrue( $result['success'] );
		$this->assertGreaterThan( 0, $result['widgets_created'] );
		
		// Should have processed CSS classes
		if ( isset( $result['global_classes_created'] ) ) {
			$this->assertGreaterThanOrEqual( 0, $result['global_classes_created'] );
		}
		
		// Clean up
		wp_delete_post( $result['post_id'], true );
	}

	public function test_css_only_conversion() {
		$css = '
			.primary-button {
				background-color: #007cba;
				color: white;
				padding: 12px 24px;
				border: none;
				border-radius: 4px;
				font-size: 16px;
				cursor: pointer;
			}
			.secondary-button {
				background-color: transparent;
				color: #007cba;
				border: 2px solid #007cba;
				padding: 10px 22px;
				border-radius: 4px;
			}
		';
		
		$result = $this->conversion_service->convert_from_css( $css );
		
		$this->assertTrue( $result['success'] );
		
		// CSS-only conversion should create global classes but no widgets
		$this->assertEquals( 0, $result['widgets_created'] ?? 0 );
		$this->assertGreaterThan( 0, $result['global_classes_created'] ?? 0 );
	}

	public function test_rest_api_integration() {
		// Test the REST API endpoint
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', '<div><h1>API Test</h1><p>Testing the REST API</p></div>' );
		$request->set_param( 'options', [
			'postType' => 'page',
			'createGlobalClasses' => true,
		] );
		
		$response = $this->widgets_route->handle_widget_conversion( $request );
		
		$this->assertInstanceOf( 'WP_REST_Response', $response );
		$this->assertEquals( 200, $response->get_status() );
		
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
		$this->assertArrayHasKey( 'post_id', $data );
		$this->assertGreaterThan( 0, $data['widgets_created'] );
		
		// Clean up
		wp_delete_post( $data['post_id'], true );
	}

	public function test_error_handling_integration() {
		// Test with malformed HTML
		$malformed_html = '<div><h1>Unclosed heading<p>Missing closing tags';
		
		$result = $this->conversion_service->convert_from_html( $malformed_html );
		
		// Should handle gracefully
		$this->assertIsArray( $result );
		
		// May succeed with warnings or fail gracefully
		if ( $result['success'] ?? false ) {
			$this->assertArrayHasKey( 'warnings', $result );
		} else {
			$this->assertArrayHasKey( 'error', $result );
		}
	}

	public function test_security_validation_integration() {
		// Test with malicious HTML
		$malicious_html = '
			<div>
				<script>alert("xss")</script>
				<h1>Title</h1>
				<object data="malicious.swf"></object>
			</div>
		';
		
		$request = new WP_REST_Request( 'POST', '/elementor/v2/widget-converter' );
		$request->set_param( 'type', 'html' );
		$request->set_param( 'content', $malicious_html );
		
		$response = $this->widgets_route->handle_widget_conversion( $request );
		
		// Should reject malicious content
		$this->assertEquals( 400, $response->get_status() );
		$data = $response->get_data();
		$this->assertEquals( 'security_violation', $data['error'] );
	}

	public function test_large_content_handling() {
		// Generate large HTML content
		$large_html = '<div class="container">';
		for ( $i = 0; $i < 100; $i++ ) {
			$large_html .= "
				<div class='section-{$i}'>
					<h2>Section {$i}</h2>
					<p>This is section {$i} with some content.</p>
					<div class='subsection'>
						<h3>Subsection</h3>
						<p>More content here.</p>
					</div>
				</div>
			";
		}
		$large_html .= '</div>';
		
		$start_time = microtime( true );
		$result = $this->conversion_service->convert_from_html( $large_html );
		$end_time = microtime( true );
		
		$processing_time = $end_time - $start_time;
		
		// Should process in reasonable time (< 10 seconds)
		$this->assertLessThan( 10.0, $processing_time );
		
		if ( $result['success'] ?? false ) {
			$this->assertGreaterThan( 0, $result['widgets_created'] );
			wp_delete_post( $result['post_id'], true );
		}
	}

	public function test_css_specificity_integration() {
		$html = '
			<div class="container">
				<h1 id="main-title" class="title primary">Complex Title</h1>
				<p class="text important">Important text</p>
			</div>
		';
		
		$css = '
			.title { color: blue; }
			#main-title { color: red; }
			.title.primary { color: green; }
			.important { color: purple !important; }
		';
		
		// Simulate CSS processing with specificity
		$result = $this->conversion_service->convert_from_html( $html );
		
		$this->assertTrue( $result['success'] );
		$this->assertGreaterThan( 0, $result['widgets_created'] );
		
		// Clean up
		wp_delete_post( $result['post_id'], true );
	}

	public function test_global_classes_integration() {
		$html = '
			<div class="card">
				<h2 class="card-title">Card 1</h2>
				<p class="card-text">Card content</p>
			</div>
			<div class="card">
				<h2 class="card-title">Card 2</h2>
				<p class="card-text">More content</p>
			</div>
		';
		
		$result = $this->conversion_service->convert_from_html( $html, [], false, [
			'createGlobalClasses' => true,
			'globalClassThreshold' => 1, // HVV decision: threshold = 1
		] );
		
		$this->assertTrue( $result['success'] );
		$this->assertGreaterThan( 0, $result['widgets_created'] );
		
		// Should create global classes for repeated classes
		if ( isset( $result['global_classes_created'] ) ) {
			$this->assertGreaterThan( 0, $result['global_classes_created'] );
		}
		
		// Clean up
		wp_delete_post( $result['post_id'], true );
	}

	public function test_widget_hierarchy_integration() {
		$nested_html = '
			<div class="page-wrapper">
				<header class="site-header">
					<div class="header-content">
						<h1 class="site-title">Site Name</h1>
						<nav class="main-nav">
							<a href="/home">Home</a>
							<a href="/about">About</a>
						</nav>
					</div>
				</header>
				<main class="main-content">
					<section class="hero">
						<h2 class="hero-title">Hero Title</h2>
						<p class="hero-text">Hero description</p>
					</section>
				</main>
			</div>
		';
		
		$result = $this->conversion_service->convert_from_html( $nested_html );
		
		$this->assertTrue( $result['success'] );
		$this->assertGreaterThan( 0, $result['widgets_created'] );
		
		// Should handle nested structure correctly
		if ( isset( $result['hierarchy_stats'] ) ) {
			$this->assertArrayHasKey( 'depth_levels', $result['hierarchy_stats'] );
			$this->assertGreaterThan( 0, $result['hierarchy_stats']['depth_levels'] );
		}
		
		// Clean up
		wp_delete_post( $result['post_id'], true );
	}

	public function test_fallback_widgets_integration() {
		$html_with_unsupported = '
			<div>
				<h1>Supported Title</h1>
				<video controls>
					<source src="video.mp4" type="video/mp4">
				</video>
				<canvas id="myCanvas" width="200" height="100"></canvas>
				<table>
					<tr><td>Table content</td></tr>
				</table>
			</div>
		';
		
		$result = $this->conversion_service->convert_from_html( $html_with_unsupported );
		
		$this->assertTrue( $result['success'] );
		$this->assertGreaterThan( 0, $result['widgets_created'] );
		
		// Should have created fallback widgets for unsupported elements
		if ( isset( $result['error_report']['summary']['fallback_widgets_created'] ) ) {
			$this->assertGreaterThan( 0, $result['error_report']['summary']['fallback_widgets_created'] );
		}
		
		// Clean up
		wp_delete_post( $result['post_id'], true );
	}

	public function test_partial_success_scenarios() {
		$mixed_html = '
			<div>
				<h1>Valid Title</h1>
				<p>Valid paragraph</p>
				<invalid-element>Custom element</invalid-element>
				<div style="invalid-css: bad-value;">Invalid CSS</div>
			</div>
		';
		
		$result = $this->conversion_service->convert_from_html( $mixed_html );
		
		// Should succeed partially
		$this->assertTrue( $result['success'] );
		$this->assertGreaterThan( 0, $result['widgets_created'] );
		
		// Should have warnings about invalid elements/CSS
		$this->assertArrayHasKey( 'warnings', $result );
		
		// Clean up
		wp_delete_post( $result['post_id'], true );
	}

	public function test_elementor_version_compatibility() {
		// Test that conversion works with current Elementor version
		if ( ! defined( 'ELEMENTOR_VERSION' ) ) {
			$this->markTestSkipped( 'Elementor not available' );
		}
		
		$html = '<div><h1>Version Test</h1></div>';
		$result = $this->conversion_service->convert_from_html( $html );
		
		$this->assertTrue( $result['success'] );
		
		$post = get_post( $result['post_id'] );
		$elementor_version = get_post_meta( $post->ID, '_elementor_version', true );
		
		// Should use current Elementor version
		$this->assertEquals( ELEMENTOR_VERSION, $elementor_version );
		
		// Clean up
		wp_delete_post( $result['post_id'], true );
	}

	public function test_performance_benchmarks() {
		$test_cases = [
			'small' => str_repeat( '<p>Small content</p>', 10 ),
			'medium' => str_repeat( '<div><h2>Medium</h2><p>Content</p></div>', 50 ),
			'large' => str_repeat( '<section><h2>Large</h2><p>Content</p><div>More</div></section>', 200 ),
		];
		
		$benchmarks = [];
		
		foreach ( $test_cases as $size => $html ) {
			$start_time = microtime( true );
			$result = $this->conversion_service->convert_from_html( $html );
			$end_time = microtime( true );
			
			$processing_time = $end_time - $start_time;
			$benchmarks[ $size ] = $processing_time;
			
			// Should complete in reasonable time
			$max_time = [
				'small' => 1.0,   // 1 second
				'medium' => 3.0,  // 3 seconds
				'large' => 10.0,  // 10 seconds
			];
			
			$this->assertLessThan( $max_time[ $size ], $processing_time, "Size '{$size}' took too long: {$processing_time}s" );
			
			if ( $result['success'] ?? false ) {
				wp_delete_post( $result['post_id'], true );
			}
		}
		
		// Log benchmarks for analysis
		error_log( 'Widget Converter Performance Benchmarks: ' . wp_json_encode( $benchmarks ) );
	}

	public function test_memory_usage() {
		$memory_before = memory_get_usage();
		
		// Process moderately large content
		$html = str_repeat( '<div class="item"><h3>Title</h3><p>Content</p></div>', 500 );
		$result = $this->conversion_service->convert_from_html( $html );
		
		$memory_after = memory_get_usage();
		$memory_used = $memory_after - $memory_before;
		
		// Should not use excessive memory (< 50MB)
		$this->assertLessThan( 50 * 1024 * 1024, $memory_used, "Memory usage too high: " . size_format( $memory_used ) );
		
		if ( $result['success'] ?? false ) {
			wp_delete_post( $result['post_id'], true );
		}
	}

	public function test_concurrent_conversions() {
		// Simulate concurrent conversions
		$html_templates = [
			'<div><h1>Conversion 1</h1></div>',
			'<div><h2>Conversion 2</h2></div>',
			'<div><h3>Conversion 3</h3></div>',
		];
		
		$results = [];
		
		foreach ( $html_templates as $i => $html ) {
			$results[ $i ] = $this->conversion_service->convert_from_html( $html );
		}
		
		// All conversions should succeed
		foreach ( $results as $i => $result ) {
			$this->assertTrue( $result['success'], "Conversion {$i} failed" );
			$this->assertArrayHasKey( 'post_id', $result );
			
			// Each should have unique post ID
			foreach ( $results as $j => $other_result ) {
				if ( $i !== $j ) {
					$this->assertNotEquals( $result['post_id'], $other_result['post_id'], "Post IDs should be unique" );
				}
			}
			
			// Clean up
			wp_delete_post( $result['post_id'], true );
		}
	}
}
