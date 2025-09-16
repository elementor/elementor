<?php
namespace Elementor\Testing\Modules\CssConverter\Services;

use Elementor\Modules\CssConverter\Services\Html_Parser;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group html-parser
 */
class Test_Html_Parser extends Elementor_Test_Base {

	private $html_parser;

	public function setUp(): void {
		parent::setUp();
		$this->html_parser = new Html_Parser();
	}

	public function test_parses_basic_html_structure() {
		$html = '<div class="container"><h1 id="title">Hello World</h1><p>This is a paragraph.</p></div>';
		
		$result = $this->html_parser->parse( $html );
		
		$this->assertNotNull( $result );
		$this->assertArrayHasKey( 'dom', $result );
		$this->assertArrayHasKey( 'elements', $result );
		$this->assertInstanceOf( 'DOMDocument', $result['dom'] );
		$this->assertIsArray( $result['elements'] );
		$this->assertGreaterThan( 0, count( $result['elements'] ) );
	}

	public function test_extracts_inline_styles() {
		$html = '<div style="color: red; font-size: 16px;"><p style="margin: 10px;">Styled content</p></div>';
		
		$result = $this->html_parser->parse( $html );
		$inline_css = $this->html_parser->extract_inline_css( $result['dom'] );
		
		$this->assertIsArray( $inline_css );
		$this->assertNotEmpty( $inline_css );
		$this->assertArrayHasKey( 'color', $inline_css[0] ?? [] );
		$this->assertEquals( 'red', $inline_css[0]['color'] ?? '' );
	}

	public function test_extracts_linked_css() {
		$html = '<html><head><link rel="stylesheet" href="styles.css"><style>.test { color: blue; }</style></head><body><div>Content</div></body></html>';
		
		$result = $this->html_parser->parse( $html );
		$linked_css = $this->html_parser->extract_linked_css( $result['dom'] );
		
		$this->assertIsArray( $linked_css );
		$this->assertArrayHasKey( 'external', $linked_css );
		$this->assertArrayHasKey( 'internal', $linked_css );
		$this->assertContains( 'styles.css', $linked_css['external'] );
		$this->assertStringContains( '.test { color: blue; }', $linked_css['internal'] );
	}

	public function test_validates_html_structure() {
		$valid_html = '<div><h1>Title</h1><p>Content</p></div>';
		$invalid_html = '<div><h1>Unclosed title<p>Content</div>';
		
		$this->assertTrue( $this->html_parser->validate_html_structure( $valid_html ) );
		$this->assertFalse( $this->html_parser->validate_html_structure( $invalid_html ) );
	}

	public function test_sanitizes_malicious_html() {
		$malicious_html = '<div><script>alert("xss")</script><h1>Safe Title</h1><iframe src="evil.com"></iframe></div>';
		
		$sanitized = $this->html_parser->sanitize_html( $malicious_html );
		
		$this->assertStringNotContains( '<script>', $sanitized );
		$this->assertStringNotContains( '<iframe>', $sanitized );
		$this->assertStringContains( '<h1>Safe Title</h1>', $sanitized );
	}

	public function test_handles_empty_html() {
		$empty_html = '';
		
		$result = $this->html_parser->parse( $empty_html );
		
		$this->assertNotNull( $result );
		$this->assertArrayHasKey( 'elements', $result );
		$this->assertEmpty( $result['elements'] );
	}

	public function test_handles_malformed_html_gracefully() {
		$malformed_html = '<div><h1>Unclosed title<p>Missing closing tags<span>Nested incorrectly</div>';
		
		$result = $this->html_parser->parse( $malformed_html );
		
		// Should still parse but may have warnings or corrections
		$this->assertNotNull( $result );
		$this->assertArrayHasKey( 'elements', $result );
	}

	public function test_preserves_html_attributes() {
		$html = '<div class="container" id="main" data-test="value"><h1 class="title" id="heading">Title</h1></div>';
		
		$result = $this->html_parser->parse( $html );
		
		$this->assertNotEmpty( $result['elements'] );
		
		// Find the div element
		$div_element = null;
		foreach ( $result['elements'] as $element ) {
			if ( 'div' === $element['tag'] ) {
				$div_element = $element;
				break;
			}
		}
		
		$this->assertNotNull( $div_element );
		$this->assertArrayHasKey( 'attributes', $div_element );
		$this->assertEquals( 'container', $div_element['attributes']['class'] ?? '' );
		$this->assertEquals( 'main', $div_element['attributes']['id'] ?? '' );
		$this->assertEquals( 'value', $div_element['attributes']['data-test'] ?? '' );
	}

	public function test_extracts_text_content() {
		$html = '<div><h1>Main Title</h1><p>Paragraph content with <strong>bold text</strong>.</p></div>';
		
		$result = $this->html_parser->parse( $html );
		
		$this->assertNotEmpty( $result['elements'] );
		
		// Find the h1 element
		$h1_element = null;
		foreach ( $result['elements'] as $element ) {
			if ( 'h1' === $element['tag'] ) {
				$h1_element = $element;
				break;
			}
		}
		
		$this->assertNotNull( $h1_element );
		$this->assertArrayHasKey( 'content', $h1_element );
		$this->assertEquals( 'Main Title', $h1_element['content'] );
	}
}
