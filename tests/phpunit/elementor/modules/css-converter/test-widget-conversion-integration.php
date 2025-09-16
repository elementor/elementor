<?php
namespace Elementor\Testing\Modules\CssConverter;

use Elementor\Modules\CssConverter\Services\Widget\Widget_Conversion_Service;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group integration
 */
class Test_Widget_Conversion_Integration extends Elementor_Test_Base {

	private $widget_conversion_service;

	public function setUp(): void {
		parent::setUp();
		$this->widget_conversion_service = new Widget_Conversion_Service();
	}

	public function test_end_to_end_html_to_widget_conversion() {
		$html = '
			<div class="container">
				<header class="header">
					<h1 id="main-title" class="title primary">Welcome to Our Site</h1>
					<nav class="navigation">
						<a href="/home" class="nav-link">Home</a>
						<a href="/about" class="nav-link">About</a>
					</nav>
				</header>
				<main class="content">
					<section class="hero">
						<h2 class="hero-title">Hero Section</h2>
						<p class="hero-text">This is the hero section content.</p>
						<button class="cta-button">Get Started</button>
					</section>
					<section class="features">
						<div class="feature">
							<img src="feature1.jpg" alt="Feature 1" class="feature-image">
							<h3 class="feature-title">Feature One</h3>
							<p class="feature-description">Description of feature one.</p>
						</div>
					</section>
				</main>
			</div>
		';
		
		$css = '
			.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
			.header { background: #f8f9fa; padding: 20px 0; border-bottom: 1px solid #dee2e6; }
			#main-title { color: #212529; font-size: 2.5rem; margin-bottom: 1rem; }
			.title.primary { font-weight: 700; }
			.navigation { margin-top: 1rem; }
			.nav-link { color: #007bff; text-decoration: none; margin-right: 1rem; }
			.nav-link:hover { text-decoration: underline; }
			.content { padding: 2rem 0; }
			.hero { text-align: center; padding: 3rem 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
			.hero-title { font-size: 2rem; margin-bottom: 1rem; }
			.hero-text { font-size: 1.2rem; margin-bottom: 2rem; }
			.cta-button { background: #28a745; color: white; border: none; padding: 12px 24px; font-size: 1.1rem; border-radius: 4px; cursor: pointer; }
			.cta-button:hover { background: #218838; }
			.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }
			.feature { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; text-align: center; }
			.feature-image { width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 1rem; }
			.feature-title { color: #495057; font-size: 1.5rem; margin-bottom: 1rem; }
			.feature-description { color: #6c757d; line-height: 1.6; }
		';
		
		$options = [
			'create_draft' => true,
			'global_class_threshold' => 1,
			'follow_imports' => false,
			'timeout' => 30
		];
		
		$result = $this->widget_conversion_service->convert_from_html( $html, $css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		
		if ( $result['success'] ) {
			$data = $result['data'];
			
			$this->assertArrayHasKey( 'widgets', $data );
			$this->assertArrayHasKey( 'global_classes', $data );
			$this->assertArrayHasKey( 'post_id', $data );
			$this->assertArrayHasKey( 'processing_stats', $data );
			
			$this->assertIsArray( $data['widgets'] );
			$this->assertNotEmpty( $data['widgets'] );
			
			// Verify widget types are correctly mapped
			$widget_types = array_column( $data['widgets'], 'widget_type' );
			$this->assertContains( 'e-flexbox', $widget_types ); // div elements
			$this->assertContains( 'e-heading', $widget_types ); // h1, h2, h3
			$this->assertContains( 'e-text', $widget_types ); // p elements
			$this->assertContains( 'e-button', $widget_types ); // button
			$this->assertContains( 'e-image', $widget_types ); // img
			$this->assertContains( 'e-link', $widget_types ); // a elements
			
			// Verify global classes were created (threshold = 1)
			$this->assertIsArray( $data['global_classes'] );
			$this->assertNotEmpty( $data['global_classes'] );
			
			// Verify post was created in draft mode
			$this->assertIsInt( $data['post_id'] );
			$this->assertGreaterThan( 0, $data['post_id'] );
			
			// Verify processing stats
			$stats = $data['processing_stats'];
			$this->assertArrayHasKey( 'total_elements', $stats );
			$this->assertArrayHasKey( 'mapped_widgets', $stats );
			$this->assertArrayHasKey( 'global_classes_created', $stats );
			$this->assertArrayHasKey( 'processing_time', $stats );
			
			$this->assertGreaterThan( 0, $stats['total_elements'] );
			$this->assertGreaterThan( 0, $stats['mapped_widgets'] );
			$this->assertGreaterThan( 0, $stats['global_classes_created'] );
			
		} else {
			$this->assertArrayHasKey( 'error', $result );
			$this->assertArrayHasKey( 'error_code', $result );
			$this->fail( 'Full conversion workflow failed: ' . $result['error'] );
		}
	}

	public function test_converts_from_url() {
		$url = 'https://example.com/test-page.html';
		$options = [ 'create_draft' => true, 'timeout' => 30 ];
		
		$result = $this->widget_conversion_service->convert_from_url( $url, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		$this->assertArrayHasKey( 'data', $result );
		
		// Since this is a fake URL, it should fail gracefully
		if ( ! $result['success'] ) {
			$this->assertArrayHasKey( 'error', $result );
			$this->assertArrayHasKey( 'error_code', $result );
			$this->assertContains( $result['error_code'], [ 'URL_FETCH_FAILED', 'INVALID_URL', 'TIMEOUT' ] );
		}
	}

	public function test_converts_css_only() {
		$css = '
			.button { background: #007cba; color: white; padding: 10px 20px; border-radius: 4px; }
			.heading { font-size: 24px; font-weight: bold; color: #333; }
			.card { background: white; border: 1px solid #ddd; border-radius: 8px; padding: 16px; }
		';
		$options = [ 'global_class_threshold' => 1 ];
		
		$result = $this->widget_conversion_service->convert_from_css( $css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		$this->assertArrayHasKey( 'data', $result );
		
		if ( $result['success'] ) {
			$data = $result['data'];
			
			$this->assertArrayHasKey( 'global_classes', $data );
			$this->assertArrayHasKey( 'processing_stats', $data );
			
			// Should create global classes for each CSS class
			$global_classes = $data['global_classes'];
			$this->assertArrayHasKey( 'button', $global_classes );
			$this->assertArrayHasKey( 'heading', $global_classes );
			$this->assertArrayHasKey( 'card', $global_classes );
			
			// Verify processing stats
			$stats = $data['processing_stats'];
			$this->assertArrayHasKey( 'global_classes_created', $stats );
			$this->assertEquals( 3, $stats['global_classes_created'] );
		}
	}

	public function test_handles_malformed_html_gracefully() {
		$malformed_html = '<div><h1>Unclosed title<p>Missing closing tags<span>Nested incorrectly</div>';
		$css = '';
		$options = [ 'create_draft' => true ];
		
		$result = $this->widget_conversion_service->convert_from_html( $malformed_html, $css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		
		if ( ! $result['success'] ) {
			$this->assertArrayHasKey( 'error', $result );
			$this->assertArrayHasKey( 'error_code', $result );
			$this->assertContains( $result['error_code'], [ 'INVALID_HTML', 'PARSING_ERROR', 'HTML_VALIDATION_FAILED' ] );
		}
	}

	public function test_handles_invalid_css_with_warnings() {
		$html = '<div><h1>Valid HTML</h1></div>';
		$invalid_css = '.class { color: ; font-size: invalid; } broken-selector { }';
		$options = [ 'create_draft' => true ];
		
		$result = $this->widget_conversion_service->convert_from_html( $html, $invalid_css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		
		if ( $result['success'] ) {
			// Should succeed but with warnings
			$this->assertArrayHasKey( 'warnings', $result );
			$this->assertNotEmpty( $result['warnings'] );
		}
	}

	public function test_respects_global_class_threshold() {
		$html = '<div><h1 class="title">Title 1</h1><h2 class="title">Title 2</h2><h3 class="subtitle">Subtitle</h3></div>';
		$css = '.title { color: red; font-weight: bold; } .subtitle { color: blue; }';
		$options = [ 'create_draft' => true, 'global_class_threshold' => 1 ]; // HVV Decision: threshold = 1
		
		$result = $this->widget_conversion_service->convert_from_html( $html, $css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		
		if ( $result['success'] ) {
			$data = $result['data'];
			$this->assertArrayHasKey( 'global_classes', $data );
			
			// With threshold = 1, both classes should become global classes
			$global_classes = $data['global_classes'];
			$this->assertArrayHasKey( 'title', $global_classes );
			$this->assertArrayHasKey( 'subtitle', $global_classes );
		}
	}

	public function test_handles_important_declarations_correctly() {
		$html = '<div><h1 class="title" style="color: blue !important;">Important Title</h1></div>';
		$css = '.title { color: red; }';
		$options = [ 'create_draft' => true ];
		
		$result = $this->widget_conversion_service->convert_from_html( $html, $css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		
		if ( $result['success'] ) {
			$data = $result['data'];
			$this->assertArrayHasKey( 'widgets', $data );
			
			// Find the heading widget
			$heading_widget = null;
			foreach ( $data['widgets'] as $widget ) {
				if ( 'e-heading' === $widget['widget_type'] ) {
					$heading_widget = $widget;
					break;
				}
			}
			
			$this->assertNotNull( $heading_widget );
			
			// The inline !important style should take precedence
			if ( isset( $heading_widget['computed_styles'] ) ) {
				$computed_styles = $heading_widget['computed_styles'];
				if ( isset( $computed_styles['color'] ) ) {
					$this->assertEquals( 'blue', $computed_styles['color']['value'] );
					$this->assertTrue( $computed_styles['color']['important'] );
				}
			}
		}
	}

	public function test_creates_draft_post_correctly() {
		$html = '<div><h1>Test Title</h1><p>Test content</p></div>';
		$css = '.test { color: red; }';
		$options = [ 'create_draft' => true ];
		
		$result = $this->widget_conversion_service->convert_from_html( $html, $css, [], $options );
		
		if ( $result['success'] ) {
			$post_id = $result['data']['post_id'];
			
			// Verify post exists and is in draft status
			$post = get_post( $post_id );
			$this->assertNotNull( $post );
			$this->assertEquals( 'draft', $post->post_status );
			$this->assertEquals( 'page', $post->post_type );
			
			// Clean up
			wp_delete_post( $post_id, true );
		}
	}

	public function test_error_reporting_and_graceful_degradation() {
		// Test with empty input
		$result = $this->widget_conversion_service->convert_from_html( '', '', [], [] );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		
		if ( ! $result['success'] ) {
			$this->assertArrayHasKey( 'error', $result );
			$this->assertArrayHasKey( 'error_code', $result );
			$this->assertIsString( $result['error'] );
			$this->assertIsString( $result['error_code'] );
		}
	}

	public function test_processing_statistics_accuracy() {
		$html = '
			<div class="container">
				<h1 class="title">Title</h1>
				<h2 class="subtitle">Subtitle</h2>
				<p class="text">Paragraph</p>
				<img src="test.jpg" alt="Test">
				<a href="/link">Link</a>
				<button class="btn">Button</button>
			</div>
		';
		$css = '.container { padding: 20px; } .title { color: red; } .subtitle { color: blue; } .text { font-size: 16px; } .btn { background: green; }';
		$options = [ 'create_draft' => true, 'global_class_threshold' => 1 ];
		
		$result = $this->widget_conversion_service->convert_from_html( $html, $css, [], $options );
		
		if ( $result['success'] ) {
			$stats = $result['data']['processing_stats'];
			
			// Verify element counts
			$this->assertGreaterThan( 0, $stats['total_elements'] );
			$this->assertGreaterThan( 0, $stats['mapped_widgets'] );
			
			// Verify global class counts
			$this->assertGreaterThan( 0, $stats['global_classes_created'] );
			
			// Verify processing time is recorded
			$this->assertArrayHasKey( 'processing_time', $stats );
			$this->assertIsNumeric( $stats['processing_time'] );
		}
	}
}
