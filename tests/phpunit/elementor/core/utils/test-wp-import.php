<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils;

use Elementor\Core\Utils\ImportExport\WP_Import;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_WP_Import extends Elementor_Test_Base {
	public function setUp() {
		parent::setUp();

		// Should remove the default kit because it is actually a post and it affect
		// the number of posts that exists.
		$this->remove_default_kit();
	}

	public function test_run__import_two_pages() {
		// Arrange.
		$importer = new WP_Import( __DIR__ . '/mock/page.xml' );

		// Act.
		$result = $importer->run();
		$pages = get_posts( [
			'numberposts' => -1,
			'post_status' => 'any',
			'post_type' => 'page',
		] );

		// Assert.
		$this->assertEquals( [
			'status' => 'success',
			'errors' => [],
			'summary' => [
				'categories' => 0,
				'tags' => 0,
				'terms' => 0,
				'posts' => [
					'failed' => [],
					'succeed' => [
						189 => 6,
						190 => 7,
						195 => 8,
						196 => 9,
					],
				],
			],
		], $result );
		$this->assertCount( 4, $pages );
	}


	public function test_run__import_post() {
		// Arrange.
		$importer = new WP_Import( __DIR__ . '/mock/post.xml' );
		$post_old_id = 200;
		$post_new_id = 11;

		// Act.
		$result = $importer->run();
		$post = get_post( $post_new_id );

		// Assert.
		$this->assertEquals( [
			'status' => 'success',
			'errors' => [],
			'summary' => [
				'categories' => 0,
				'tags' => 0,
				'terms' => 0,
				'posts' => [
					'failed' => [],
					'succeed' => [
						$post_old_id => $post_new_id,
					],
				],
			],
		], $result );

		$this->assertEquals( 'publish', $post->post_status );
	}

	public function test_run__import_menu() {
		// Arrange.
		$importer = new WP_Import( __DIR__ . '/mock/nav_menu_item.xml' );

		// Act.
		$result = $importer->run();
		die;
		$posts = get_posts( [
			'numberposts' => -1,
			'post_status' => 'any',
			'post_type' => 'nav_menu_item',
		] );

		// Assert.
		$this->assertEquals( [
			'status' => 'success',
			'errors' => [],
			'summary' => [
				'categories' => 0,
				'tags' => 0,
				'terms' => 0,
				'posts' => [
					'failed' => [],
					'succeed' => [
						200 => 9,
					],
				],
			],
		], $result );
		$this->assertCount( 1, $posts );
	}
}
