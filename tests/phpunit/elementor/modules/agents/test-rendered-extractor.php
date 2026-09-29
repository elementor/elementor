<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Components\Readability\Extractors\Rendered_Extractor;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Rendered_Extractor extends Elementor_Test_Base {

	private const TEMPLATE_FILTERS = [ 'page_template', 'single_template', 'singular_template', 'index_template' ];

	private string $throwing_template_path;
	private \WP_Post $source_post;
	private array $probe_template_paths = [];
	private array $probe_filter_callbacks = [];

	public function setUp(): void {
		parent::setUp();

		$this->source_post = get_post( $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'Source Post Title',
		] ) );

		$GLOBALS['post'] = $this->source_post;
		setup_postdata( $this->source_post );

		$this->throwing_template_path = tempnam( sys_get_temp_dir(), 'elementor-throwing-template' );
		file_put_contents(
			$this->throwing_template_path,
			'<?php throw new \\RuntimeException( "template blew up" );'
		);

		foreach ( self::TEMPLATE_FILTERS as $filter ) {
			add_filter( $filter, [ $this, 'force_throwing_template' ] );
		}
	}

	public function tearDown(): void {
		foreach ( self::TEMPLATE_FILTERS as $filter ) {
			remove_filter( $filter, [ $this, 'force_throwing_template' ] );
		}

		foreach ( $this->probe_filter_callbacks as $filter => $callback ) {
			remove_filter( $filter, $callback );
		}

		unlink( $this->throwing_template_path );

		foreach ( $this->probe_template_paths as $probe_path ) {
			unlink( $probe_path );
		}

		wp_reset_postdata();

		parent::tearDown();
	}

	public function force_throwing_template() {
		return $this->throwing_template_path;
	}

	public function test_extract__restores_query_and_output_buffer_when_template_throws() {
		global $wp_query, $wp_the_query;

		// Arrange.
		$post_id = $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
		] );
		$post = get_post( $post_id );

		$expected_query     = $wp_query;
		$expected_the_query = $wp_the_query;
		$expected_ob_level  = ob_get_level();

		ob_start();
		echo 'outer buffer content';

		// Act.
		$result = ( new Rendered_Extractor() )->extract( $post );

		// Assert.
		$this->assertSame( '', $result );
		$this->assertSame( $expected_query, $wp_query );
		$this->assertSame( $expected_the_query, $wp_the_query );
		$this->assertSame( $expected_ob_level + 1, ob_get_level() );
		$this->assertSame( 'outer buffer content', ob_get_contents() );
		$this->assertSame( $this->source_post->ID, $GLOBALS['post']->ID );

		ob_end_clean();
	}

	public function test_extract__template_tags_use_inlined_post() {
		// Arrange.
		$target_post = get_post( $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
			'post_title'  => 'Target Post Title',
		] ) );

		$this->force_probe_template();

		// Act.
		$result = ( new Rendered_Extractor() )->extract( $target_post );

		// Assert.
		$this->assertStringContainsString( 'PROBEID:' . $target_post->ID, $result );
	}

	public function test_extract__restores_global_post_after_template() {
		global $post;

		// Arrange.
		$target_post = get_post( $this->factory()->post->create( [
			'post_type'   => 'page',
			'post_status' => 'publish',
		] ) );

		$this->force_probe_template();

		// Act.
		( new Rendered_Extractor() )->extract( $target_post );

		// Assert.
		$this->assertSame( $this->source_post->ID, $post->ID );
		$this->assertSame( $this->source_post->ID, $GLOBALS['post']->ID );
	}

	private function force_probe_template(): void {
		$probe_path = tempnam( sys_get_temp_dir(), 'elementor-probe-template' );
		file_put_contents(
			$probe_path,
			'<?php echo "PROBEID:" . get_the_ID();'
		);

		$this->probe_template_paths[] = $probe_path;

		$callback = static function () use ( $probe_path ) {
			return $probe_path;
		};

		foreach ( self::TEMPLATE_FILTERS as $filter ) {
			add_filter( $filter, $callback );
			$this->probe_filter_callbacks[ $filter ] = $callback;
		}
	}
}
