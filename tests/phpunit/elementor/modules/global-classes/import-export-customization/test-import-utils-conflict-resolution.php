<?php

namespace Elementor\Testing\Modules\GlobalClasses\ImportExportCustomization;

use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExportUtils\Import_Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Import_Utils_Conflict_Resolution extends Elementor_Test_Base {

	private string $mock_dir;

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();
		$this->mock_dir = __DIR__ . '/mocks/streaming/global-classes';
	}

	public function test_skip__drops_imported_on_label_conflict() {
		// Arrange
		$repository = Global_Classes_Repository::make();
		$repository->put(
			[
				'g-existing' => [
					'id' => 'g-existing',
					'type' => 'class',
					'label' => 'Test1',
					'variants' => [],
				],
			],
			[ 'g-existing' ]
		);

		// Act
		$result = Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'skip' ] );

		// Assert
		$saved = Global_Classes_Repository::make()->all( true )->get();
		$this->assertArrayHasKey( 'g-existing', $saved['items'] );
		$this->assertEquals( 'Test1', $saved['items']['g-existing']['label'] );
		$this->assertCount( 2, $saved['order'] );

		$labels = array_map( fn( $item ) => $item['label'], $saved['items'] );
		$this->assertContains( 'Test1', $labels );
		$this->assertContains( 'Test2', $labels );
		$this->assertCount( 1, array_keys( $labels, 'Test1' ) );

		$this->assertCount( 1, $result['skipped'] );
		$this->assertEquals( [ 'id' => 'g-123', 'label' => 'Test1' ], $result['skipped'][0]['import_entry'] );

		$this->assertCount( 1, $result['created'] );
		$this->assertEquals( [ 'id' => 'g-456', 'label' => 'Test2' ], $result['created'][0]['import_entry'] );

		$this->assertEmpty( $result['renamed'] );
		$this->assertEmpty( $result['replaced'] );
		$this->assertEmpty( $result['failed'] );
	}

	public function test_replace__overwrites_props_on_label_conflict() {
		// Arrange
		$repository = Global_Classes_Repository::make();
		$repository->put(
			[
				'g-existing' => [
					'id' => 'g-existing',
					'type' => 'class',
					'label' => 'Test1',
					'variants' => [],
				],
			],
			[ 'g-existing' ]
		);

		// Act
		$result = Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'replace' ] );

		// Assert
		$saved = Global_Classes_Repository::make()->all( true )->get();
		$this->assertArrayHasKey( 'g-existing', $saved['items'] );
		$this->assertEquals( 'Test1', $saved['items']['g-existing']['label'] );
		$this->assertNotEmpty( $saved['items']['g-existing']['variants'] );

		$this->assertCount( 1, $result['replaced'] );
		$this->assertEquals( [ 'id' => 'g-123', 'label' => 'Test1' ], $result['replaced'][0]['import_entry'] );
		$this->assertEquals( [ 'id' => 'g-existing', 'label' => 'Test1' ], $result['replaced'][0]['result_entry'] );

		$this->assertCount( 1, $result['created'] );
		$this->assertEquals( [ 'id' => 'g-456', 'label' => 'Test2' ], $result['created'][0]['import_entry'] );

		$this->assertEmpty( $result['renamed'] );
		$this->assertEmpty( $result['skipped'] );
		$this->assertEmpty( $result['failed'] );
	}

	public function test_merge__renames_imported_on_label_conflict() {
		// Arrange
		$repository = Global_Classes_Repository::make();
		$repository->put(
			[
				'g-existing' => [
					'id' => 'g-existing',
					'type' => 'class',
					'label' => 'Test1',
					'variants' => [],
				],
			],
			[ 'g-existing' ]
		);

		// Act
		$result = Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'merge' ] );

		// Assert
		$saved = Global_Classes_Repository::make()->all( true )->get();
		$labels = array_map( fn( $item ) => $item['label'], $saved['items'] );

		$this->assertContains( 'Test1', $labels );
		$this->assertContains( 'Test1_1', $labels );
		$this->assertContains( 'Test2', $labels );
		$this->assertCount( 3, $saved['order'] );

		$this->assertCount( 1, $result['renamed'] );
		$this->assertEquals( [ 'id' => 'g-123', 'label' => 'Test1' ], $result['renamed'][0]['import_entry'] );
		$this->assertEquals( 'Test1_1', $result['renamed'][0]['result_entry']['label'] );

		$this->assertCount( 1, $result['created'] );
		$this->assertEquals( [ 'id' => 'g-456', 'label' => 'Test2' ], $result['created'][0]['import_entry'] );

		$this->assertEmpty( $result['replaced'] );
		$this->assertEmpty( $result['skipped'] );
		$this->assertEmpty( $result['failed'] );
	}

	public function test_override_all__deletes_existing_then_imports() {
		// Arrange
		$repository = Global_Classes_Repository::make();
		$repository->put(
			[
				'g-existing-1' => [
					'id' => 'g-existing-1',
					'type' => 'class',
					'label' => 'OldClass1',
					'variants' => [],
				],
				'g-existing-2' => [
					'id' => 'g-existing-2',
					'type' => 'class',
					'label' => 'OldClass2',
					'variants' => [],
				],
			],
			[ 'g-existing-1', 'g-existing-2' ]
		);

		// Act
		$result = Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'override-all' ] );

		// Assert
		$saved = Global_Classes_Repository::make()->all( true )->get();
		$this->assertArrayNotHasKey( 'g-existing-1', $saved['items'] );
		$this->assertArrayNotHasKey( 'g-existing-2', $saved['items'] );
		$this->assertCount( 2, $saved['items'] );

		$labels = array_map( fn( $item ) => $item['label'], $saved['items'] );
		$this->assertContains( 'Test1', $labels );
		$this->assertContains( 'Test2', $labels );

		$this->assertCount( 2, $result['created'] );
		$this->assertEmpty( $result['renamed'] );
		$this->assertEmpty( $result['replaced'] );
		$this->assertEmpty( $result['skipped'] );
		$this->assertEmpty( $result['failed'] );
	}

	public function test_skip__imports_non_conflicting_items() {
		// Arrange - empty repository

		// Act
		$result = Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'skip' ] );

		// Assert
		$saved = Global_Classes_Repository::make()->all( true )->get();
		$this->assertCount( 2, $saved['items'] );
		$this->assertCount( 2, $saved['order'] );

		$this->assertCount( 2, $result['created'] );
		$this->assertEmpty( $result['skipped'] );
		$this->assertEmpty( $result['renamed'] );
		$this->assertEmpty( $result['replaced'] );
		$this->assertEmpty( $result['failed'] );
	}

	public function test_replace__imports_as_new_when_no_conflict() {
		// Arrange - empty repository

		// Act
		$result = Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'replace' ] );

		// Assert
		$saved = Global_Classes_Repository::make()->all( true )->get();
		$this->assertCount( 2, $saved['items'] );

		$this->assertCount( 2, $result['created'] );
		$this->assertEmpty( $result['replaced'] );
		$this->assertEmpty( $result['skipped'] );
		$this->assertEmpty( $result['renamed'] );
		$this->assertEmpty( $result['failed'] );
	}
}
