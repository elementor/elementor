<?php
namespace Elementor\Testing\Modules\MarkdownRender;

use Elementor\Modules\MarkdownRender\Html_To_Markdown;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Html_To_Markdown extends Elementor_Test_Base {

	public function test_empty_html_returns_empty_string() {
		// Arrange
		$html = '';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertEmpty( $result );
	}

	public function test_plain_text_passes_through() {
		// Arrange
		$html = 'Hello World';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertEquals( 'Hello World', $result );
	}

	public function test_paragraph_tags_produce_newlines() {
		// Arrange
		$html = '<p>First paragraph</p><p>Second paragraph</p>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( 'First paragraph', $result );
		$this->assertStringContainsString( 'Second paragraph', $result );
	}

	public function test_heading_tags_produce_markdown_headings() {
		// Arrange
		$html = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '# Title', $result );
		$this->assertStringContainsString( '## Subtitle', $result );
		$this->assertStringContainsString( '### Section', $result );
	}

	public function test_heading_with_line_breaks_produces_spaces() {
		// Arrange
		$html = '<h1>The Future of<br>Autonomous Robotics<br/>Starts Here</h1>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '# The Future of Autonomous Robotics Starts Here', $result );
	}

	public function test_heading_with_inline_tags_produces_spaces() {
		// Arrange
		$html = '<h1>The Future of<br>Autonomous Robotics<br><span style="color:#00d4ff">Starts Here</span></h1>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '# The Future of Autonomous Robotics Starts Here', $result );
	}

	public function test_bold_tags_produce_double_asterisks() {
		// Arrange
		$html = '<strong>bold text</strong>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '**bold text**', $result );
	}

	public function test_italic_tags_produce_single_asterisks() {
		// Arrange
		$html = '<em>italic text</em>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '*italic text*', $result );
	}

	public function test_links_produce_markdown_links() {
		// Arrange
		$html = '<a href="https://example.com">Click here</a>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '[Click here](https://example.com)', $result );
	}

	public function test_images_produce_markdown_images() {
		// Arrange
		$html = '<img src="https://example.com/image.jpg" alt="My image" />';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '![My image](https://example.com/image.jpg)', $result );
	}

	public function test_unordered_list_produces_dashes() {
		// Arrange
		$html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '- Item 1', $result );
		$this->assertStringContainsString( '- Item 2', $result );
		$this->assertStringContainsString( '- Item 3', $result );
	}

	public function test_ordered_list_produces_numbers() {
		// Arrange
		$html = '<ol><li>First</li><li>Second</li><li>Third</li></ol>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '1. First', $result );
		$this->assertStringContainsString( '2. Second', $result );
		$this->assertStringContainsString( '3. Third', $result );
	}

	public function test_blockquote_produces_greater_than() {
		// Arrange
		$html = '<blockquote>Quoted text</blockquote>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '> Quoted text', $result );
	}

	public function test_code_produces_backticks() {
		// Arrange
		$html = '<code>inline code</code>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '`inline code`', $result );
	}

	public function test_pre_produces_code_block() {
		// Arrange
		$html = '<pre>code block content</pre>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '```', $result );
		$this->assertStringContainsString( 'code block content', $result );
	}

	public function test_br_produces_newline() {
		// Arrange
		$html = 'Line 1<br/>Line 2';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( "Line 1\nLine 2", $result );
	}

	public function test_hr_produces_horizontal_rule() {
		// Arrange
		$html = '<p>Before</p><hr/><p>After</p>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '---', $result );
	}

	public function test_script_tags_are_stripped() {
		// Arrange
		$html = '<p>Visible</p><script>alert("hidden")</script>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( 'Visible', $result );
		$this->assertStringNotContainsString( 'alert', $result );
		$this->assertStringNotContainsString( 'script', $result );
	}

	public function test_style_tags_are_stripped() {
		// Arrange
		$html = '<p>Visible</p><style>.hidden { display: none; }</style>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( 'Visible', $result );
		$this->assertStringNotContainsString( 'display', $result );
	}

	public function test_zero_width_spaces_are_stripped() {
		// Arrange
		$html = "<p>Navigation Accuracy\xE2\x80\x8B</p>";

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertEquals( 'Navigation Accuracy', $result );
	}

	public function test_complex_html_converts_correctly() {
		// Arrange
		$html = '<h2>Welcome</h2><p>This is a <strong>bold</strong> and <em>italic</em> paragraph with a <a href="https://example.com">link</a>.</p><ul><li>Item A</li><li>Item B</li></ul>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '## Welcome', $result );
		$this->assertStringContainsString( '**bold**', $result );
		$this->assertStringContainsString( '*italic*', $result );
		$this->assertStringContainsString( '[link](https://example.com)', $result );
		$this->assertStringContainsString( '- Item A', $result );
		$this->assertStringContainsString( '- Item B', $result );
	}
}
