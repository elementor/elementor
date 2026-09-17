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

	public function test_link_text_with_brackets_is_escaped() {
		// Arrange
		$html = '<a href="https://example.com">Click [here]</a>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '[Click \\[here\\]](https://example.com)', $result );
		$this->assertStringNotContainsString( '[Click [here]]', $result );
	}

	public function test_link_text_with_only_closing_bracket_is_escaped() {
		// Arrange
		$html = '<a href="https://example.com">foo] bar</a>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '[foo\\] bar](https://example.com)', $result );
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

	public function test_pre_with_nested_code_does_not_double_fence() {
		// Arrange
		$html = '<pre><code>function foo() { return 1; }</code></pre>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( "```\nfunction foo() { return 1; }\n```", $result );
		$this->assertStringNotContainsString( '`function', $result );
	}

	public function test_pre_with_code_language_class_emits_language() {
		// Arrange
		$html = '<pre><code class="language-php">echo "hi";</code></pre>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( "```php\necho \"hi\";\n```", $result );
	}

	public function test_blockquote_with_multiple_paragraphs_keeps_separation() {
		// Arrange
		$html = '<blockquote><p>Para 1</p><p>Para 2</p></blockquote>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '> Para 1', $result );
		$this->assertStringContainsString( '> Para 2', $result );
		$this->assertStringNotContainsString( '> Para 1Para 2', $result );
		$this->assertStringNotContainsString( '> Para 1 Para 2', $result );
	}

	public function test_blockquote_preserves_inline_formatting() {
		// Arrange
		$html = '<blockquote>Quote with <strong>bold</strong> and <a href="https://x.com">link</a></blockquote>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '**bold**', $result );
		$this->assertStringContainsString( '[link](https://x.com)', $result );
		$this->assertStringContainsString( '> ', $result );
	}

	public function test_nested_unordered_list_is_indented() {
		// Arrange
		$html = '<ul><li>Outer 1<ul><li>Inner A</li><li>Inner B</li></ul></li><li>Outer 2</li></ul>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '- Outer 1', $result );
		$this->assertStringContainsString( '  - Inner A', $result );
		$this->assertStringContainsString( '  - Inner B', $result );
		$this->assertStringContainsString( '- Outer 2', $result );
	}

	public function test_nested_ordered_inside_unordered_list_keeps_counters() {
		// Arrange
		$html = '<ul><li>Outer<ol><li>One</li><li>Two</li></ol></li></ul>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '- Outer', $result );
		$this->assertStringContainsString( '  1. One', $result );
		$this->assertStringContainsString( '  2. Two', $result );
	}

	public function test_list_item_preserves_bold_and_link() {
		// Arrange
		$html = '<ul><li><strong>Important:</strong> read <a href="https://example.com">docs</a></li></ul>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '- **Important:** read [docs](https://example.com)', $result );
	}

	public function test_url_with_parentheses_is_percent_encoded() {
		// Arrange
		$html = '<a href="https://en.wikipedia.org/wiki/PHP_(programming_language)">PHP</a>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '[PHP](https://en.wikipedia.org/wiki/PHP_%28programming_language%29)', $result );
		$this->assertEquals( 0, preg_match( '/\]\([^)]*\([^)]*\)[^)]*\)/', $result ) );
	}

	public function test_image_alt_with_brackets_is_escaped() {
		// Arrange
		$html = '<img src="x.png" alt="Diagram [v2]" />';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '![Diagram \\[v2\\]](x.png)', $result );
		$this->assertStringNotContainsString( '![Diagram [v2]]', $result );
	}

	public function test_inline_code_containing_backticks_uses_longer_fence() {
		// Arrange
		$html = '<code>echo `date`</code>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '`` echo `date` ``', $result );
		$this->assertStringNotContainsString( '`echo `date``', $result );
	}

	public function test_javascript_url_is_stripped() {
		// Arrange
		$html = '<a href="javascript:alert(1)">click</a>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringNotContainsString( 'javascript:', $result );
		$this->assertStringContainsString( 'click', $result );
	}

	public function test_data_image_url_is_allowed() {
		// Arrange
		$html = '<img src="data:image/png;base64,iVBORw0KGgo=" alt="dot"/>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '![dot](data:image/png;base64,iVBORw0KGgo=)', $result );
	}

	public function test_data_html_url_is_stripped_from_image() {
		// Arrange
		$html = '<img src="data:text/html,<script>alert(1)</script>" alt="x"/>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringNotContainsString( 'data:text/html', $result );
	}

	public function test_literal_asterisks_in_text_are_escaped() {
		// Arrange
		$html = '<p>Use *args and **kwargs in Python</p>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringNotContainsString( '**kwargs', $result );
		$this->assertStringContainsString( '\\*args', $result );
		$this->assertStringContainsString( '\\*\\*kwargs', $result );
	}

	public function test_table_with_thead_and_tbody_renders_pipe_table() {
		// Arrange
		$html = '<table><thead><tr><th>Name</th><th>Age</th></tr></thead><tbody><tr><td>Alice</td><td>30</td></tr><tr><td>Bob</td><td>25</td></tr></tbody></table>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '| Name | Age |', $result );
		$this->assertStringContainsString( '| --- | --- |', $result );
		$this->assertStringContainsString( '| Alice | 30 |', $result );
		$this->assertStringContainsString( '| Bob | 25 |', $result );
	}

	public function test_table_cell_pipe_character_is_escaped() {
		// Arrange
		$html = '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>x|y</td><td>z</td></tr></tbody></table>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '| x\\|y | z |', $result );
	}

	public function test_pipeline_ordering_is_not_load_bearing_for_list_with_link() {
		// Arrange
		$html = '<ul><li>See <a href="https://example.com">docs</a></li></ul>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '- See [docs](https://example.com)', $result );
	}

	public function test_malformed_unclosed_tag_does_not_crash() {
		// Arrange
		$html = '<p>This paragraph never closes <strong>and the bold runs forever';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( 'This paragraph', $result );
	}

	public function test_strikethrough_tag_produces_tildes() {
		// Arrange
		$html = '<p>This is <del>old</del> text</p>';

		// Act
		$result = Html_To_Markdown::convert( $html );

		// Assert
		$this->assertStringContainsString( '~~old~~', $result );
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
