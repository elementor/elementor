<?php

namespace Elementor\Testing\Modules\ImportExportDesignSystem;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\ImportExportDesignSystem\Processes\Export;
use Elementor\Modules\ImportExportDesignSystem\Processes\Import;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use ZipArchive;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Import extends Elementor_Test_Base {

	private function create_design_system_zip( array $manifest, array $classes, array $variables ): string {
		$temp_file = wp_tempnam( 'design-system-test' );

		$zip = new ZipArchive();
		$zip->open( $temp_file, ZipArchive::CREATE | ZipArchive::OVERWRITE );

		$zip->addFromString( 'manifest.json', wp_json_encode( $manifest ) );
		$zip->addFromString( 'global-classes.json', wp_json_encode( $classes ) );
		$zip->addFromString( 'global-variables.json', wp_json_encode( $variables ) );

		$zip->close();

		return $temp_file;
	}

	public function test_import__basic_import_with_skip_resolution() {
		// Arrange.
		$manifest = [
			'name' => 'design-system',
			'version' => '3.0',
			'classesCount' => 1,
			'variablesCount' => 1,
		];

		$classes = [
			'items' => [
				'g-123' => [
					'id' => 'g-123',
					'type' => 'class',
					'label' => 'ImportedClass',
					'variants' => [],
				],
			],
			'order' => [ 'g-123' ],
		];

		$variables = [
			'data' => [
				'e-gv-test' => [
					'type' => 'color',
					'label' => 'ImportedVar',
					'value' => '#00ff00',
					'order' => 1,
				],
			],
			'watermark' => 1,
			'version' => 1,
		];

		$zip_path = $this->create_design_system_zip( $manifest, $classes, $variables );

		// Act.
		$import = new Import( $zip_path, 'skip' );
		$result = $import->run();

		// Assert.
		$this->assertIsArray( $result );
		$this->assertSame( 1, $result['classesImported'] );
		$this->assertSame( 1, $result['variablesImported'] );
		$this->assertEmpty( $result['classesSkipped'] );
		$this->assertEmpty( $result['variablesSkipped'] );

		$saved_classes = Global_Classes_Repository::make()->all()->get();
		$this->assertArrayHasKey( 'g-123', $saved_classes['items'] );

		wp_delete_file( $zip_path );
	}

	public function test_import__conflict_resolution_skip() {
		// Arrange - create existing class with same label.
		$existing_classes = [
			'g-existing' => [
				'id' => 'g-existing',
				'type' => 'class',
				'label' => 'ConflictClass',
				'variants' => [],
			],
		];
		Global_Classes_Repository::make()->put( $existing_classes, [ 'g-existing' ] );

		$manifest = [ 'name' => 'design-system', 'version' => '3.0' ];
		$classes = [
			'items' => [
				'g-new' => [
					'id' => 'g-new',
					'type' => 'class',
					'label' => 'ConflictClass',
					'variants' => [],
				],
			],
			'order' => [ 'g-new' ],
		];
		$variables = [ 'data' => [], 'watermark' => 0, 'version' => 1 ];

		$zip_path = $this->create_design_system_zip( $manifest, $classes, $variables );

		// Act.
		$import = new Import( $zip_path, 'skip' );
		$result = $import->run();

		// Assert.
		$this->assertSame( 0, $result['classesImported'] );

		$saved_classes = Global_Classes_Repository::make()->all()->get();
		$this->assertCount( 1, $saved_classes['items'] );
		$this->assertArrayHasKey( 'g-existing', $saved_classes['items'] );

		wp_delete_file( $zip_path );
	}

	public function test_import__conflict_resolution_replace() {
		// Arrange - create existing class with same label.
		$existing_classes = [
			'g-existing' => [
				'id' => 'g-existing',
				'type' => 'class',
				'label' => 'ConflictClass',
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [],
					],
				],
			],
		];
		Global_Classes_Repository::make()->put( $existing_classes, [ 'g-existing' ] );

		$manifest = [ 'name' => 'design-system', 'version' => '3.0' ];
		$classes = [
			'items' => [
				'g-new' => [
					'id' => 'g-new',
					'type' => 'class',
					'label' => 'ConflictClass',
					'variants' => [
						[
							'meta' => [ 'breakpoint' => 'mobile', 'state' => null ],
							'props' => [
								'display' => [
									'$$type' => 'string',
									'value' => 'flex',
								],
							],
						],
					],
				],
			],
			'order' => [ 'g-new' ],
		];
		$variables = [ 'data' => [], 'watermark' => 0, 'version' => 1 ];

		$zip_path = $this->create_design_system_zip( $manifest, $classes, $variables );

		// Act.
		$import = new Import( $zip_path, 'replace' );
		$result = $import->run();

		// Assert.
		$this->assertSame( 1, $result['classesImported'] );

		$saved_classes = Global_Classes_Repository::make()->all()->get();
		$this->assertCount( 1, $saved_classes['items'] );
		$this->assertArrayHasKey( 'g-existing', $saved_classes['items'] );
		$this->assertSame( 'mobile', $saved_classes['items']['g-existing']['variants'][0]['meta']['breakpoint'] );

		wp_delete_file( $zip_path );
	}

	public function test_import__malformed_class_is_skipped() {
		// Arrange.
		$manifest = [ 'name' => 'design-system', 'version' => '3.0' ];
		$classes = [
			'items' => [
				'g-valid' => [
					'id' => 'g-valid',
					'type' => 'class',
					'label' => 'ValidClass',
					'variants' => [],
				],
				'g-invalid' => [
					'id' => 'g-invalid',
				],
			],
			'order' => [ 'g-valid', 'g-invalid' ],
		];
		$variables = [ 'data' => [], 'watermark' => 0, 'version' => 1 ];

		$zip_path = $this->create_design_system_zip( $manifest, $classes, $variables );

		// Act.
		$import = new Import( $zip_path, 'skip' );
		$result = $import->run();

		// Assert.
		$this->assertSame( 1, $result['classesImported'] );
		$this->assertCount( 1, $result['classesSkipped'] );
		$this->assertSame( 'malformed', $result['classesSkipped'][0]['reason'] );

		wp_delete_file( $zip_path );
	}

	public function test_import__duplicate_labels_in_file_last_wins() {
		// Arrange.
		$manifest = [ 'name' => 'design-system', 'version' => '3.0' ];
		$classes = [
			'items' => [
				'g-first' => [
					'id' => 'g-first',
					'type' => 'class',
					'label' => 'DuplicateLabel',
					'variants' => [],
				],
				'g-second' => [
					'id' => 'g-second',
					'type' => 'class',
					'label' => 'DuplicateLabel',
					'variants' => [],
				],
			],
			'order' => [ 'g-first', 'g-second' ],
		];
		$variables = [ 'data' => [], 'watermark' => 0, 'version' => 1 ];

		$zip_path = $this->create_design_system_zip( $manifest, $classes, $variables );

		// Act.
		$import = new Import( $zip_path, 'skip' );
		$result = $import->run();

		// Assert.
		$this->assertSame( 1, $result['classesImported'] );

		$saved_classes = Global_Classes_Repository::make()->all()->get();
		$this->assertCount( 1, $saved_classes['items'] );

		wp_delete_file( $zip_path );
	}

	public function test_import__duplicate_id_gets_new_id() {
		// Arrange - create existing class with same ID.
		$existing_classes = [
			'g-123' => [
				'id' => 'g-123',
				'type' => 'class',
				'label' => 'ExistingClass',
				'variants' => [],
			],
		];
		Global_Classes_Repository::make()->put( $existing_classes, [ 'g-123' ] );

		$manifest = [ 'name' => 'design-system', 'version' => '3.0' ];
		$classes = [
			'items' => [
				'g-123' => [
					'id' => 'g-123',
					'type' => 'class',
					'label' => 'ImportedClass',
					'variants' => [],
				],
			],
			'order' => [ 'g-123' ],
		];
		$variables = [ 'data' => [], 'watermark' => 0, 'version' => 1 ];

		$zip_path = $this->create_design_system_zip( $manifest, $classes, $variables );

		// Act.
		$import = new Import( $zip_path, 'skip' );
		$result = $import->run();

		// Assert.
		$this->assertSame( 1, $result['classesImported'] );

		$saved_classes = Global_Classes_Repository::make()->all()->get();
		$this->assertCount( 2, $saved_classes['items'] );

		$labels = array_column( $saved_classes['items'], 'label' );
		$this->assertContains( 'ExistingClass', $labels );
		$this->assertContains( 'ImportedClass', $labels );

		wp_delete_file( $zip_path );
	}

	public function test_import__invalid_zip_returns_error() {
		// Arrange.
		$temp_file = wp_tempnam( 'invalid-zip' );
		file_put_contents( $temp_file, 'not a valid zip file' );

		// Act.
		$import = new Import( $temp_file, 'skip' );
		$result = $import->run();

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid-zip-file', $result->get_error_code() );

		wp_delete_file( $temp_file );
	}

	public function test_import__missing_manifest_returns_error() {
		// Arrange.
		$temp_file = wp_tempnam( 'no-manifest' );
		$zip = new ZipArchive();
		$zip->open( $temp_file, ZipArchive::CREATE | ZipArchive::OVERWRITE );
		$zip->addFromString( 'global-classes.json', '{}' );
		$zip->close();

		// Act.
		$import = new Import( $temp_file, 'skip' );
		$result = $import->run();

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid-design-system-structure', $result->get_error_code() );

		wp_delete_file( $temp_file );
	}

	public function test_import__missing_both_data_files_returns_error() {
		// Arrange.
		$temp_file = wp_tempnam( 'no-data-files' );
		$zip = new ZipArchive();
		$zip->open( $temp_file, ZipArchive::CREATE | ZipArchive::OVERWRITE );
		$zip->addFromString( 'manifest.json', '{"name": "design-system"}' );
		$zip->close();

		// Act.
		$import = new Import( $temp_file, 'skip' );
		$result = $import->run();

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid-design-system-structure', $result->get_error_code() );

		wp_delete_file( $temp_file );
	}

	public function test_import__classes_limit_reached() {
		// Arrange - fill up to limit.
		$existing_items = [];
		$existing_order = [];

		for ( $i = 0; $i < 99; $i++ ) {
			$id = "g-existing-$i";
			$existing_items[ $id ] = [
				'id' => $id,
				'type' => 'class',
				'label' => "Existing$i",
				'variants' => [],
			];
			$existing_order[] = $id;
		}

		Global_Classes_Repository::make()->put( $existing_items, $existing_order );

		$manifest = [ 'name' => 'design-system', 'version' => '3.0' ];
		$classes = [
			'items' => [
				'g-new1' => [
					'id' => 'g-new1',
					'type' => 'class',
					'label' => 'NewClass1',
					'variants' => [],
				],
				'g-new2' => [
					'id' => 'g-new2',
					'type' => 'class',
					'label' => 'NewClass2',
					'variants' => [],
				],
			],
			'order' => [ 'g-new1', 'g-new2' ],
		];
		$variables = [ 'data' => [], 'watermark' => 0, 'version' => 1 ];

		$zip_path = $this->create_design_system_zip( $manifest, $classes, $variables );

		// Act.
		$import = new Import( $zip_path, 'skip' );
		$result = $import->run();

		// Assert.
		$this->assertSame( 1, $result['classesImported'] );
		$this->assertCount( 1, $result['classesSkipped'] );
		$this->assertSame( 'limit_reached', $result['classesSkipped'][0]['reason'] );

		wp_delete_file( $zip_path );
	}

	public function test_import__override_does_not_count_towards_limit() {
		// Arrange - fill up to limit.
		$existing_items = [];
		$existing_order = [];

		for ( $i = 0; $i < 100; $i++ ) {
			$id = "g-existing-$i";
			$existing_items[ $id ] = [
				'id' => $id,
				'type' => 'class',
				'label' => "Existing$i",
				'variants' => [],
			];
			$existing_order[] = $id;
		}

		Global_Classes_Repository::make()->put( $existing_items, $existing_order );

		$manifest = [ 'name' => 'design-system', 'version' => '3.0' ];
		$classes = [
			'items' => [
				'g-override' => [
					'id' => 'g-override',
					'type' => 'class',
					'label' => 'Existing50',
					'variants' => [
						[
							'meta' => [ 'breakpoint' => 'tablet', 'state' => null ],
							'props' => [],
						],
					],
				],
			],
			'order' => [ 'g-override' ],
		];
		$variables = [ 'data' => [], 'watermark' => 0, 'version' => 1 ];

		$zip_path = $this->create_design_system_zip( $manifest, $classes, $variables );

		// Act.
		$import = new Import( $zip_path, 'replace' );
		$result = $import->run();

		// Assert.
		$this->assertSame( 1, $result['classesImported'] );
		$this->assertEmpty( $result['classesSkipped'] );

		wp_delete_file( $zip_path );
	}

	public function test_import__malformed_variable_is_skipped() {
		// Arrange.
		$manifest = [ 'name' => 'design-system', 'version' => '3.0' ];
		$classes = [ 'items' => [], 'order' => [] ];
		$variables = [
			'data' => [
				'e-gv-valid' => [
					'type' => 'color',
					'label' => 'ValidVar',
					'value' => '#000000',
					'order' => 1,
				],
				'e-gv-invalid' => [
					'label' => 'InvalidVar',
				],
			],
			'watermark' => 0,
			'version' => 1,
		];

		$zip_path = $this->create_design_system_zip( $manifest, $classes, $variables );

		// Act.
		$import = new Import( $zip_path, 'skip' );
		$result = $import->run();

		// Assert.
		$this->assertSame( 1, $result['variablesImported'] );
		$this->assertCount( 1, $result['variablesSkipped'] );
		$this->assertSame( 'malformed', $result['variablesSkipped'][0]['reason'] );

		wp_delete_file( $zip_path );
	}
}
