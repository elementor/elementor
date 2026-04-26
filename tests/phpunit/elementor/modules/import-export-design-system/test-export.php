<?php

namespace Elementor\Testing\Modules\ImportExportDesignSystem;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\ImportExportDesignSystem\Processes\Export;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use ZipArchive;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Export extends Elementor_Test_Base {

	public function test_export__returns_manifest_and_base64_zip() {
		// Arrange.
		$classes = [
			'g-123' => [
				'id' => 'g-123',
				'type' => 'class',
				'label' => 'TestClass',
				'variants' => [],
			],
		];
		$classes_order = [ 'g-123' ];

		Global_Classes_Repository::make()->put( $classes, $classes_order );

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$repo = new Variables_Repository( $kit );
		$collection = Variables_Collection::default();
		$collection->add_variable( Variable::create_new( [
			'id' => 'e-gv-test',
			'type' => 'color',
			'label' => 'TestVar',
			'value' => '#ff0000',
			'order' => 1,
		] ) );
		$repo->save( $collection );

		// Act.
		$result = ( new Export() )->run();

		// Assert.
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'manifest', $result );
		$this->assertArrayHasKey( 'file', $result );

		$manifest = $result['manifest'];
		$this->assertSame( 'design-system', $manifest['name'] );
		$this->assertSame( 1, $manifest['classesCount'] );
		$this->assertSame( 1, $manifest['variablesCount'] );
		$this->assertSame( ELEMENTOR_VERSION, $manifest['elementor_version'] );

		$zip_content = base64_decode( $result['file'] );
		$this->assertNotFalse( $zip_content );
	}

	public function test_export__zip_contains_correct_files() {
		// Arrange.
		$classes = [
			'g-123' => [
				'id' => 'g-123',
				'type' => 'class',
				'label' => 'TestClass',
				'variants' => [],
			],
		];

		Global_Classes_Repository::make()->put( $classes, [ 'g-123' ] );

		// Act.
		$result = ( new Export() )->run();

		// Assert.
		$temp_file = wp_tempnam( 'export-test' );
		file_put_contents( $temp_file, base64_decode( $result['file'] ) );

		$zip = new ZipArchive();
		$zip->open( $temp_file );

		$this->assertNotFalse( $zip->locateName( 'manifest.json' ) );
		$this->assertNotFalse( $zip->locateName( 'global-classes.json' ) );
		$this->assertNotFalse( $zip->locateName( 'global-variables.json' ) );

		$manifest_content = $zip->getFromName( 'manifest.json' );
		$manifest = json_decode( $manifest_content, true );
		$this->assertSame( 'design-system', $manifest['name'] );

		$zip->close();
		wp_delete_file( $temp_file );
	}

	public function test_export__empty_design_system() {
		// Arrange.
		Global_Classes_Repository::make()->put( [], [] );

		// Act.
		$result = ( new Export() )->run();

		// Assert.
		$this->assertIsArray( $result );
		$this->assertSame( 0, $result['manifest']['classesCount'] );
		$this->assertSame( 0, $result['manifest']['variablesCount'] );
	}
}
