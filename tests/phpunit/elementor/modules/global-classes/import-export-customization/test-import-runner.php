<?php

namespace Elementor\Testing\Modules\GlobalClasses\ImportExportCustomization;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners\Import as Import_Runner;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class ç extends Elementor_Test_Base {

	public function test_import() {
		// Act.
		$result = ( new Import_Runner() )->import( [
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
		], [] );

		// Assert.
		$sanitized_items = [
			'g-123' => [
				'id' => 'g-123',
				'type' => 'class',
				'label' => 'Test1',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'color' => [
										'$$type' => 'color',
										'value' => '',
									],
								],
							],
							'display' => [
								'$$type' => 'string',
								'value' => 'block',
							],
						],
						'custom_css' => null,
					],
				],
			],
			'g-456' => [
				'id' => 'g-456',
				'type' => 'class',
				'label' => 'Test2',
				"variants" => [],
			],
		];

		$sanitized_order = [ 'g-123', 'g-456' ];

		$sanitized_global_classes = [
			'items' => $sanitized_items,
			'order' => $sanitized_order,
		];

		$this->assertSame( $sanitized_global_classes, $result );
		$this->assertSame( $sanitized_global_classes, Global_Classes_Repository::make()->all()->get() );
	}

	public function test_import__invalid_style() {
		// Act.
		$result = ( new Import_Runner() )->import( [
			'extracted_directory_path' => __DIR__ . '/mocks/invalid',
		], [] );

		// Assert.
		$saved_global_classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );

		$this->assertSame( [], $result );
		$this->assertSame( [], $saved_global_classes );
	}

	public function test_import__merges_with_previous_kit_classes_after_kit_creation() {
		// Arrange - save classes on the current (soon-to-be previous) kit.
		$existing_classes = [
			'items' => [
				'g-existing' => [
					'id' => 'g-existing',
					'type' => 'class',
					'label' => 'Existing',
					'variants' => [],
				],
			],
			'order' => [ 'g-existing' ],
		];

		$old_kit = Plugin::$instance->kits_manager->get_active_kit();
		$old_kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $existing_classes );

		// Simulate what site-settings runner does: create a new empty active kit.
		$new_kit_id = Plugin::$instance->kits_manager->create_new_kit( 'Imported Kit' );

		// Act - import with imported_data indicating a new kit was created.
		$result = ( new Import_Runner() )->import(
			[ 'extracted_directory_path' => __DIR__ . '/mocks/valid' ],
			[ 'site-settings' => [ 'imported_kit_id' => $new_kit_id ] ]
		);

		// Assert - merged result on the new active kit should contain both existing and imported classes.
		$saved = Global_Classes_Repository::make()->all( true )->get();

		$this->assertArrayHasKey( 'g-existing', $saved['items'] );
		$this->assertArrayHasKey( 'g-123', $saved['items'] );
		$this->assertArrayHasKey( 'g-456', $saved['items'] );
		$this->assertContains( 'g-existing', $saved['order'] );
	}

	public function test_import__merges_with_previous_kit_resolves_label_conflict() {
		// Arrange - save a class with the same label as one being imported.
		$existing_classes = [
			'items' => [
				'g-existing' => [
					'id' => 'g-existing',
					'type' => 'class',
					'label' => 'Test1',
					'variants' => [],
				],
			],
			'order' => [ 'g-existing' ],
		];

		$old_kit = Plugin::$instance->kits_manager->get_active_kit();
		$old_kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $existing_classes );

		$new_kit_id = Plugin::$instance->kits_manager->create_new_kit( 'Imported Kit' );

		// Act.
		( new Import_Runner() )->import(
			[ 'extracted_directory_path' => __DIR__ . '/mocks/valid' ],
			[ 'site-settings' => [ 'imported_kit_id' => $new_kit_id ] ]
		);

		// Assert - existing "Test1" preserved, imported "Test1" gets a suffix.
		$saved = Global_Classes_Repository::make()->all( true )->get();
		$labels = array_map( fn( $item ) => $item['label'], $saved['items'] );

		$this->assertContains( 'Test1', $labels );
		$this->assertContains( 'Test1_1', $labels );
	}
}
