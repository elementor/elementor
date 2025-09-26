<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\ImportExport;

use Elementor\Core\Utils\ImportExport\WP_Import;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_WP_Import_Recursive_Backfill extends Elementor_Test_Base {

	public function test_recursive_backfill_handles_multi_level_hierarchy() {
		$this->act_as_admin();

		$temp_file = $this->create_test_wxr_file();
		$wp_import = new WP_Import( $temp_file );

		$reflection = new \ReflectionClass( $wp_import );
		
		$processed_posts_property = $reflection->getProperty( 'processed_posts' );
		$processed_posts_property->setAccessible( true );
		
		$post_orphans_property = $reflection->getProperty( 'post_orphans' );
		$post_orphans_property->setAccessible( true );
		
		$backfill_method = $reflection->getMethod( 'backfill_post_parents' );
		$backfill_method->setAccessible( true );

		$processed_posts = [
			300 => 1300, // Grandchild -> new ID 1300
			200 => 1200, // Child -> new ID 1200  
			100 => 1100, // Parent -> new ID 1100
		];

		$post_orphans = [
			300 => 200, // Grandchild -> Child
			200 => 100, // Child -> Parent
			100 => 50,  // Parent -> Missing Great-grandparent
		];

		$processed_posts_property->setValue( $wp_import, $processed_posts );
		$post_orphans_property->setValue( $wp_import, $post_orphans );

		$orphans_before = $post_orphans_property->getValue( $wp_import );
		$this->assertCount( 3, $orphans_before, 'All three posts should be orphaned initially.' );

		$backfill_method->invoke( $wp_import );

		$orphans_after = $post_orphans_property->getValue( $wp_import );
		$this->assertCount( 1, $orphans_after, 'Only parent with missing great-grandparent should remain orphaned.' );
		$this->assertArrayHasKey( 100, $orphans_after, 'Parent should still be orphaned due to missing great-grandparent.' );

		$grandchild_post = get_post( 1300 );
		$child_post = get_post( 1200 );
		$parent_post = get_post( 1100 );

		$this->assertEquals( 1200, $grandchild_post->post_parent, 'Grandchild should have Child as parent.' );
		$this->assertEquals( 1100, $child_post->post_parent, 'Child should have Parent as parent.' );
		$this->assertEquals( 0, $parent_post->post_parent, 'Parent should have no parent (missing great-grandparent handled).' );

		unlink( $temp_file );
	}

	public function test_single_level_parent_child_relationship() {
		$this->act_as_admin();

		$temp_file = $this->create_test_wxr_file();
		$wp_import = new WP_Import( $temp_file );

		$reflection = new \ReflectionClass( $wp_import );
		
		$processed_posts_property = $reflection->getProperty( 'processed_posts' );
		$processed_posts_property->setAccessible( true );
		
		$post_orphans_property = $reflection->getProperty( 'post_orphans' );
		$post_orphans_property->setAccessible( true );
		
		$backfill_method = $reflection->getMethod( 'backfill_post_parents' );
		$backfill_method->setAccessible( true );

		$processed_posts = [
			200 => 1200, // Child -> new ID 1200
			100 => 1100, // Parent -> new ID 1100
		];

		$post_orphans = [
			200 => 100, // Child -> Parent
		];

		$processed_posts_property->setValue( $wp_import, $processed_posts );
		$post_orphans_property->setValue( $wp_import, $post_orphans );

		$backfill_method->invoke( $wp_import );

		$orphans_after = $post_orphans_property->getValue( $wp_import );
		$this->assertEmpty( $orphans_after, 'All orphans should be resolved.' );

		$child_post = get_post( 1200 );
		$this->assertEquals( 1100, $child_post->post_parent, 'Child should have Parent as parent.' );

		unlink( $temp_file );
	}

	public function test_missing_parent_handled_correctly() {
		$this->act_as_admin();

		$temp_file = $this->create_test_wxr_file();
		$wp_import = new WP_Import( $temp_file );

		$reflection = new \ReflectionClass( $wp_import );
		
		$processed_posts_property = $reflection->getProperty( 'processed_posts' );
		$processed_posts_property->setAccessible( true );
		
		$post_orphans_property = $reflection->getProperty( 'post_orphans' );
		$post_orphans_property->setAccessible( true );
		
		$backfill_method = $reflection->getMethod( 'backfill_post_parents' );
		$backfill_method->setAccessible( true );

		$processed_posts = [
			200 => 1200, // Child -> new ID 1200
		];

		$post_orphans = [
			200 => 100, // Child -> Missing Parent (100)
		];

		$processed_posts_property->setValue( $wp_import, $processed_posts );
		$post_orphans_property->setValue( $wp_import, $post_orphans );

		$backfill_method->invoke( $wp_import );

		$orphans_after = $post_orphans_property->getValue( $wp_import );
		$this->assertEmpty( $orphans_after, 'Orphan should be resolved by setting parent to 0.' );

		$child_post = get_post( 1200 );
		$this->assertEquals( 0, $child_post->post_parent, 'Child should have no parent when parent is missing.' );

		unlink( $temp_file );
	}

	private function create_test_wxr_file() {
		$wxr_content = '<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
	<channel>
		<title>Test Site</title>
		<wp:wxr_version>1.2</wp:wxr_version>
		<wp:base_site_url>http://example.com</wp:base_site_url>
		<wp:base_blog_url>http://example.com</wp:base_blog_url>
	</channel>
</rss>';

		$temp_file = wp_tempnam( 'test-wxr' );
		file_put_contents( $temp_file, $wxr_content );

		return $temp_file;
	}

	protected function setUp(): void {
		parent::setUp();
		$this->act_as_admin();

		$this->factory()->post->create([
			'ID' => 1300,
			'post_type' => 'page',
			'post_title' => 'Test Grandchild',
			'post_status' => 'publish',
		]);

		$this->factory()->post->create([
			'ID' => 1200,
			'post_type' => 'page', 
			'post_title' => 'Test Child',
			'post_status' => 'publish',
		]);

		$this->factory()->post->create([
			'ID' => 1100,
			'post_type' => 'page',
			'post_title' => 'Test Parent', 
			'post_status' => 'publish',
		]);
	}

	protected function tearDown(): void {
		wp_delete_post( 1300, true );
		wp_delete_post( 1200, true );
		wp_delete_post( 1100, true );
		
		parent::tearDown();
	}
}
