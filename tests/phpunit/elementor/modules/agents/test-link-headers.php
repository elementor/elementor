<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Components\Discovery\Link_Headers;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Link_Headers extends Elementor_Test_Base {

	private Link_Headers $link_headers;

	private Agent_Ready_Settings $settings;

	private Module $module;

	public function setUp(): void {
		parent::setUp();

		Module::reset_physical_file_cache();

		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		$this->module = new Module();
		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();
		$this->settings->activate();
		$this->link_headers = new Link_Headers( new Markdown_Endpoint( $this->settings ), $this->settings, $this->module );
	}

	public function tearDown(): void {
		delete_option( Agent_Ready_Settings::OPTION );
		delete_option( Module::OPTION_EXISTING_FILE_DECISION );

		Module::reset_physical_file_cache();

		parent::tearDown();
	}

	public function test_build_site_links__includes_api_catalog_and_service_doc() {
		// Arrange
		$home = untrailingslashit( home_url() );

		// Act
		$links = $this->invoke_build_site_links();

		// Assert
		$this->assertContains(
			'<' . $home . '/.well-known/api-catalog>; rel="api-catalog"; type="application/json"',
			$links
		);
		$this->assertContains(
			'<' . $home . '/.well-known/auth.md>; rel="service-doc"; type="text/markdown"',
			$links
		);
		$this->assertContains(
			'<' . $home . '/llms.txt>; rel="llms-txt"; type="text/plain"',
			$links
		);
	}

	public function test_build_site_links__omits_discovery_links_when_agent_discovery_is_disabled() {
		// Arrange
		$home = untrailingslashit( home_url() );
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_AGENT_DISCOVERY, 'enabled', false );

		// Act
		$links = $this->invoke_build_site_links();

		// Assert
		$this->assertContains(
			'<' . $home . '/llms.txt>; rel="llms-txt"; type="text/plain"',
			$links
		);
		$this->assertStringNotContainsString( 'api-catalog', implode( '', $links ) );
		$this->assertStringNotContainsString( 'auth.md', implode( '', $links ) );
	}

	public function test_build_site_links__omits_llms_txt_when_llms_is_disabled() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'enabled', false );

		// Act
		$links = $this->invoke_build_site_links();

		// Assert
		$this->assertStringNotContainsString( 'llms.txt', implode( '', $links ) );
	}

	public function test_build_site_links__omits_llms_txt_when_decision_is_keep() {
		// Arrange
		update_option( Module::OPTION_EXISTING_FILE_DECISION, 'keep' );

		// Act
		$links = $this->invoke_build_site_links();

		// Assert
		$this->assertStringNotContainsString( 'llms.txt', implode( '', $links ) );
	}

	public function test_build_site_links__omits_llms_txt_when_physical_file_exists() {
		// Arrange
		require_once ABSPATH . 'wp-admin/includes/file.php';
		$file_path = get_home_path() . Module::LLMS_FILENAME;

		try {
			file_put_contents( $file_path, '# Physical file' );
			update_option( Module::OPTION_EXISTING_FILE_DECISION, 'replace' );
			Module::reset_physical_file_cache();

			// Act
			$links = $this->invoke_build_site_links();

			// Assert
			$this->assertStringNotContainsString( 'llms.txt', implode( '', $links ) );
		} finally {
			if ( file_exists( $file_path ) ) {
				unlink( $file_path );
			}
			Module::reset_physical_file_cache();
		}
	}

	public function test_build_site_links__includes_llms_txt_when_enabled_and_no_physical_file() {
		// Arrange
		$home = untrailingslashit( home_url() );
		Module::reset_physical_file_cache();
		update_option( Module::OPTION_EXISTING_FILE_DECISION, 'replace' );

		// Act
		$links = $this->invoke_build_site_links();

		// Assert
		$this->assertContains(
			'<' . $home . '/llms.txt>; rel="llms-txt"; type="text/plain"',
			$links
		);
	}

	public function test_build_site_links__includes_mcp_card_when_filter_enabled() {
		// Arrange
		$home = untrailingslashit( home_url() );
		add_filter( 'elementor/agents/link_headers/emit_mcp_card', '__return_true' );

		// Act
		$links = $this->invoke_build_site_links();

		// Assert
		$this->assertContains(
			'<' . $home . '/.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
			$links
		);

		remove_filter( 'elementor/agents/link_headers/emit_mcp_card', '__return_true' );
	}

	public function test_build_singular_markdown_link__includes_published_post() {
		$post = get_post( $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_title'   => 'Link Header Markdown Page',
			'post_content' => 'Body content long enough for extraction.',
		] ) );

		$link = $this->link_headers->build_singular_markdown_link( $post );

		$this->assertNotNull( $link );
		$this->assertStringContainsString( untrailingslashit( get_permalink( $post->ID ) ) . '.md', $link );
	}

	public function test_build_singular_markdown_link__omits_noindex_post() {
		$post = get_post( $this->factory()->post->create( [
			'post_status' => 'publish',
			'post_title'  => 'Noindex Link Header Page',
		] ) );
		update_post_meta( $post->ID, '_yoast_wpseo_meta-robots-noindex', '1' );

		$this->assertNull( $this->link_headers->build_singular_markdown_link( $post ) );
	}

	public function test_build_singular_markdown_link__omits_draft_post() {
		$post = get_post( $this->factory()->post->create( [
			'post_status' => 'draft',
			'post_title'  => 'Draft Link Header Page',
		] ) );

		$this->assertNull( $this->link_headers->build_singular_markdown_link( $post ) );
	}

	public function test_build_singular_markdown_link__omits_post_when_markdown_is_disabled() {
		// Arrange
		$post = get_post( $this->factory()->post->create( [
			'post_status' => 'publish',
			'post_title'  => 'Disabled Markdown Link Header Page',
		] ) );
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'enabled', false );

		// Act
		$link = $this->link_headers->build_singular_markdown_link( $post );

		// Assert
		$this->assertNull( $link );
	}

	public function test_is_enabled__returns_true_when_activated() {
		$this->assertTrue( $this->link_headers->is_enabled() );
	}

	public function test_add_rest_headers__includes_llms_txt_when_enabled() {
		// Arrange
		$response = new \WP_HTTP_Response();
		$request  = new \WP_REST_Request( 'GET', '/elementor/v1/test' );

		// Act
		$result = $this->link_headers->add_rest_headers( $response, null, $request );

		// Assert
		$link_headers = $result->get_headers()['Link'] ?? [];
		$all_links    = is_array( $link_headers ) ? implode( '', $link_headers ) : $link_headers;
		$this->assertStringContainsString( 'llms.txt', $all_links );
	}

	public function test_add_rest_headers__omits_llms_txt_when_disabled() {
		// Arrange
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_LLMS_TXT, 'enabled', false );
		$response = new \WP_HTTP_Response();
		$request  = new \WP_REST_Request( 'GET', '/elementor/v1/test' );

		// Act
		$result = $this->link_headers->add_rest_headers( $response, null, $request );

		// Assert
		$link_headers = $result->get_headers()['Link'] ?? [];
		$all_links    = is_array( $link_headers ) ? implode( '', $link_headers ) : $link_headers;
		$this->assertStringNotContainsString( 'llms.txt', $all_links );
	}

	public function test_add_rest_headers__omits_llms_txt_when_decision_is_keep() {
		// Arrange
		update_option( Module::OPTION_EXISTING_FILE_DECISION, 'keep' );
		$response = new \WP_HTTP_Response();
		$request  = new \WP_REST_Request( 'GET', '/elementor/v1/test' );

		// Act
		$result = $this->link_headers->add_rest_headers( $response, null, $request );

		// Assert
		$link_headers = $result->get_headers()['Link'] ?? [];
		$all_links    = is_array( $link_headers ) ? implode( '', $link_headers ) : $link_headers;
		$this->assertStringNotContainsString( 'llms.txt', $all_links );
	}

	public function test_add_rest_headers__omits_llms_txt_when_physical_file_exists() {
		// Arrange
		require_once ABSPATH . 'wp-admin/includes/file.php';
		$file_path = get_home_path() . Module::LLMS_FILENAME;

		try {
			file_put_contents( $file_path, '# Physical file' );
			update_option( Module::OPTION_EXISTING_FILE_DECISION, 'replace' );
			Module::reset_physical_file_cache();

			$response = new \WP_HTTP_Response();
			$request  = new \WP_REST_Request( 'GET', '/elementor/v1/test' );

			// Act
			$result = $this->link_headers->add_rest_headers( $response, null, $request );

			// Assert
			$link_headers = $result->get_headers()['Link'] ?? [];
			$all_links    = is_array( $link_headers ) ? implode( '', $link_headers ) : $link_headers;
			$this->assertStringNotContainsString( 'llms.txt', $all_links );
		} finally {
			if ( file_exists( $file_path ) ) {
				unlink( $file_path );
			}
			Module::reset_physical_file_cache();
		}
	}

	/**
	 * @return string[]
	 */
	private function invoke_build_site_links(): array {
		$method = new \ReflectionMethod( Link_Headers::class, 'build_site_links' );
		$method->setAccessible( true );

		return $method->invoke( $this->link_headers );
	}
}
