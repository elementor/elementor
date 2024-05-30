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
}
