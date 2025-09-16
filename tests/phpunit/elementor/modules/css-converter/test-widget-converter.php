<?php
namespace Elementor\Testing\Modules\CssConverter;

use Elementor\Modules\CssConverter\Services\Html_Parser;
use Elementor\Modules\CssConverter\Services\Widget_Mapper;
use Elementor\Modules\CssConverter\Services\Css_Specificity_Calculator;
use Elementor\Modules\CssConverter\Services\Css_Processor;
use Elementor\Modules\CssConverter\Services\Widget_Conversion_Service;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 */
class Test_Widget_Converter extends Elementor_Test_Base {

	private $html_parser;
	private $widget_mapper;
	private $css_specificity_calculator;
	private $css_processor;
	private $widget_conversion_service;

	public function setUp(): void {
		parent::setUp();
		
		$this->html_parser = new Html_Parser();
		$this->widget_mapper = new Widget_Mapper();
		$this->css_specificity_calculator = new Css_Specificity_Calculator();
		$this->css_processor = new Css_Processor();
		$this->widget_conversion_service = new Widget_Conversion_Service();
	}

	public function test_html_parser_basic_functionality() {
		$html = '<div class="container"><h1 id="title">Hello World</h1><p>This is a paragraph.</p></div>';
		
		$result = $this->html_parser->parse( $html );
		
		$this->assertNotNull( $result );
		$this->assertArrayHasKey( 'dom', $result );
		$this->assertArrayHasKey( 'elements', $result );
		$this->assertInstanceOf( 'DOMDocument', $result['dom'] );
		$this->assertIsArray( $result['elements'] );
		$this->assertGreaterThan( 0, count( $result['elements'] ) );
	}

	public function test_html_parser_extracts_inline_styles() {
		$html = '<div style="color: red; font-size: 16px;"><p style="margin: 10px;">Styled content</p></div>';
		
		$result = $this->html_parser->parse( $html );
		$inline_css = $this->html_parser->extract_inline_css( $result['dom'] );
		
		$this->assertIsArray( $inline_css );
		$this->assertNotEmpty( $inline_css );
		$this->assertArrayHasKey( 'color', $inline_css[0] ?? [] );
		$this->assertEquals( 'red', $inline_css[0]['color'] ?? '' );
	}

	public function test_html_parser_extracts_linked_css() {
		$html = '<html><head><link rel="stylesheet" href="styles.css"><style>.test { color: blue; }</style></head><body><div>Content</div></body></html>';
		
		$result = $this->html_parser->parse( $html );
		$linked_css = $this->html_parser->extract_linked_css( $result['dom'] );
		
		$this->assertIsArray( $linked_css );
		$this->assertArrayHasKey( 'external', $linked_css );
		$this->assertArrayHasKey( 'internal', $linked_css );
		$this->assertContains( 'styles.css', $linked_css['external'] );
		$this->assertStringContains( '.test { color: blue; }', $linked_css['internal'] );
	}

	public function test_html_parser_validates_structure() {
		$valid_html = '<div><h1>Title</h1><p>Content</p></div>';
		$invalid_html = '<div><h1>Unclosed title<p>Content</div>';
		
		$this->assertTrue( $this->html_parser->validate_html_structure( $valid_html ) );
		$this->assertFalse( $this->html_parser->validate_html_structure( $invalid_html ) );
	}

	public function test_html_parser_sanitizes_html() {
		$malicious_html = '<div><script>alert("xss")</script><h1>Safe Title</h1><iframe src="evil.com"></iframe></div>';
		
		$sanitized = $this->html_parser->sanitize_html( $malicious_html );
		
		$this->assertStringNotContains( '<script>', $sanitized );
		$this->assertStringNotContains( '<iframe>', $sanitized );
		$this->assertStringContains( '<h1>Safe Title</h1>', $sanitized );
	}

	public function test_widget_mapper_supported_tags() {
		$supported_tags = $this->widget_mapper->get_supported_tags();
		
		$this->assertIsArray( $supported_tags );
		$this->assertContains( 'h1', $supported_tags );
		$this->assertContains( 'h2', $supported_tags );
		$this->assertContains( 'h3', $supported_tags );
		$this->assertContains( 'h4', $supported_tags );
		$this->assertContains( 'h5', $supported_tags );
		$this->assertContains( 'h6', $supported_tags );
		$this->assertContains( 'p', $supported_tags );
		$this->assertContains( 'div', $supported_tags );
		$this->assertContains( 'img', $supported_tags );
		$this->assertContains( 'a', $supported_tags );
		$this->assertContains( 'button', $supported_tags );
	}

	public function test_widget_mapper_resolves_widget_types() {
		$this->assertEquals( 'e-heading', $this->widget_mapper->resolve_widget_type( 'h1' ) );
		$this->assertEquals( 'e-heading', $this->widget_mapper->resolve_widget_type( 'h2' ) );
		$this->assertEquals( 'e-heading', $this->widget_mapper->resolve_widget_type( 'h3' ) );
		$this->assertEquals( 'e-text', $this->widget_mapper->resolve_widget_type( 'p' ) );
		$this->assertEquals( 'e-flexbox', $this->widget_mapper->resolve_widget_type( 'div' ) );
		$this->assertEquals( 'e-image', $this->widget_mapper->resolve_widget_type( 'img' ) );
		$this->assertEquals( 'e-link', $this->widget_mapper->resolve_widget_type( 'a' ) );
		$this->assertEquals( 'e-button', $this->widget_mapper->resolve_widget_type( 'button' ) );
	}

	public function test_widget_mapper_maps_elements() {
		$html = '<div class="container"><h1 id="title">Hello</h1><p class="text">World</p></div>';
		$parsed = $this->html_parser->parse( $html );
		
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$this->assertIsArray( $mapped );
		$this->assertNotEmpty( $mapped );
		
		foreach ( $mapped as $widget ) {
			$this->assertArrayHasKey( 'widget_type', $widget );
			$this->assertArrayHasKey( 'element_data', $widget );
			$this->assertContains( $widget['widget_type'], [ 'e-flexbox', 'e-heading', 'e-text' ] );
		}
	}

	public function test_widget_mapper_provides_mapping_stats() {
		$html = '<div><h1>Title</h1><h2>Subtitle</h2><p>Text</p><img src="test.jpg" alt="Test"></div>';
		$parsed = $this->html_parser->parse( $html );
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$stats = $this->widget_mapper->get_mapping_stats( $mapped );
		
		$this->assertIsArray( $stats );
		$this->assertArrayHasKey( 'total_elements', $stats );
		$this->assertArrayHasKey( 'mapped_elements', $stats );
		$this->assertArrayHasKey( 'widget_types', $stats );
		$this->assertGreaterThan( 0, $stats['total_elements'] );
		$this->assertEquals( $stats['total_elements'], $stats['mapped_elements'] );
	}

	public function test_css_specificity_calculator_basic_selectors() {
		$this->assertEquals( [ 0, 0, 0, 1 ], $this->css_specificity_calculator->calculate_specificity( 'div' ) );
		$this->assertEquals( [ 0, 0, 1, 0 ], $this->css_specificity_calculator->calculate_specificity( '.class' ) );
		$this->assertEquals( [ 0, 1, 0, 0 ], $this->css_specificity_calculator->calculate_specificity( '#id' ) );
		$this->assertEquals( [ 1, 0, 0, 0 ], $this->css_specificity_calculator->calculate_specificity( 'div !important' ) );
	}

	public function test_css_specificity_calculator_complex_selectors() {
		$this->assertEquals( [ 0, 1, 1, 1 ], $this->css_specificity_calculator->calculate_specificity( '#id .class div' ) );
		$this->assertEquals( [ 0, 0, 2, 1 ], $this->css_specificity_calculator->calculate_specificity( '.class1.class2 p' ) );
		$this->assertEquals( [ 1, 1, 1, 1 ], $this->css_specificity_calculator->calculate_specificity( '#id .class div !important' ) );
	}

	public function test_css_specificity_calculator_formats_specificity() {
		$specificity = [ 0, 1, 2, 3 ];
		$formatted = $this->css_specificity_calculator->format_specificity( $specificity );
		
		$this->assertIsString( $formatted );
		$this->assertEquals( '0,1,2,3', $formatted );
	}

	public function test_css_processor_processes_css_for_widgets() {
		$css = '.title { color: red; font-size: 24px; } #main { background: blue; } div { margin: 10px; }';
		$html = '<div id="main"><h1 class="title">Hello World</h1></div>';
		
		$parsed = $this->html_parser->parse( $html );
		$mapped = $this->widget_mapper->map_elements( $parsed['elements'] );
		
		$result = $this->css_processor->process_css_for_widgets( $css, $mapped );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'styled_widgets', $result );
		$this->assertArrayHasKey( 'global_classes', $result );
		$this->assertArrayHasKey( 'processing_stats', $result );
	}

	public function test_css_processor_fetches_css_from_urls() {
		$urls = [ 'https://example.com/styles.css', 'https://example.com/theme.css' ];
		
		$result = $this->css_processor->fetch_css_from_urls( $urls );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'css_content', $result );
		$this->assertArrayHasKey( 'failed_urls', $result );
		$this->assertArrayHasKey( 'fetch_stats', $result );
	}

	public function test_css_processor_extracts_css_rules() {
		$css = '.class1 { color: red; } #id1 { font-size: 16px; } div { margin: 10px; }';
		
		$rules = $this->css_processor->extract_css_rules( $css );
		
		$this->assertIsArray( $rules );
		$this->assertNotEmpty( $rules );
		
		foreach ( $rules as $rule ) {
			$this->assertArrayHasKey( 'selector', $rule );
			$this->assertArrayHasKey( 'properties', $rule );
			$this->assertArrayHasKey( 'specificity', $rule );
		}
	}

	public function test_widget_conversion_service_converts_from_html() {
		$html = '<div class="container" style="background: #f0f0f0;"><h1 class="title">Hello World</h1><p>This is a test paragraph.</p></div>';
		$css = '.container { padding: 20px; } .title { color: #333; font-size: 28px; }';
		$options = [ 'create_draft' => true, 'global_class_threshold' => 1 ];
		
		$result = $this->widget_conversion_service->convert_from_html( $html, $css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		$this->assertArrayHasKey( 'data', $result );
		
		if ( $result['success'] ) {
			$this->assertArrayHasKey( 'widgets', $result['data'] );
			$this->assertArrayHasKey( 'global_classes', $result['data'] );
			$this->assertArrayHasKey( 'post_id', $result['data'] );
		}
	}

	public function test_widget_conversion_service_converts_from_url() {
		$url = 'https://example.com/test-page.html';
		$options = [ 'create_draft' => true, 'timeout' => 30 ];
		
		$result = $this->widget_conversion_service->convert_from_url( $url, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		$this->assertArrayHasKey( 'data', $result );
		
		if ( ! $result['success'] ) {
			$this->assertArrayHasKey( 'error', $result );
			$this->assertArrayHasKey( 'error_code', $result );
		}
	}

	public function test_widget_conversion_service_converts_from_css() {
		$css = '.button { background: #007cba; color: white; padding: 10px 20px; border-radius: 4px; } .heading { font-size: 24px; font-weight: bold; }';
		$options = [ 'global_class_threshold' => 1 ];
		
		$result = $this->widget_conversion_service->convert_from_css( $css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		$this->assertArrayHasKey( 'data', $result );
		
		if ( $result['success'] ) {
			$this->assertArrayHasKey( 'global_classes', $result['data'] );
			$this->assertArrayHasKey( 'processing_stats', $result['data'] );
		}
	}

	public function test_widget_conversion_service_handles_malformed_html() {
		$malformed_html = '<div><h1>Unclosed title<p>Missing closing tags<span>Nested incorrectly</div>';
		$css = '';
		$options = [ 'create_draft' => true ];
		
		$result = $this->widget_conversion_service->convert_from_html( $malformed_html, $css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		
		if ( ! $result['success'] ) {
			$this->assertArrayHasKey( 'error', $result );
			$this->assertArrayHasKey( 'error_code', $result );
			$this->assertContains( $result['error_code'], [ 'INVALID_HTML', 'PARSING_ERROR' ] );
		}
	}

	public function test_widget_conversion_service_handles_invalid_css() {
		$html = '<div><h1>Valid HTML</h1></div>';
		$invalid_css = '.class { color: ; font-size: invalid; } broken-selector { }';
		$options = [ 'create_draft' => true ];
		
		$result = $this->widget_conversion_service->convert_from_html( $html, $invalid_css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		
		if ( $result['success'] ) {
			$this->assertArrayHasKey( 'warnings', $result );
			$this->assertNotEmpty( $result['warnings'] );
		}
	}

	public function test_widget_conversion_service_respects_global_class_threshold() {
		$html = '<div><h1 class="title">Title 1</h1><h2 class="title">Title 2</h2></div>';
		$css = '.title { color: red; font-weight: bold; }';
		$options = [ 'create_draft' => true, 'global_class_threshold' => 2 ];
		
		$result = $this->widget_conversion_service->convert_from_html( $html, $css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		
		if ( $result['success'] ) {
			$this->assertArrayHasKey( 'global_classes', $result['data'] );
			$this->assertNotEmpty( $result['data']['global_classes'] );
		}
	}

	public function test_widget_conversion_service_handles_important_declarations() {
		$html = '<div><h1 class="title" style="color: blue !important;">Important Title</h1></div>';
		$css = '.title { color: red; }';
		$options = [ 'create_draft' => true ];
		
		$result = $this->widget_conversion_service->convert_from_html( $html, $css, [], $options );
		
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'success', $result );
		
		if ( $result['success'] ) {
			$this->assertArrayHasKey( 'widgets', $result['data'] );
			$widgets = $result['data']['widgets'];
			
			$title_widget = null;
			foreach ( $widgets as $widget ) {
				if ( 'e-heading' === $widget['widget_type'] ) {
					$title_widget = $widget;
					break;
				}
			}
			
			$this->assertNotNull( $title_widget );
		}
	}
}