<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Elementor_Content as Export_Runner;
use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Elementor_Content as Import_Runner;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Parent_Child_Relationships extends Elementor_Test_Base {

	public function test_export_includes_post_parent_in_manifest() {
		$this->act_as_admin();

		$parent_page = $this->factory()->post->create([
			'post_type' => 'page',
			'post_title' => 'Parent Page',
			'post_status' => 'publish',
		]);

		$child_page = $this->factory()->post->create([
			'post_type' => 'page',
			'post_title' => 'Child Page',
			'post_status' => 'publish',
			'post_parent' => $parent_page,
		]);

		update_post_meta( $parent_page, '_elementor_edit_mode', 'builder' );
		update_post_meta( $child_page, '_elementor_edit_mode', 'builder' );

		$export_runner = new Export_Runner();
		$result = $export_runner->export([]);

		$this->assertArrayHasKey( 'manifest_data', $result );
		$this->assertArrayHasKey( 'page', $result['manifest_data'] );

		$child_manifest = $result['manifest_data']['page'][ $child_page ];
		$this->assertArrayHasKey( 'post_parent', $child_manifest );
		$this->assertEquals( $parent_page, $child_manifest['post_parent'] );
	}

	public function test_import_handles_child_before_parent_scenario() {
		$import_runner = new Import_Runner();
		
		$reflection = new \ReflectionClass( $import_runner );
		$mappings_property = $reflection->getProperty( 'current_session_mappings' );
		$mappings_property->setAccessible( true );
		
		$orphans_property = $reflection->getProperty( 'orphaned_posts' );
		$orphans_property->setAccessible( true );
		
		$backfill_method = $reflection->getMethod( 'backfill_parents' );
		$backfill_method->setAccessible( true );

		$post_settings_child = [
			'id' => 200,
			'post_parent' => 100,
			'doc_type' => 'wp-page',
			'title' => 'Child Page',
		];

		$post_settings_parent = [
			'id' => 100,
			'doc_type' => 'wp-page', 
			'title' => 'Parent Page',
		];

		$mappings_property->setValue( $import_runner, [] );
		$orphans_property->setValue( $import_runner, [] );

		$this->simulate_import_with_parent_logic( $import_runner, $post_settings_child );
		
		$orphans = $orphans_property->getValue( $import_runner );
		$this->assertArrayHasKey( 200, $orphans );
		$this->assertEquals( 100, $orphans[200] );

		$this->simulate_import_with_parent_logic( $import_runner, $post_settings_parent );
		
		$mappings = $mappings_property->getValue( $import_runner );
		$this->assertArrayHasKey( 100, $mappings );
		$this->assertArrayHasKey( 200, $mappings );

		$backfill_method->invoke( $import_runner );
	}

	public function test_recursive_backfill_handles_multi_level_hierarchy() {
		$import_runner = new Import_Runner();
		
		$reflection = new \ReflectionClass( $import_runner );
		$mappings_property = $reflection->getProperty( 'current_session_mappings' );
		$mappings_property->setAccessible( true );
		
		$orphans_property = $reflection->getProperty( 'orphaned_posts' );
		$orphans_property->setAccessible( true );
		
		$backfill_method = $reflection->getMethod( 'backfill_parents' );
		$backfill_method->setAccessible( true );

		$grandchild_settings = [
			'id' => 300,
			'post_parent' => 200,
			'doc_type' => 'wp-page',
			'title' => 'Grandchild Page',
		];

		$child_settings = [
			'id' => 200,
			'post_parent' => 100,
			'doc_type' => 'wp-page',
			'title' => 'Child Page',
		];

		$parent_settings = [
			'id' => 100,
			'post_parent' => 50,
			'doc_type' => 'wp-page',
			'title' => 'Parent Page',
		];

		$mappings_property->setValue( $import_runner, [] );
		$orphans_property->setValue( $import_runner, [] );

		$this->simulate_import_with_parent_logic( $import_runner, $grandchild_settings );
		$this->simulate_import_with_parent_logic( $import_runner, $child_settings );
		$this->simulate_import_with_parent_logic( $import_runner, $parent_settings );

		$orphans_before = $orphans_property->getValue( $import_runner );
		$this->assertCount( 3, $orphans_before, 'All three posts should be orphaned initially.' );

		$backfill_method->invoke( $import_runner );

		$orphans_after = $orphans_property->getValue( $import_runner );
		$this->assertCount( 1, $orphans_after, 'Only parent with missing grandparent should remain orphaned.' );
		$this->assertArrayHasKey( 100, $orphans_after, 'Parent should still be orphaned due to missing grandparent.' );
	}

	private function simulate_import_with_parent_logic( $import_runner, $post_settings ) {
		$reflection = new \ReflectionClass( $import_runner );
		$mappings_property = $reflection->getProperty( 'current_session_mappings' );
		$mappings_property->setAccessible( true );
		
		$orphans_property = $reflection->getProperty( 'orphaned_posts' );
		$orphans_property->setAccessible( true );

		$current_mappings = $mappings_property->getValue( $import_runner );
		$current_orphans = $orphans_property->getValue( $import_runner );

		$post_parent = (int) ( $post_settings['post_parent'] ?? 0 );
		if ( $post_parent ) {
			if ( isset( $current_mappings[ $post_parent ] ) ) {
				$post_parent = $current_mappings[ $post_parent ];
			} else {
				$current_orphans[ (int) $post_settings['id'] ] = $post_parent;
				$post_parent = 0;
			}
		}

		$new_id = 500 + $post_settings['id'];
		
		$import_result = [
			'status' => Import_Runner::IMPORT_STATUS_SUCCEEDED,
			'result' => $new_id,
		];
		
		$map_method = $reflection->getMethod( 'map_imported_post_id' );
		$map_method->setAccessible( true );
		$map_method->invoke( $import_runner, $post_settings['id'], $import_result );

		$mappings_property->setValue( $import_runner, $current_mappings );
		$orphans_property->setValue( $import_runner, $current_orphans );
	}
}
