<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Elementor_Content as Export_Elementor_Content;
use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Elementor_Content as Import_Elementor_Content;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Elementor_Content_Parent_Child extends Elementor_Test_Base {

	public function test_export_includes_post_parent_in_manifest() {
		$this->act_as_admin();

		$parent_page_id = $this->factory()->post->create([
			'post_type' => 'page',
			'post_title' => 'Parent Page',
			'post_status' => 'publish',
		]);

		$child_page_id = $this->factory()->post->create([
			'post_type' => 'page',
			'post_title' => 'Child Page',
			'post_status' => 'publish',
			'post_parent' => $parent_page_id,
		]);

		update_post_meta( $parent_page_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $child_page_id, '_elementor_edit_mode', 'builder' );

		$exporter = new Export_Elementor_Content();
		$result = $exporter->export([]);

		$this->assertArrayHasKey( 'manifest_data', $result );
		$this->assertArrayHasKey( 'page', $result['manifest_data'] );

		$parent_manifest = $result['manifest_data']['page'][ $parent_page_id ];
		$child_manifest = $result['manifest_data']['page'][ $child_page_id ];

		$this->assertArrayNotHasKey( 'post_parent', $parent_manifest );
		$this->assertArrayHasKey( 'post_parent', $child_manifest );
		$this->assertEquals( $parent_page_id, $child_manifest['post_parent'] );
	}

	public function test_import_resolves_parent_child_relationships() {
		$this->act_as_admin();

		$mock_imported_data = [];
		$mock_post_settings = [
			'parent' => [
				'id' => 100,
				'title' => 'Parent Page',
				'doc_type' => 'wp-page',
			],
			'child' => [
				'id' => 200,
				'title' => 'Child Page',
				'doc_type' => 'wp-page',
				'post_parent' => 100,
			],
		];

		$importer = new Import_Elementor_Content();
		$importer->import([
			'session_id' => 'test-session',
			'customization' => ['content' => null],
		], $mock_imported_data);

		$reflection = new \ReflectionClass( $importer );
		$method = $reflection->getMethod( 'resolve_parent_post_id' );
		$method->setAccessible( true );

		$property = $reflection->getProperty( 'current_session_mappings' );
		$property->setAccessible( true );
		$property->setValue( $importer, [ 100 => 500 ] );

		$result = $method->invoke( $importer, 100 );

		$this->assertEquals( 500, $result );
	}

	public function test_import_tracks_session_mappings() {
		$this->act_as_admin();

		$importer = new Import_Elementor_Content();
		$importer->import([
			'session_id' => 'test-session',
			'customization' => ['content' => null],
		], []);

		$reflection = new \ReflectionClass( $importer );
		$method = $reflection->getMethod( 'track_import' );
		$method->setAccessible( true );

		$property = $reflection->getProperty( 'current_session_mappings' );
		$property->setAccessible( true );

		$import_result = [
			'status' => Import_Elementor_Content::IMPORT_STATUS_SUCCEEDED,
			'result' => 500,
		];

		$method->invoke( $importer, 100, $import_result );

		$mappings = $property->getValue( $importer );
		$this->assertEquals( 500, $mappings[100] );
	}

	public function test_import_does_not_track_failed_imports() {
		$this->act_as_admin();

		$importer = new Import_Elementor_Content();
		$importer->import([
			'session_id' => 'test-session',
			'customization' => ['content' => null],
		], []);

		$reflection = new \ReflectionClass( $importer );
		$method = $reflection->getMethod( 'track_import' );
		$method->setAccessible( true );

		$property = $reflection->getProperty( 'current_session_mappings' );
		$property->setAccessible( true );

		$import_result = [
			'status' => Import_Elementor_Content::IMPORT_STATUS_FAILED,
			'result' => 'Error message',
		];

		$method->invoke( $importer, 100, $import_result );

		$mappings = $property->getValue( $importer );
		$this->assertEmpty( $mappings );
	}

	public function test_get_mapped_post_id_returns_null_for_unmapped_id() {
		$this->act_as_admin();

		$importer = new Import_Elementor_Content();
		$importer->import([
			'session_id' => 'test-session',
			'customization' => ['content' => null],
		], []);

		$reflection = new \ReflectionClass( $importer );
		$method = $reflection->getMethod( 'get_mapped_post_id' );
		$method->setAccessible( true );

		$result = $method->invoke( $importer, 999 );

		$this->assertNull( $result );
	}

	public function test_resolve_parent_post_id_fallback_to_original() {
		$this->act_as_admin();

		$importer = new Import_Elementor_Content();
		$importer->import([
			'session_id' => 'test-session',
			'customization' => ['content' => null],
		], []);

		$reflection = new \ReflectionClass( $importer );
		$method = $reflection->getMethod( 'resolve_parent_post_id' );
		$method->setAccessible( true );

		$result = $method->invoke( $importer, 100 );

		$this->assertEquals( 100, $result );
	}

	public function test_integration_parent_child_import_flow() {
		$this->act_as_admin();

		$parent_page_id = $this->factory()->post->create([
			'post_type' => 'page',
			'post_title' => 'Works',
			'post_status' => 'publish',
		]);

		$child_page_id = $this->factory()->post->create([
			'post_type' => 'page',
			'post_title' => 'Air',
			'post_status' => 'publish',
			'post_parent' => $parent_page_id,
		]);

		update_post_meta( $parent_page_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $child_page_id, '_elementor_edit_mode', 'builder' );

		$exporter = new Export_Elementor_Content();
		$export_result = $exporter->export([]);

		$this->assertArrayHasKey( 'post_parent', $export_result['manifest_data']['page'][ $child_page_id ] );
		$this->assertEquals( $parent_page_id, $export_result['manifest_data']['page'][ $child_page_id ]['post_parent'] );

		wp_delete_post( $parent_page_id, true );
		wp_delete_post( $child_page_id, true );

		$importer = new Import_Elementor_Content();
		$mock_posts_settings = [
			$parent_page_id => [
				'title' => 'Works',
				'doc_type' => 'wp-page',
			],
			$child_page_id => [
				'title' => 'Air',
				'doc_type' => 'wp-page',
				'post_parent' => $parent_page_id,
			],
		];

		$reflection = new \ReflectionClass( $importer );
		$method = $reflection->getMethod( 'import_elementor_post_type' );
		$method->setAccessible( true );

		$result = $method->invoke( $importer, $mock_posts_settings, '/tmp/', 'page', [], null );

		$this->assertArrayHasKey( 'succeed', $result );
		$this->assertCount( 2, $result['succeed'] );

		$new_parent_id = $result['succeed'][ $parent_page_id ];
		$new_child_id = $result['succeed'][ $child_page_id ];

		$new_child_post = get_post( $new_child_id );
		$this->assertEquals( $new_parent_id, $new_child_post->post_parent );
	}
}
