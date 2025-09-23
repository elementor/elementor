<?php
namespace Elementor\Modules\CssConverter\Tests\AtomicWidgetsV2;

use Elementor\Modules\CssConverter\Services\AtomicWidgetsV2\Atomic_Data_Parser;

class AtomicDataParserTest extends AtomicWidgetV2TestCase {

	private Atomic_Data_Parser $parser;

	protected function setUp(): void {
		parent::setUp();
		$this->parser = new Atomic_Data_Parser();
	}

	public function test_parse_simple_heading(): void {
		$html = '<h1 style="font-size: 32px; color: #333333;">Test Heading</h1>';
		
		$result = $this->parser->parse_html_for_atomic_widgets( $html );
		
		$this->assertCount( 1, $result );
		
		$element = $result[0];
		$this->assertEquals( 'h1', $element['tag'] );
		$this->assertEquals( 'e-heading', $element['widget_type'] );
		$this->assertEquals( 'Test Heading', $element['content'] );
		$this->assertEquals( 1, $element['widget_config']['level'] );
		
		// Verify atomic props
		$this->assertArrayHasKey( 'font-size', $element['atomic_props'] );
		$this->assertArrayHasKey( 'color', $element['atomic_props'] );
		
		$this->assertValidSizeProp( $element['atomic_props']['font-size'] );
		$this->assertEquals( 32, $element['atomic_props']['font-size']['value']['size'] );
		$this->assertEquals( 'px', $element['atomic_props']['font-size']['value']['unit'] );
		
		$this->assertValidColorProp( $element['atomic_props']['color'] );
		$this->assertEquals( '#333333', $element['atomic_props']['color']['value'] );
	}

	public function test_parse_paragraph_with_styles(): void {
		$html = '<p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Test paragraph content</p>';
		
		$result = $this->parser->parse_html_for_atomic_widgets( $html );
		
		$this->assertCount( 1, $result );
		
		$element = $result[0];
		$this->assertEquals( 'p', $element['tag'] );
		$this->assertEquals( 'e-paragraph', $element['widget_type'] );
		$this->assertEquals( 'Test paragraph content', $element['content'] );
		
		// Verify atomic props
		$this->assertArrayHasKey( 'font-size', $element['atomic_props'] );
		$this->assertValidSizeProp( $element['atomic_props']['font-size'] );
		$this->assertEquals( 16, $element['atomic_props']['font-size']['value']['size'] );
	}

	public function test_parse_nested_container(): void {
		$html = '<div style="display: flex; flex-direction: column;">
					<h1 style="font-size: 32px;">Heading</h1>
					<p style="font-size: 16px;">Paragraph</p>
				  </div>';
		
		$result = $this->parser->parse_html_for_atomic_widgets( $html );
		
		$this->assertCount( 1, $result );
		
		$container = $result[0];
		$this->assertEquals( 'div', $container['tag'] );
		$this->assertEquals( 'e-flexbox', $container['widget_type'] );
		$this->assertCount( 2, $container['children'] );
		
		// Verify children
		$heading = $container['children'][0];
		$paragraph = $container['children'][1];
		
		$this->assertEquals( 'e-heading', $heading['widget_type'] );
		$this->assertEquals( 'Heading', $heading['content'] );
		
		$this->assertEquals( 'e-paragraph', $paragraph['widget_type'] );
		$this->assertEquals( 'Paragraph', $paragraph['content'] );
	}

	public function test_parse_button_with_attributes(): void {
		$html = '<button type="submit" class="btn-primary" style="background-color: #0073aa; padding: 10px 20px;">Click Me</button>';
		
		$result = $this->parser->parse_html_for_atomic_widgets( $html );
		
		$this->assertCount( 1, $result );
		
		$element = $result[0];
		$this->assertEquals( 'button', $element['tag'] );
		$this->assertEquals( 'e-button', $element['widget_type'] );
		$this->assertEquals( 'Click Me', $element['content'] );
		
		// Verify attributes (excluding style)
		$this->assertArrayHasKey( 'type', $element['attributes'] );
		$this->assertArrayHasKey( 'class', $element['attributes'] );
		$this->assertEquals( 'submit', $element['attributes']['type'] );
		$this->assertEquals( 'btn-primary', $element['attributes']['class'] );
		$this->assertArrayNotHasKey( 'style', $element['attributes'] );
		
		// Verify atomic props
		$this->assertArrayHasKey( 'background-color', $element['atomic_props'] );
		$this->assertArrayHasKey( 'padding', $element['atomic_props'] );
	}

	public function test_parse_link_as_button(): void {
		$html = '<a href="https://example.com" target="_blank" style="color: white; background-color: #0073aa;">Link Button</a>';
		
		$result = $this->parser->parse_html_for_atomic_widgets( $html );
		
		$this->assertCount( 1, $result );
		
		$element = $result[0];
		$this->assertEquals( 'a', $element['tag'] );
		$this->assertEquals( 'e-button', $element['widget_type'] );
		$this->assertEquals( 'Link Button', $element['content'] );
		
		// Verify attributes
		$this->assertArrayHasKey( 'href', $element['attributes'] );
		$this->assertArrayHasKey( 'target', $element['attributes'] );
		$this->assertEquals( 'https://example.com', $element['attributes']['href'] );
		$this->assertEquals( '_blank', $element['attributes']['target'] );
	}

	public function test_parse_complex_nested_structure(): void {
		$html = '<section style="padding: 40px; background-color: #f5f5f5;">
					<div style="max-width: 800px; margin: 0 auto;">
						<h1 style="font-size: 48px; text-align: center;">Main Title</h1>
						<div style="display: grid; gap: 30px;">
							<div style="background: white; padding: 20px;">
								<h2 style="color: #0073aa;">Feature One</h2>
								<p>Description of feature one.</p>
							</div>
						</div>
					</div>
				  </section>';
		
		$result = $this->parser->parse_html_for_atomic_widgets( $html );
		
		$this->assertCount( 1, $result );
		
		$section = $result[0];
		$this->assertEquals( 'section', $section['tag'] );
		$this->assertEquals( 'e-flexbox', $section['widget_type'] );
		$this->assertCount( 1, $section['children'] );
		
		// Verify nested structure
		$main_container = $section['children'][0];
		$this->assertEquals( 'e-flexbox', $main_container['widget_type'] );
		$this->assertCount( 2, $main_container['children'] );
		
		$title = $main_container['children'][0];
		$this->assertEquals( 'e-heading', $title['widget_type'] );
		$this->assertEquals( 'Main Title', $title['content'] );
	}

	public function test_parse_empty_html(): void {
		$result = $this->parser->parse_html_for_atomic_widgets( '' );
		$this->assertEmpty( $result );
		
		$result = $this->parser->parse_html_for_atomic_widgets( '   ' );
		$this->assertEmpty( $result );
	}

	public function test_parse_unsupported_tags_are_ignored(): void {
		$html = '<div>
					<h1>Supported Heading</h1>
					<custom-element>Unsupported Element</custom-element>
					<p>Supported Paragraph</p>
				  </div>';
		
		$result = $this->parser->parse_html_for_atomic_widgets( $html );
		
		$this->assertCount( 1, $result );
		
		$container = $result[0];
		$this->assertEquals( 'e-flexbox', $container['widget_type'] );
		$this->assertCount( 2, $container['children'] ); // Only supported elements
		
		$this->assertEquals( 'e-heading', $container['children'][0]['widget_type'] );
		$this->assertEquals( 'e-paragraph', $container['children'][1]['widget_type'] );
	}

	public function test_extract_text_content_with_inline_elements(): void {
		$html = '<p>This is <strong>bold</strong> and <em>italic</em> text.</p>';
		
		$result = $this->parser->parse_html_for_atomic_widgets( $html );
		
		$this->assertCount( 1, $result );
		
		$element = $result[0];
		$this->assertEquals( 'This is bold and italic text.', $element['content'] );
	}

	public function test_parse_multiple_css_properties(): void {
		$html = '<div style="margin: 10px 20px 30px 40px; padding: 5px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Content</div>';
		
		$result = $this->parser->parse_html_for_atomic_widgets( $html );
		
		$this->assertCount( 1, $result );
		
		$element = $result[0];
		$atomic_props = $element['atomic_props'];
		
		// Verify multiple properties were converted
		$this->assertArrayHasKey( 'margin', $atomic_props );
		$this->assertArrayHasKey( 'padding', $atomic_props );
		
		// Verify margin dimensions
		if ( isset( $atomic_props['margin'] ) ) {
			$this->assertValidDimensionsProp( $atomic_props['margin'] );
		}
	}
}
