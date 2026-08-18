<?php
namespace Elementor\Testing\Modules\MarkdownRender;

use Elementor\Modules\MarkdownRender\Agent_Link_Relations;
use Elementor\Modules\MarkdownRender\Markdown_Url;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Markdown_Url extends Elementor_Test_Base {

	public function test_from_permalink__homepage_uses_index_md() {
		// Arrange
		update_option( 'permalink_structure', '/%postname%/' );
		$this->go_to( home_url( '/' ) );

		// Act
		$markdown_url = Markdown_Url::from_permalink( home_url( '/' ) );

		// Assert
		$this->assertStringEndsWith( '/index.md', wp_parse_url( $markdown_url, PHP_URL_PATH ) );
	}

	public function test_from_permalink__inner_page_uses_index_md_suffix() {
		// Arrange
		update_option( 'permalink_structure', '/%postname%/' );
		$permalink = home_url( '/about' );

		// Act
		$markdown_url = Markdown_Url::from_permalink( $permalink );

		// Assert
		$this->assertStringEndsWith( '/about/index.md', wp_parse_url( $markdown_url, PHP_URL_PATH ) );
	}

	public function test_from_permalink__plain_permalinks_use_query_arg() {
		// Arrange
		update_option( 'permalink_structure', '' );
		$permalink = home_url( '/?p=42' );

		// Act
		$markdown_url = Markdown_Url::from_permalink( $permalink );

		// Assert
		$this->assertStringContainsString( 'format=markdown', $markdown_url );
	}

	public function test_get_html_path_from_markdown_request_path__root_index_md() {
		// Act
		$html_path = Markdown_Url::get_html_path_from_markdown_request_path( '/index.md' );

		// Assert
		$this->assertSame( '/', $html_path );
	}

	public function test_get_html_path_from_markdown_request_path__inner_page() {
		// Act
		$html_path = Markdown_Url::get_html_path_from_markdown_request_path( '/about/index.md' );

		// Assert
		$this->assertSame( '/about/', $html_path );
	}

	public function test_get_html_path_from_markdown_request_path__rejects_non_markdown_paths() {
		// Act
		$html_path = Markdown_Url::get_html_path_from_markdown_request_path( '/about/' );

		// Assert
		$this->assertNull( $html_path );
	}

	public function test_is_markdown_request_path__detects_index_md_suffix() {
		// Assert
		$this->assertTrue( Markdown_Url::is_markdown_request_path( '/pricing/index.md' ) );
		$this->assertFalse( Markdown_Url::is_markdown_request_path( '/pricing/' ) );
	}
}
