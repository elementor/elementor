<?php

namespace Elementor\Modules\CssConverter\Tests\AtomicWidgets;

require_once __DIR__ . '/AtomicWidgetTestCase.php';
require_once __DIR__ . '/../../../services/atomic-widgets/html-tag-to-widget-mapper.php';
require_once __DIR__ . '/../../../services/atomic-widgets/atomic-html-parser.php';

use Elementor\Modules\CssConverter\Services\AtomicWidgets\Atomic_Html_Parser;

class AtomicHtmlParserTest extends AtomicWidgetTestCase {

	private Atomic_Html_Parser $parser;

	protected function setUp(): void {
		parent::setUp();
		$this->parser = new Atomic_Html_Parser();
	}

	public function test_can_parse_returns_false_for_empty_html(): void {
		$this->assertFalse( $this->parser->can_parse( '' ) );
		$this->assertFalse( $this->parser->can_parse( '   ' ) );
		$this->assertFalse( $this->parser->can_parse( "\n\t" ) );
	}

	public function test_can_parse_returns_true_for_valid_html(): void {
		$this->assertTrue( $this->parser->can_parse( '<div>Hello</div>' ) );
		$this->assertTrue( $this->parser->can_parse( '<h1>Title</h1>' ) );
		$this->assertTrue( $this->parser->can_parse( '<p>Paragraph</p>' ) );
	}

	public function test_parse_returns_empty_array_for_empty_html(): void {
		$result = $this->parser->parse( '' );
		$this->assertIsArray( $result );
		$this->assertEmpty( $result );
	}

	public function test_parse_simple_div_element(): void {
		$html = '<div>Hello World</div>';
		$result = $this->parser->parse( $html );

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );

		$element = $result[0];
		$this->assertEquals( 'div', $element['tag'] );
		$this->assertEquals( 'Hello World', $element['text'] );
		$this->assertEquals( 'e-flexbox', $element['widget_type'] );
		$this->assertEmpty( $element['children'] );
	}

	public function test_parse_heading_element(): void {
		$html = '<h1>Main Title</h1>';
		$result = $this->parser->parse( $html );

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );

		$element = $result[0];
		$this->assertEquals( 'h1', $element['tag'] );
		$this->assertEquals( 'Main Title', $element['text'] );
		$this->assertEquals( 'e-heading', $element['widget_type'] );
	}

	public function test_parse_paragraph_element(): void {
		$html = '<p>This is a paragraph.</p>';
		$result = $this->parser->parse( $html );

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );

		$element = $result[0];
		$this->assertEquals( 'p', $element['tag'] );
		$this->assertEquals( 'This is a paragraph.', $element['text'] );
		$this->assertEquals( 'e-paragraph', $element['widget_type'] );
	}

	public function test_parse_button_element(): void {
		$html = '<button>Click Me</button>';
		$result = $this->parser->parse( $html );

		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );

		$element = $result[0];
		$this->assertEquals( 'button', $element['tag'] );
		$this->assertEquals( 'Click Me', $element['text'] );
		$this->assertEquals( 'e-button', $element['widget_type'] );
	}

	public function test_parse_element_with_attributes(): void {
		$html = '<div id="test-id" class="test-class" data-value="123">Content</div>';
		$result = $this->parser->parse( $html );

		$this->assertCount( 1, $result );

		$element = $result[0];
		$this->assertArrayHasKey( 'attributes', $element );
		$this->assertArrayHasKey( 'classes', $element );

		$attributes = $element['attributes'];
		$this->assertEquals( 'test-id', $attributes['id'] );
		$this->assertEquals( '123', $attributes['data-value'] );

		$classes = $element['classes'];
		$this->assertContains( 'test-class', $classes );
	}

	public function test_parse_element_with_inline_styles(): void {
		$html = '<div style="color: red; font-size: 16px; margin: 10px 20px;">Styled content</div>';
		$result = $this->parser->parse( $html );

		$this->assertCount( 1, $result );

		$element = $result[0];
		$this->assertArrayHasKey( 'inline_styles', $element );

		$styles = $element['inline_styles'];
		$this->assertEquals( 'red', $styles['color'] );
		$this->assertEquals( '16px', $styles['font-size'] );
		$this->assertEquals( '10px 20px', $styles['margin'] );
	}

	public function test_parse_nested_elements(): void {
		$html = '<div><h1>Title</h1><p>Content</p></div>';
		$result = $this->parser->parse( $html );

		$this->assertCount( 1, $result );

		$container = $result[0];
		$this->assertEquals( 'div', $container['tag'] );
		$this->assertCount( 2, $container['children'] );

		$heading = $container['children'][0];
		$this->assertEquals( 'h1', $heading['tag'] );
		$this->assertEquals( 'Title', $heading['text'] );
		$this->assertEquals( 'e-heading', $heading['widget_type'] );

		$paragraph = $container['children'][1];
		$this->assertEquals( 'p', $paragraph['tag'] );
		$this->assertEquals( 'Content', $paragraph['text'] );
		$this->assertEquals( 'e-paragraph', $paragraph['widget_type'] );
	}

	public function test_parse_deeply_nested_elements(): void {
		$html = '<div><div><h1>Deep Title</h1></div></div>';
		$result = $this->parser->parse( $html );

		$this->assertCount( 1, $result );

		$outer_container = $result[0];
		$this->assertEquals( 'div', $outer_container['tag'] );
		$this->assertCount( 1, $outer_container['children'] );

		$inner_container = $outer_container['children'][0];
		$this->assertEquals( 'div', $inner_container['tag'] );
		$this->assertCount( 1, $inner_container['children'] );

		$heading = $inner_container['children'][0];
		$this->assertEquals( 'h1', $heading['tag'] );
		$this->assertEquals( 'Deep Title', $heading['text'] );
	}

	public function test_parse_multiple_root_elements(): void {
		$html = '<h1>Title</h1><p>Paragraph</p><button>Button</button>';
		$result = $this->parser->parse( $html );

		$this->assertCount( 3, $result );

		$this->assertEquals( 'h1', $result[0]['tag'] );
		$this->assertEquals( 'e-heading', $result[0]['widget_type'] );

		$this->assertEquals( 'p', $result[1]['tag'] );
		$this->assertEquals( 'e-paragraph', $result[1]['widget_type'] );

		$this->assertEquals( 'button', $result[2]['tag'] );
		$this->assertEquals( 'e-button', $result[2]['widget_type'] );
	}

	public function test_parse_skips_script_and_style_elements(): void {
		$html = '<div>Content</div><script>alert("test");</script><style>body { color: red; }</style>';
		$result = $this->parser->parse( $html );

		$this->assertCount( 1, $result );
		$this->assertEquals( 'div', $result[0]['tag'] );
	}

	public function test_parse_extracts_text_from_inline_elements(): void {
		$html = '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>';
		$result = $this->parser->parse( $html );

		$this->assertCount( 1, $result );

		$element = $result[0];
		$this->assertEquals( 'p', $element['tag'] );
		$this->assertEquals( 'This is bold and italic text.', $element['text'] );
	}

	public function test_parse_handles_self_closing_elements(): void {
		$html = '<div><img src="test.jpg" alt="Test"><br><hr></div>';
		$result = $this->parser->parse( $html );

		$this->assertCount( 1, $result );

		$container = $result[0];
		$this->assertEquals( 'div', $container['tag'] );
		$this->assertNotEmpty( $container['children'] );
	}

	public function test_parse_handles_malformed_html_gracefully(): void {
		$html = '<div><h1>Unclosed heading<p>Paragraph</div>';
		$result = $this->parser->parse( $html );

		$this->assertIsArray( $result );
	}

	public function test_parse_handles_empty_elements(): void {
		$html = '<div></div><p></p>';
		$result = $this->parser->parse( $html );

		$this->assertCount( 2, $result );

		$this->assertEquals( 'div', $result[0]['tag'] );
		$this->assertEquals( '', $result[0]['text'] );

		$this->assertEquals( 'p', $result[1]['tag'] );
		$this->assertEquals( '', $result[1]['text'] );
	}

	public function test_parse_complex_html_structure(): void {
		$html = '
			<div class="container" style="max-width: 800px;">
				<header>
					<h1 style="font-size: 36px;">Main Title</h1>
					<p class="subtitle">Subtitle text</p>
				</header>
				<main>
					<section class="content">
						<h2>Section Title</h2>
						<p>Section content with <strong>emphasis</strong>.</p>
						<button type="button">Action Button</button>
					</section>
				</main>
			</div>
		';

		$result = $this->parser->parse( $html );

		$this->assertIsArray( $result );
		$this->assertNotEmpty( $result );

		$container = $result[0];
		$this->assertEquals( 'div', $container['tag'] );
		$this->assertContains( 'container', $container['classes'] );
		$this->assertEquals( '800px', $container['inline_styles']['max-width'] );
		$this->assertNotEmpty( $container['children'] );
	}

	public function test_parse_preserves_element_structure(): void {
		$html = '<div><h1>Title</h1><p>Content</p></div>';
		$result = $this->parser->parse( $html );

		$element = $result[0];

		$this->assertArrayHasKey( 'tag', $element );
		$this->assertArrayHasKey( 'text', $element );
		$this->assertArrayHasKey( 'attributes', $element );
		$this->assertArrayHasKey( 'classes', $element );
		$this->assertArrayHasKey( 'inline_styles', $element );
		$this->assertArrayHasKey( 'children', $element );
		$this->assertArrayHasKey( 'widget_type', $element );

		$this->assertIsString( $element['tag'] );
		$this->assertIsString( $element['text'] );
		$this->assertIsArray( $element['attributes'] );
		$this->assertIsArray( $element['classes'] );
		$this->assertIsArray( $element['inline_styles'] );
		$this->assertIsArray( $element['children'] );
		$this->assertIsString( $element['widget_type'] );
	}
}
