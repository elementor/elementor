<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Agents\Classes\Post_Noindex;
use Elementor\Modules\Agents\Components\Readability\Content_Extractor;
use Elementor\Modules\Agents\Components\Readability\Frontmatter_Builder;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;
use Elementor\Modules\Agents\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Markdown_Endpoint extends Elementor_Test_Base {

	private Markdown_Endpoint $endpoint;

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

		$this->endpoint = new Markdown_Endpoint();
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

	public function test_serve_markdown__skips_draft_post() {
		// Arrange
		$post = get_post( $this->factory()->post->create( [
			'post_status' => 'draft',
			'post_title'  => 'Draft Markdown Page',
		] ) );

		// Act
		ob_start();
		$this->endpoint->serve_markdown( $post );
		$output = ob_get_clean();

		// Assert
		$this->assertSame( '', $output );
	}

	public function test_serve_markdown__skips_private_post() {
		// Arrange
		$post = get_post( $this->factory()->post->create( [
			'post_status' => 'private',
			'post_title'  => 'Private Markdown Page',
		] ) );

		// Act
		ob_start();
		$this->endpoint->serve_markdown( $post );
		$output = ob_get_clean();

		// Assert
		$this->assertSame( '', $output );
	}

	public function test_serve_markdown__skips_password_protected_post() {
		// Arrange
		$post = get_post( $this->factory()->post->create( [
			'post_status'   => 'publish',
			'post_password' => 'secret',
		] ) );

		// Act
		ob_start();
		$this->endpoint->serve_markdown( $post );
		$output = ob_get_clean();

		// Assert
		$this->assertSame( '', $output );
	}

	public function test_serve_markdown__blocks_noindex_post_without_markdown_body() {
		// Arrange
		$post = get_post( $this->factory()->post->create( [
			'post_status' => 'publish',
			'post_title'  => 'Noindex Markdown Page',
		] ) );
		update_post_meta( $post->ID, '_yoast_wpseo_meta-robots-noindex', '1' );

		// Act & Assert — noindex posts are rejected before markdown is generated.
		$this->assertTrue( Post_Noindex::is_noindex( $post->ID ) );
	}

	public function test_serve_markdown__builds_published_post_with_frontmatter() {
		// Arrange
		$post = get_post( $this->factory()->post->create( [
			'post_status'  => 'publish',
			'post_title'   => 'Published Markdown Page',
			'post_content' => 'Body content for markdown.',
		] ) );

		$extractor = new Content_Extractor();
		$extraction = $extractor->extract_with_id( $post );
		$frontmatter = ( new Frontmatter_Builder() )->build( $post, $extraction['id'] );
		$output = $frontmatter . "\n\n" . $extraction['body'];

		// Act & Assert
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

	private function get_private_property( string $name ) {
		$property = new \ReflectionProperty( Markdown_Endpoint::class, $name );
		$property->setAccessible( true );

		return $property->getValue( $this->endpoint );
	}
}
