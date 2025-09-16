<?php
namespace Elementor\Testing\Modules\CssConverter;

use Elementor\Modules\CssConverter\Services\Html_Parser;
use Elementor\Modules\CssConverter\Services\Widget_Mapper;
use Elementor\Modules\CssConverter\Services\Widget_Conversion_Service;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group css-converter
 * @group widget-converter
 * @group html-element-scenarios
 */
class Test_Html_Element_Scenarios extends Elementor_Test_Base {

	private $html_parser;
	private $widget_mapper;
	private $conversion_service;

	public function setUp(): void {
		parent::setUp();
		$this->html_parser = new Html_Parser();
		$this->widget_mapper = new Widget_Mapper();
		$this->conversion_service = new Widget_Conversion_Service();
	}

	/**
	 * @dataProvider semantic_elements_provider
	 */
	public function test_semantic_elements_conversion( $html, $expected_widget_type, $expected_content ) {
		$parsed = $this->html_parser->parse( $html );
		$this->assertNotEmpty( $parsed );
		
		$elements = $parsed['elements'] ?? [];
		$this->assertNotEmpty( $elements );
		
		$mapped = $this->widget_mapper->map_elements( $elements );
		$this->assertNotEmpty( $mapped );
		
		$widget = $mapped[0];
		$this->assertEquals( $expected_widget_type, $widget['widget_type'] );
		
		if ( $expected_content ) {
			$this->assertStringContains( $expected_content, $widget['settings']['text'] ?? $widget['settings']['title'] ?? '' );
		}
	}

	public function semantic_elements_provider() {
		return [
			// Headings
			[ '<h1>Main Title</h1>', 'e-heading', 'Main Title' ],
			[ '<h2>Section Title</h2>', 'e-heading', 'Section Title' ],
			[ '<h3>Subsection</h3>', 'e-heading', 'Subsection' ],
			[ '<h4>Minor Heading</h4>', 'e-heading', 'Minor Heading' ],
			[ '<h5>Small Heading</h5>', 'e-heading', 'Small Heading' ],
			[ '<h6>Tiny Heading</h6>', 'e-heading', 'Tiny Heading' ],
			
			// Paragraphs
			[ '<p>This is a paragraph of text.</p>', 'e-text', 'This is a paragraph' ],
			[ '<p>Multiple sentences. With punctuation!</p>', 'e-text', 'Multiple sentences' ],
			
			// Containers
			[ '<div>Container content</div>', 'e-flexbox', null ],
			[ '<section>Section content</section>', 'e-flexbox', null ],
			[ '<article>Article content</article>', 'e-flexbox', null ],
			[ '<aside>Sidebar content</aside>', 'e-flexbox', null ],
			[ '<main>Main content</main>', 'e-flexbox', null ],
			[ '<header>Header content</header>', 'e-flexbox', null ],
			[ '<footer>Footer content</footer>', 'e-flexbox', null ],
			[ '<nav>Navigation content</nav>', 'e-flexbox', null ],
			
			// Inline elements
			[ '<span>Inline text</span>', 'e-text', 'Inline text' ],
		];
	}

	/**
	 * @dataProvider interactive_elements_provider
	 */
	public function test_interactive_elements_conversion( $html, $expected_widget_type, $expected_attributes ) {
		$parsed = $this->html_parser->parse( $html );
		$elements = $parsed['elements'] ?? [];
		$this->assertNotEmpty( $elements );
		
		$mapped = $this->widget_mapper->map_elements( $elements );
		$widget = $mapped[0];
		
		$this->assertEquals( $expected_widget_type, $widget['widget_type'] );
		
		foreach ( $expected_attributes as $attr => $value ) {
			$this->assertEquals( $value, $widget['element_data']['attributes'][ $attr ] ?? null );
		}
	}

	public function interactive_elements_provider() {
		return [
			// Buttons
			[ '<button>Click Me</button>', 'e-button', [] ],
			[ '<button type="submit">Submit</button>', 'e-button', [ 'type' => 'submit' ] ],
			[ '<button disabled>Disabled</button>', 'e-button', [ 'disabled' => 'disabled' ] ],
			
			// Links
			[ '<a href="https://example.com">Link Text</a>', 'e-link', [ 'href' => 'https://example.com' ] ],
			[ '<a href="#section">Internal Link</a>', 'e-link', [ 'href' => '#section' ] ],
			[ '<a href="mailto:test@example.com">Email Link</a>', 'e-link', [ 'href' => 'mailto:test@example.com' ] ],
			[ '<a href="tel:+1234567890">Phone Link</a>', 'e-link', [ 'href' => 'tel:+1234567890' ] ],
		];
	}

	/**
	 * @dataProvider media_elements_provider
	 */
	public function test_media_elements_conversion( $html, $expected_widget_type, $expected_fallback = false ) {
		$parsed = $this->html_parser->parse( $html );
		$elements = $parsed['elements'] ?? [];
		$this->assertNotEmpty( $elements );
		
		$mapped = $this->widget_mapper->map_elements( $elements );
		$widget = $mapped[0];
		
		if ( $expected_fallback ) {
			// Should fall back to HTML widget for unsupported media
			$this->assertEquals( 'html', $widget['widget_type'] );
		} else {
			$this->assertEquals( $expected_widget_type, $widget['widget_type'] );
		}
	}

	public function media_elements_provider() {
		return [
			// Images (supported)
			[ '<img src="image.jpg" alt="Test Image">', 'e-image', false ],
			[ '<img src="https://example.com/image.png" alt="Remote Image">', 'e-image', false ],
			[ '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Data URL">', 'e-image', false ],
			
			// Video (fallback)
			[ '<video src="video.mp4" controls></video>', 'html', true ],
			[ '<video><source src="video.webm" type="video/webm"></video>', 'html', true ],
			
			// Audio (fallback)
			[ '<audio src="audio.mp3" controls></audio>', 'html', true ],
			[ '<audio><source src="audio.ogg" type="audio/ogg"></audio>', 'html', true ],
			
			// SVG (fallback)
			[ '<svg width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>', 'html', true ],
		];
	}

	public function test_complex_nested_structures() {
		$complex_html = '
			<div class="container">
				<header class="site-header">
					<h1>Site Title</h1>
					<nav>
						<a href="/home">Home</a>
						<a href="/about">About</a>
					</nav>
				</header>
				<main class="content">
					<article class="post">
						<h2>Post Title</h2>
						<p>Post content goes here.</p>
						<img src="featured.jpg" alt="Featured Image">
					</article>
					<aside class="sidebar">
						<h3>Sidebar Title</h3>
						<p>Sidebar content.</p>
					</aside>
				</main>
				<footer>
					<p>&copy; 2024 Site Name</p>
				</footer>
			</div>
		';
		
		$parsed = $this->html_parser->parse( $complex_html );
		$this->assertNotEmpty( $parsed );
		
		$elements = $parsed['elements'] ?? [];
		$this->assertNotEmpty( $elements );
		
		// Should have root container
		$this->assertCount( 1, $elements );
		$root = $elements[0];
		$this->assertEquals( 'div', $root['tag'] );
		$this->assertEquals( 'container', $root['attributes']['class'] );
		
		// Should have nested structure
		$this->assertArrayHasKey( 'children', $root );
		$this->assertCount( 3, $root['children'] ); // header, main, footer
		
		// Test mapping
		$mapped = $this->widget_mapper->map_elements( $elements );
		$this->assertNotEmpty( $mapped );
		
		$root_widget = $mapped[0];
		$this->assertEquals( 'e-flexbox', $root_widget['widget_type'] );
		$this->assertArrayHasKey( 'children', $root_widget );
	}

	public function test_mixed_content_scenarios() {
		$mixed_content_cases = [
			// Text with inline elements
			'<p>This is <strong>bold</strong> and <em>italic</em> text.</p>',
			
			// Links with nested elements
			'<a href="/page"><span class="icon"></span> Link with Icon</a>',
			
			// Buttons with nested content
			'<button><img src="icon.svg" alt=""> Button with Image</button>',
			
			// Lists with various content
			'<ul><li><a href="/item1">Item 1</a></li><li><span>Item 2</span></li></ul>',
			
			// Divs with mixed content
			'<div><h3>Title</h3><p>Description</p><button>Action</button></div>',
		];
		
		foreach ( $mixed_content_cases as $html ) {
			$parsed = $this->html_parser->parse( $html );
			$this->assertNotEmpty( $parsed, "Failed to parse: {$html}" );
			
			$elements = $parsed['elements'] ?? [];
			$this->assertNotEmpty( $elements, "No elements found in: {$html}" );
			
			$mapped = $this->widget_mapper->map_elements( $elements );
			$this->assertNotEmpty( $mapped, "Failed to map: {$html}" );
		}
	}

	/**
	 * @dataProvider edge_case_provider
	 */
	public function test_edge_cases( $html, $should_parse, $description ) {
		$parsed = $this->html_parser->parse( $html );
		
		if ( $should_parse ) {
			$this->assertNotEmpty( $parsed, $description );
			$elements = $parsed['elements'] ?? [];
			$this->assertIsArray( $elements, $description );
		} else {
			// Should handle gracefully without crashing
			$this->assertIsArray( $parsed, $description );
		}
	}

	public function edge_case_provider() {
		return [
			// Empty elements
			[ '<div></div>', true, 'Empty div should parse' ],
			[ '<p></p>', true, 'Empty paragraph should parse' ],
			[ '<span></span>', true, 'Empty span should parse' ],
			
			// Self-closing elements
			[ '<img src="test.jpg">', true, 'Self-closing img should parse' ],
			[ '<br>', true, 'Self-closing br should parse' ],
			[ '<hr>', true, 'Self-closing hr should parse' ],
			
			// Malformed HTML
			[ '<div><p>Unclosed paragraph</div>', true, 'Malformed nesting should be handled' ],
			[ '<div>Missing closing tag', true, 'Missing closing tag should be handled' ],
			[ 'No tags just text', true, 'Plain text should be handled' ],
			
			// Special characters
			[ '<p>Text with &amp; entities &lt; &gt;</p>', true, 'HTML entities should be handled' ],
			[ '<p>Unicode: 你好 🌟 ñoño</p>', true, 'Unicode characters should be handled' ],
			
			// Whitespace handling
			[ '<p>   Lots   of   spaces   </p>', true, 'Multiple spaces should be handled' ],
			[ "<p>\n\tTabs and\n\tnewlines\n</p>", true, 'Tabs and newlines should be handled' ],
			
			// Very long content
			[ '<p>' . str_repeat( 'Very long text. ', 1000 ) . '</p>', true, 'Very long content should be handled' ],
			
			// Deep nesting
			[ str_repeat( '<div>', 50 ) . 'Deep content' . str_repeat( '</div>', 50 ), true, 'Deep nesting should be handled' ],
		];
	}

	public function test_html_attributes_preservation() {
		$html_with_attributes = '
			<div id="main" class="container primary" data-custom="value" style="color: red;">
				<h1 class="title" id="page-title">Title</h1>
				<p class="description" data-info="test">Description</p>
				<img src="image.jpg" alt="Image" width="300" height="200" loading="lazy">
			</div>
		';
		
		$parsed = $this->html_parser->parse( $html_with_attributes );
		$elements = $parsed['elements'] ?? [];
		
		$this->assertNotEmpty( $elements );
		
		$root = $elements[0];
		$attributes = $root['attributes'];
		
		// Should preserve all attributes
		$this->assertEquals( 'main', $attributes['id'] );
		$this->assertEquals( 'container primary', $attributes['class'] );
		$this->assertEquals( 'value', $attributes['data-custom'] );
		$this->assertEquals( 'color: red;', $attributes['style'] );
		
		// Check nested elements
		$h1 = $root['children'][0];
		$this->assertEquals( 'title', $h1['attributes']['class'] );
		$this->assertEquals( 'page-title', $h1['attributes']['id'] );
		
		$img = $root['children'][2];
		$this->assertEquals( '300', $img['attributes']['width'] );
		$this->assertEquals( '200', $img['attributes']['height'] );
		$this->assertEquals( 'lazy', $img['attributes']['loading'] );
	}

	public function test_css_class_extraction() {
		$html_with_classes = '
			<div class="container fluid">
				<div class="row">
					<div class="col-md-6 col-lg-4">Column 1</div>
					<div class="col-md-6 col-lg-8">Column 2</div>
				</div>
			</div>
		';
		
		$parsed = $this->html_parser->parse( $html_with_classes );
		$elements = $parsed['elements'] ?? [];
		
		$this->assertNotEmpty( $elements );
		
		// Should extract all CSS classes
		$all_classes = $this->extract_all_classes( $elements );
		
		$expected_classes = [ 'container', 'fluid', 'row', 'col-md-6', 'col-lg-4', 'col-lg-8' ];
		
		foreach ( $expected_classes as $class ) {
			$this->assertContains( $class, $all_classes, "Class '{$class}' should be extracted" );
		}
	}

	public function test_inline_styles_extraction() {
		$html_with_styles = '
			<div style="background-color: red; padding: 20px;">
				<h1 style="color: blue; font-size: 24px;">Styled Title</h1>
				<p style="margin: 10px 0; line-height: 1.5;">Styled paragraph</p>
			</div>
		';
		
		$parsed = $this->html_parser->parse( $html_with_styles );
		$inline_css = $this->html_parser->extract_inline_css( $html_with_styles );
		
		$this->assertNotEmpty( $inline_css );
		
		// Should extract inline styles as CSS rules
		$this->assertStringContains( 'background-color: red', $inline_css );
		$this->assertStringContains( 'color: blue', $inline_css );
		$this->assertStringContains( 'font-size: 24px', $inline_css );
		$this->assertStringContains( 'margin: 10px 0', $inline_css );
	}

	public function test_form_elements_handling() {
		$form_html = '
			<form action="/submit" method="post">
				<input type="text" name="username" placeholder="Username" required>
				<input type="email" name="email" placeholder="Email">
				<input type="password" name="password" placeholder="Password">
				<textarea name="message" rows="4" cols="50">Default text</textarea>
				<select name="country">
					<option value="us">United States</option>
					<option value="ca">Canada</option>
				</select>
				<input type="checkbox" name="agree" id="agree">
				<label for="agree">I agree to terms</label>
				<input type="submit" value="Submit">
			</form>
		';
		
		$parsed = $this->html_parser->parse( $form_html );
		$elements = $parsed['elements'] ?? [];
		
		$this->assertNotEmpty( $elements );
		
		// Form elements should be parsed but likely fall back to HTML widgets
		$mapped = $this->widget_mapper->map_elements( $elements );
		$this->assertNotEmpty( $mapped );
		
		// Most form elements should fall back to HTML widget
		$form_widget = $mapped[0];
		$this->assertEquals( 'html', $form_widget['widget_type'] );
	}

	public function test_table_elements_handling() {
		$table_html = '
			<table class="data-table">
				<thead>
					<tr>
						<th>Name</th>
						<th>Age</th>
						<th>City</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>John Doe</td>
						<td>30</td>
						<td>New York</td>
					</tr>
					<tr>
						<td>Jane Smith</td>
						<td>25</td>
						<td>Los Angeles</td>
					</tr>
				</tbody>
			</table>
		';
		
		$parsed = $this->html_parser->parse( $table_html );
		$elements = $parsed['elements'] ?? [];
		
		$this->assertNotEmpty( $elements );
		
		// Tables should be parsed but fall back to HTML widget
		$mapped = $this->widget_mapper->map_elements( $elements );
		$table_widget = $mapped[0];
		$this->assertEquals( 'html', $table_widget['widget_type'] );
	}

	public function test_performance_with_large_html() {
		// Generate large HTML structure
		$large_html = '<div class="container">';
		for ( $i = 0; $i < 1000; $i++ ) {
			$large_html .= "<div class='item-{$i}'><h3>Item {$i}</h3><p>Description for item {$i}</p></div>";
		}
		$large_html .= '</div>';
		
		$start_time = microtime( true );
		$parsed = $this->html_parser->parse( $large_html );
		$end_time = microtime( true );
		
		$parsing_time = $end_time - $start_time;
		
		// Should parse large HTML in reasonable time (< 2 seconds)
		$this->assertLessThan( 2.0, $parsing_time );
		$this->assertNotEmpty( $parsed );
		
		$elements = $parsed['elements'] ?? [];
		$this->assertNotEmpty( $elements );
		
		// Should have correct structure
		$root = $elements[0];
		$this->assertEquals( 'div', $root['tag'] );
		$this->assertArrayHasKey( 'children', $root );
		$this->assertCount( 1000, $root['children'] );
	}

	private function extract_all_classes( $elements ) {
		$classes = [];
		
		foreach ( $elements as $element ) {
			if ( ! empty( $element['attributes']['class'] ) ) {
				$element_classes = explode( ' ', $element['attributes']['class'] );
				$classes = array_merge( $classes, $element_classes );
			}
			
			if ( ! empty( $element['children'] ) ) {
				$child_classes = $this->extract_all_classes( $element['children'] );
				$classes = array_merge( $classes, $child_classes );
			}
		}
		
		return array_unique( array_filter( $classes ) );
	}
}
