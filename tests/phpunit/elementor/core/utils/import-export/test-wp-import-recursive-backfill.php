<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\ImportExport;

use Elementor\Core\Utils\ImportExport\WP_Import;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_WP_Import_Recursive_Backfill extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();
		$this->remove_default_kit();
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

	public function test_make_post_top_level_when_parent_missing() {
		$child_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_title' => 'Test Child',
			'post_status' => 'publish',
			'post_parent' => 999,
		]);

		$importer = new WP_Import( __DIR__ . '/mock/parent-child-pages.xml' );

		$reflection = new \ReflectionClass( $importer );
		$method = $reflection->getMethod( 'make_post_top_level_when_parent_missing' );
		$method->setAccessible( true );

		$method->invoke( $importer, $child_id );

		$updated_post = get_post( $child_id );
		$this->assertEquals( 0, $updated_post->post_parent );

		wp_delete_post( $child_id, true );
	}
}
