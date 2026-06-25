<?php
namespace Elementor\Testing\Modules\MarkdownRender;

use Elementor\Modules\MarkdownRender\Markdown_Renderer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Markdown_Renderer extends Elementor_Test_Base {

	private function invoke_escape_yaml_string( string $value ): string {
		$renderer = new Markdown_Renderer();
		$method = new \ReflectionMethod( Markdown_Renderer::class, 'escape_yaml_string' );
		$method->setAccessible( true );

		return $method->invoke( $renderer, $value );
	}

	private function invoke_build_frontmatter( $document ): string {
		$renderer = new Markdown_Renderer();
		$method = new \ReflectionMethod( Markdown_Renderer::class, 'build_frontmatter' );
		$method->setAccessible( true );

		return $method->invoke( $renderer, $document );
	}

	public function test_escape_yaml_string_escapes_double_quote() {
		// Act
		$result = $this->invoke_escape_yaml_string( 'He said "hello"' );

		// Assert
		$this->assertEquals( 'He said \\"hello\\"', $result );
	}

	public function test_escape_yaml_string_escapes_backslash() {
		// Act
		$result = $this->invoke_escape_yaml_string( 'path\\to\\file' );

		// Assert
		$this->assertEquals( 'path\\\\to\\\\file', $result );
	}

	public function test_escape_yaml_string_escapes_newlines_and_tabs() {
		// Act
		$result = $this->invoke_escape_yaml_string( "line1\nline2\rline3\tend" );

		// Assert
		$this->assertEquals( 'line1\\nline2\\rline3\\tend', $result );
	}

	public function test_escape_yaml_string_decodes_html_entities() {
		// Act
		$result = $this->invoke_escape_yaml_string( 'Tom &amp; Jerry &quot;quoted&quot;' );

		// Assert
		$this->assertEquals( 'Tom & Jerry \\"quoted\\"', $result );
	}

	public function test_escape_yaml_string_strips_zero_width_space() {
		// Act
		$result = $this->invoke_escape_yaml_string( "title\xE2\x80\x8Bend" );

		// Assert
		$this->assertEquals( 'titleend', $result );
	}

	public function test_escape_yaml_string_strips_control_characters() {
		// Act
		$result = $this->invoke_escape_yaml_string( "before\x01\x07\x1Fafter" );

		// Assert
		$this->assertEquals( 'beforeafter', $result );
	}

	public function test_escape_yaml_string_preserves_safe_unicode() {
		// Act
		$result = $this->invoke_escape_yaml_string( 'שלום こんにちは' );

		// Assert
		$this->assertEquals( 'שלום こんにちは', $result );
	}

	public function test_build_frontmatter_omits_url_when_permalink_is_false() {
		// Arrange
		$document = $this->mock_document_with_post_id( 99999999 );

		// Act
		$result = $this->invoke_build_frontmatter( $document );

		// Assert
		$this->assertStringNotContainsString( 'url: ""', $result );
		$this->assertStringNotContainsString( 'url: "false"', $result );
		$this->assertStringNotContainsString( 'url: ""1"', $result );
	}

	public function test_build_frontmatter_includes_url_for_real_post() {
		// Arrange
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$document = $this->mock_document_with_post_id( $post_id );

		// Act
		$result = $this->invoke_build_frontmatter( $document );

		// Assert
		$this->assertMatchesRegularExpression( '/url: "https?:\\/\\/[^"]+"/', $result );
		$this->assertMatchesRegularExpression( '/date_modified: "[^"]+"/', $result );
	}

	private function mock_document_with_post_id( int $post_id ) {
		$document = $this->getMockBuilder( \Elementor\Core\Base\Document::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'get_main_id' ] )
			->getMockForAbstractClass();

		$document->method( 'get_main_id' )->willReturn( $post_id );

		return $document;
	}
}
