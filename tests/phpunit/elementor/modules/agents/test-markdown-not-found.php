<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;
use Elementor\Modules\Agents\Components\Readability\Markdown_Not_Found;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Markdown_Not_Found extends Elementor_Test_Base {

	const MIN_BODY_LENGTH = 20;

	const NON_EXISTENT_POST_ID = 99999999;

	private Markdown_Not_Found $not_found;

	private Agent_Ready_Settings $settings;

	public function setUp(): void {
		parent::setUp();

		Module::reset_physical_file_cache();

		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();
		$this->settings->activate();

		$this->not_found = new Markdown_Not_Found( $this->settings, new Markdown_Endpoint( $this->settings ), new Module() );
	}

	public function tearDown(): void {
		remove_action( 'template_redirect', [ $this->not_found, 'on_template_redirect' ], Markdown_Not_Found::AFTER_CANONICAL_REDIRECT_PRIORITY );

		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		Module::reset_physical_file_cache();

		parent::tearDown();
	}

	public function test_build_markdown__returns_heading_explanation_and_home_link() {
		// Act
		$markdown = $this->not_found->build_markdown();

		// Assert
		$this->assertStringStartsWith( '# 404 Not Found', $markdown );
		$this->assertGreaterThanOrEqual( self::MIN_BODY_LENGTH, strlen( $markdown ) );
		$this->assertStringContainsString( '(' . home_url( '/' ) . ')', $markdown );
	}

	public function test_build_markdown__links_llms_txt_when_advertised() {
		// Act
		$markdown = $this->not_found->build_markdown();

		// Assert
		$this->assertStringContainsString( '(' . home_url( '/llms.txt' ) . ')', $markdown );
	}

	public function test_build_markdown__omits_llms_txt_when_llms_is_disabled() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'enabled', false );

		// Act
		$markdown = $this->not_found->build_markdown();

		// Assert
		$this->assertStringNotContainsString( 'llms.txt', $markdown );
	}

	public function test_build_markdown__links_sitemap_when_available() {
		// Arrange
		$sitemap_url = get_sitemap_url( 'index' );

		// Act
		$markdown = $this->not_found->build_markdown();

		// Assert
		$this->assertNotFalse( $sitemap_url );
		$this->assertStringContainsString( '(' . $sitemap_url . ')', $markdown );
	}

	public function test_build_response_headers__declares_markdown_content_type() {
		// Act
		$headers = $this->not_found->build_response_headers();

		// Assert
		$this->assertSame( 'text/markdown; charset=utf-8', $headers['Content-Type'] );
		$this->assertSame( 'Accept', $headers['Vary'] );
		$this->assertSame( 'noindex', $headers['X-Robots-Tag'] );
	}

	public function test_on_template_redirect__ignores_markdown_request_when_page_exists() {
		// Arrange
		$_SERVER['HTTP_ACCEPT'] = 'text/markdown';
		$this->go_to( home_url( '/' ) );

		// Act
		$this->not_found->on_template_redirect();

		// Assert
		$this->assertFalse( is_404() );
		unset( $_SERVER['HTTP_ACCEPT'] );
	}

	public function test_on_template_redirect__ignores_html_request_on_not_found_page() {
		// Arrange
		unset( $_SERVER['HTTP_ACCEPT'] );
		$this->go_to( home_url( '/?p=' . self::NON_EXISTENT_POST_ID ) );

		// Act
		$this->not_found->on_template_redirect();

		// Assert
		$this->assertTrue( is_404() );
	}

	public function test_register__hooks_template_redirect_after_canonical_redirect() {
		// Act
		$this->not_found->register();

		// Assert
		$this->assertSame(
			Markdown_Not_Found::AFTER_CANONICAL_REDIRECT_PRIORITY,
			has_action( 'template_redirect', [ $this->not_found, 'on_template_redirect' ] )
		);
	}

	public function test_register__does_nothing_when_markdown_module_is_disabled() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'enabled', false );

		// Act
		$this->not_found->register();

		// Assert
		$this->assertFalse( has_action( 'template_redirect', [ $this->not_found, 'on_template_redirect' ] ) );
	}
}
