<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Css;

use Elementor\Core\Files\CSS\Post;
use Elementor\Core\Files\CSS\Post_Preview;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Post_Preview extends Elementor_Test_Base {

	public function test_preview_uses_dedicated_css_file_not_published_path() {
		// Arrange.
		$post_id = $this->factory()->create_and_get_default_post()->ID;
		$revision_id = $this->factory()->post->create( [
			'post_type' => 'revision',
			'post_parent' => $post_id,
			'post_status' => 'inherit',
		] );

		// Act.
		$published = new Post( $post_id );
		$preview = new Post_Preview( $revision_id );

		// Assert.
		$this->assertSame( 'post-' . $post_id . '.css', $published->get_file_name() );
		$this->assertSame( 'post-' . $post_id . '-preview.css', $preview->get_file_name() );
		$this->assertNotSame(
			$published->get_path(),
			$preview->get_path(),
			'Unpublished preview CSS must not share the live post stylesheet path.'
		);
	}

	public function test_published_post_css_keeps_live_file_name() {
		// Arrange.
		$post_id = $this->factory()->create_and_get_default_post()->ID;

		// Act.
		$published = new Post( $post_id );

		// Assert.
		$this->assertSame( 'post-' . $post_id . '.css', $published->get_file_name() );
		$this->assertStringEndsWith( 'post-' . $post_id . '.css', $published->get_path() );
		$this->assertStringNotContainsString( '-preview.css', $published->get_file_name() );
	}
}
