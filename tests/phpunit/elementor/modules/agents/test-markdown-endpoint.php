<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Agents\Agent_Ready_Settings;
use Elementor\Modules\Agents\Classes\Post_Noindex;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;
use Elementor\Modules\Agents\Content_Generator;
use Elementor\Modules\Agents\Module;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Markdown_Endpoint extends Elementor_Test_Base {

	private Markdown_Endpoint $endpoint;

	private Agent_Ready_Settings $settings;

	private $original_experiment_default_state;

	private string $original_request_uri;

	private $original_http_accept;

	public function setUp(): void {
		parent::setUp();

		global $wp_rewrite;

		$this->original_request_uri = $_SERVER['REQUEST_URI'] ?? '/';
		$this->original_http_accept = $_SERVER['HTTP_ACCEPT'] ?? null;

		$wp_rewrite->set_permalink_structure( '/%postname%/' );
		flush_rewrite_rules();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Module::EXPERIMENT_NAME )['default'];

		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		delete_option( Agent_Ready_Settings::OPTION );

		$this->settings = new Agent_Ready_Settings( new Content_Generator( new Prompt_Injection_Sanitizer() ) );
		$this->settings->ensure_option_exists();
		$this->endpoint = new Markdown_Endpoint( $this->settings );
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		$_SERVER['REQUEST_URI'] = $this->original_request_uri;

		if ( null === $this->original_http_accept ) {
			unset( $_SERVER['HTTP_ACCEPT'] );
		} else {
			$_SERVER['HTTP_ACCEPT'] = $this->original_http_accept;
		}

		unset( $_GET['format'] );

		delete_option( Agent_Ready_Settings::OPTION );

		parent::tearDown();
	}

	public function test_on_parse_request__resolves_published_page_from_md_path() {
		// Arrange
		$post_id = $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'Markdown Path Test',
			'post_name'   => 'markdown-path-test',
		] );
		$_SERVER['REQUEST_URI'] = '/markdown-path-test.md';

		// Act
		$this->endpoint->on_parse_request( new \WP() );

		// Assert
		$this->assertTrue( $this->get_private_property( 'serving_md' ) );
		$this->assertSame( $post_id, $this->get_private_property( 'md_post_id' ) );
	}

	public function test_on_parse_request__ignores_non_md_paths() {
		// Arrange
		$this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_name'   => 'plain-page',
		] );
		$_SERVER['REQUEST_URI'] = '/plain-page';

		// Act
		$this->endpoint->on_parse_request( new \WP() );

		// Assert
		$this->assertFalse( $this->get_private_property( 'serving_md' ) );
		$this->assertNull( $this->get_private_property( 'md_post_id' ) );
	}

	public function test_on_parse_request__ignores_unknown_md_path() {
		// Arrange
		$_SERVER['REQUEST_URI'] = '/does-not-exist.md';

		// Act
		$this->endpoint->on_parse_request( new \WP() );

		// Assert
		$this->assertFalse( $this->get_private_property( 'serving_md' ) );
		$this->assertNull( $this->get_private_property( 'md_post_id' ) );
	}

	public function test_on_parse_request__matches_subdirectory_install() {
		// Arrange
		add_filter( 'home_url', static function () {
			return 'http://example.com/blog';
		} );

		$post_id = $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_name'   => 'subdir-page',
		] );
		$_SERVER['REQUEST_URI'] = '/blog/subdir-page.md';

		// Act
		$this->endpoint->on_parse_request( new \WP() );

		// Cleanup
		remove_all_filters( 'home_url' );

		// Assert
		$this->assertTrue( $this->get_private_property( 'serving_md' ) );
		$this->assertSame( $post_id, $this->get_private_property( 'md_post_id' ) );
	}

	public function test_is_markdown_access_allowed__denies_draft_post() {
		$post = get_post( $this->factory()->post->create( [
			'post_status' => 'draft',
			'post_title'  => 'Draft Markdown Page',
		] ) );

		$this->assertFalse( $this->endpoint->is_markdown_access_allowed( $post ) );
	}

	public function test_is_markdown_access_allowed__denies_private_post() {
		$post = get_post( $this->factory()->post->create( [
			'post_status' => 'private',
			'post_title'  => 'Private Markdown Page',
		] ) );

		$this->assertFalse( $this->endpoint->is_markdown_access_allowed( $post ) );
	}

	public function test_is_markdown_access_allowed__denies_password_protected_post() {
		$post = get_post( $this->factory()->post->create( [
			'post_status'   => 'publish',
			'post_password' => 'secret',
		] ) );

		$this->assertFalse( $this->endpoint->is_markdown_access_allowed( $post ) );
	}

	public function test_is_markdown_access_allowed__denies_noindex_post() {
		$post = get_post( $this->factory()->post->create( [
			'post_status' => 'publish',
			'post_title'  => 'Noindex Markdown Page',
		] ) );
		update_post_meta( $post->ID, '_yoast_wpseo_meta-robots-noindex', '1' );

		$this->assertFalse( $this->endpoint->is_markdown_access_allowed( $post ) );
	}

	public function test_is_markdown_access_allowed__allows_published_page_by_default() {
		// Arrange
		$post = $this->create_published_page();

		// Act
		$is_allowed = $this->endpoint->is_markdown_access_allowed( $post );

		// Assert
		$this->assertTrue( $is_allowed );
	}

	public function test_is_markdown_access_allowed__denies_when_markdown_is_disabled() {
		// Arrange
		$post = $this->create_published_page();
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'enabled', false );

		// Act
		$is_allowed = $this->endpoint->is_markdown_access_allowed( $post );

		// Assert
		$this->assertFalse( $is_allowed );
	}

	public function test_is_markdown_access_allowed__denies_excluded_post_type() {
		// Arrange
		$post = $this->create_published_page();
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'post_types', [ 'post' ] );

		// Act
		$is_allowed = $this->endpoint->is_markdown_access_allowed( $post );

		// Assert
		$this->assertFalse( $is_allowed );
	}

	public function test_filter_should_serve__blocks_markdown_render_when_markdown_is_disabled() {
		// Arrange
		$post = $this->create_published_page();
		$this->settings->set_server_value( Agent_Ready_Settings::MODULE_MARKDOWN_CONTENT, 'enabled', false );

		// Act
		$should_serve = $this->endpoint->filter_should_serve( true, $post );

		// Assert
		$this->assertFalse( $should_serve );
	}

	public function test_filter_should_serve__passes_through_when_post_is_included() {
		// Arrange
		$post = $this->create_published_page();

		// Act & Assert
		$this->assertTrue( $this->endpoint->filter_should_serve( true, $post ) );
		$this->assertFalse( $this->endpoint->filter_should_serve( false, $post ) );
	}

	public function test_build_markdown__includes_frontmatter_and_body() {
		// Arrange
		$post = get_post( $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_title'   => 'Published Markdown Page',
			'post_content' => 'Body content for markdown.',
		] ) );

		// Act
		$output = $this->endpoint->build_markdown( $post );

		// Assert
		$this->assertMatchesRegularExpression( '/---\s*\n[\s\S]*?\n---/', $output );
		$this->assertStringContainsString( 'Body content for markdown.', $output );
	}

	public function test_send_headers__emits_markdown_response_headers() {
		// Arrange
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
			'post_title'  => 'Header Test Page',
		] );

		// Act
		$headers = $this->endpoint->build_response_headers( $post_id );

		// Assert
		$this->assertSame( 'text/markdown; charset=utf-8', $headers['Content-Type'] );
		$this->assertSame( 'nosniff', $headers['X-Content-Type-Options'] );
		$this->assertSame( 'Accept', $headers['Vary'] );
		$this->assertSame( 'noindex', $headers['X-Robots-Tag'] );
		$this->assertStringContainsString( 'rel="canonical"', $headers['Link'] );
	}

	public function test_on_markdown_headers__emits_canonical_and_noindex_headers() {
		// Arrange
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
			'post_title'  => 'Markdown Header Hook Page',
		] );

		// Act
		$headers = $this->endpoint->build_markdown_hook_headers( $post_id );

		// Assert
		$this->assertSame( 'Accept', $headers['Vary'] );
		$this->assertSame( 'noindex', $headers['X-Robots-Tag'] );
		$this->assertStringContainsString( 'rel="canonical"', $headers['Link'] );
	}

	private function create_published_page(): \WP_Post {
		return get_post( $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'Settings Gated Page',
		] ) );
	}

	private function get_private_property( string $name ) {
		$property = new \ReflectionProperty( Markdown_Endpoint::class, $name );
		$property->setAccessible( true );

		return $property->getValue( $this->endpoint );
	}
}
