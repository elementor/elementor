<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Components\Readability\Extractors\Rendered_Extractor;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Rendered_Extractor extends Elementor_Test_Base {

	private string $throwing_template_path;

	public function setUp(): void {
		parent::setUp();

		$this->throwing_template_path = tempnam( sys_get_temp_dir(), 'elementor-throwing-template' );
		file_put_contents(
			$this->throwing_template_path,
			'<?php throw new \\RuntimeException( "template blew up" );'
		);

		foreach ( [ 'page_template', 'single_template', 'singular_template', 'index_template' ] as $filter ) {
			add_filter( $filter, [ $this, 'force_throwing_template' ] );
		}
	}

	public function tearDown(): void {
		foreach ( [ 'page_template', 'single_template', 'singular_template', 'index_template' ] as $filter ) {
			remove_filter( $filter, [ $this, 'force_throwing_template' ] );
		}

		unlink( $this->throwing_template_path );

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

		ob_end_clean();
	}
}
