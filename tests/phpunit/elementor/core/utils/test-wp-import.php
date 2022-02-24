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

	private function assert_valid_result( $expected_succeed, $result ) {
		$this->assertEquals( [
			'status' => 'success',
			'errors' => [],
			'summary' => [
				'categories' => 0,
				'tags' => 0,
				'terms' => 0,
				'posts' => [
					'failed' => [],
					'succeed' => $expected_succeed,
				],
			],
		], $result );
	}

	public function test_run__import_menu() {

		// Arrange.
		$menu_importer = new WP_Import( __DIR__ . '/mock/nav_menu_item.xml' );
		$post_importer = new WP_Import( __DIR__ . '/mock/post.xml' );
		$page_importer = new WP_Import( __DIR__ . '/mock/page.xml' );

		// Act.
		$page_result = $page_importer->run();
		$post_result = $post_importer->run();
		$menu_result = $menu_importer->run();

		// Assert.
		$pages = get_posts( [
			'numberposts' => -1,
			'post_status' => 'any',
			'post_type' => 'page',
		] );

		$post = get_post( 8 );

		$menu_items = get_posts( [
			'numberposts' => -1,
			'post_status' => 'any',
			'post_type' => 'nav_menu_item',
		] );

		$this->assert_valid_result( [
			6 => 6,
			9 => 7,
		], $page_result );
		$this->assertCount( 2, $pages );

		$this->assert_valid_result( [ 1 => 8 ], $post_result );
		$this->assertEquals( 'publish', $post->post_status );

		$this->assertEquals( [
			'status' => 'success',
			'errors' => [],
			'summary' => [
				'categories' => 0,
				'tags' => 0,
				'terms' => 1,
				'posts' => [
					'failed' => [],
					'succeed' => [ 3 => 2 ],
				],
			],
		], $menu_result );

		$this->assertCount( 2, $menu_items );
	}
}
