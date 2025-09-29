<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\ImportExport;

use Elementor\Core\Utils\ImportExport\WP_Import;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_WP_Import extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();

		// Should remove the default kit because it is actually a post and it affect
		// the number of posts that exists.
		$this->remove_default_kit();
	}

	public function test_run__import_native_wp_content() {
		// Arrange.
		$page_importer = new WP_Import( __DIR__ . '/mock/page.xml' );
		$post_importer = new WP_Import( __DIR__ . '/mock/post.xml' );
		$menu_importer = new WP_Import( __DIR__ . '/mock/nav_menu_item.xml' );

		// Act.
		$page_result = $page_importer->run();
		$post_result = $post_importer->run();
		$menu_result = $menu_importer->run();

		// Assert.
		$this->assertEqualSets( [ 5 ],array_keys( $page_result['summary']['posts']['succeed'] ) );
		$this->assertNotNull( get_posts( $page_result['summary']['posts']['succeed'][5] ) );

		$this->assertEqualSets( [ 1 ],array_keys( $post_result['summary']['posts']['succeed'] ) );
		$this->assertNotNull( get_posts( $post_result['summary']['posts']['succeed'][1] ) );

		$this->assertEqualSets( [ 17 ],array_keys( $menu_result['summary']['terms']['succeed'] ) );
		$this->assertEqualSets( [ 17 ],array_keys( $menu_result['summary']['posts']['succeed'] ) );
		$this->assertNotNull( get_term( $menu_result['summary']['terms']['succeed'][17], 'nav_menu' ) );
		$this->assertNotNull( get_posts( $menu_result['summary']['posts']['succeed'][17] ) );
	}

	public function test_import_parent_child_hierarchy() {
		$importer = new WP_Import( __DIR__ . '/mock/parent-child-pages.xml' );
		$result = $importer->run();

		$this->assertEqualSets( [ 100, 200, 300 ], array_keys( $result['summary']['posts']['succeed'] ) );

		$parent_id = $result['summary']['posts']['succeed'][100];
		$child_id = $result['summary']['posts']['succeed'][200];
		$grandchild_id = $result['summary']['posts']['succeed'][300];

		$parent_post = get_post( $parent_id );
		$child_post = get_post( $child_id );
		$grandchild_post = get_post( $grandchild_id );

		$this->assertEquals( 0, $parent_post->post_parent, 'Parent should have no parent.' );
		$this->assertEquals( $parent_id, $child_post->post_parent, 'Child should have Parent as parent.' );
		$this->assertEquals( $child_id, $grandchild_post->post_parent, 'Grandchild should have Child as parent.' );
	}
}
