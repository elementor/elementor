<?php

namespace Elementor\Testing\Modules\GlobalClasses\ImportExportCustomization;

use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners\Import as Import_Runner;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Import_Runner extends Elementor_Test_Base {

	private const LEGACY_MANIFEST = [
		'manifest' => [ 'elementor_version' => '4.0.0' ],
	];

	private const STREAMING_MANIFEST = [
		'manifest' => [ 'elementor_version' => '4.1.0' ],
	];

	public function setUp(): void {
		$this->ensure_active_kit_is_valid();

		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();

		$this->reset_global_classes_state();
	}

	/**
	 * The previous test class may have left OPTION_ACTIVE pointing to a kit that was wiped
	 * by WP_UnitTestCase::tear_down_after_class(). create_default_kit() short-circuits when
	 * the option is set, so we must clear the dangling option before parent::setUp() runs.
	 */
	private function ensure_active_kit_is_valid(): void {
		$active_kit_id = (int) get_option( Kits_Manager::OPTION_ACTIVE );

		if ( $active_kit_id && ! get_post( $active_kit_id ) ) {
			delete_option( Kits_Manager::OPTION_ACTIVE );
			delete_option( Kits_Manager::OPTION_PREVIOUS );
		}
	}

	public function tearDown(): void {
		parent::tearDown();

		$this->reset_global_classes_state();
	}

	private function reset_global_classes_state(): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
			$kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
			$kit->delete_meta( Global_Classes_Labels::META_KEY_FRONTEND );
			$kit->delete_meta( Global_Classes_Labels::META_KEY_PREVIEW );
			$kit->delete_meta( Global_Classes_Order::META_KEY );
		}

		$post_ids = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'any',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] );

		foreach ( $post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}
	}

	/**
	 * Tests that call create_new_kit() switch OPTION_ACTIVE to a fresh kit. After the class
	 * finishes, _delete_all_data() wipes that kit's post but the option still points at the
	 * deleted ID. The next test class's setUp short-circuits create_default_kit() because
	 * OPTION_ACTIVE is still set, leaving the active kit unresolvable. Reset the options here
	 * so create_default_kit() will provision a fresh default kit for the next test class.
	 */
	public static function tearDownAfterClass(): void {
		delete_option( Kits_Manager::OPTION_ACTIVE );
		delete_option( Kits_Manager::OPTION_PREVIOUS );

		parent::tearDownAfterClass();
	}

	public function test_import() {
		// Act.
		$result = ( new Import_Runner() )->import( array_merge( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
		], self::LEGACY_MANIFEST ), [] );

		// Assert - new result shape.
		$this->assertCount( 2, $result['created'] );
		$this->assertEmpty( $result['renamed'] );
		$this->assertEmpty( $result['replaced'] );
		$this->assertEmpty( $result['skipped'] );
		$this->assertEmpty( $result['failed'] );

		$created_ids = array_map( fn( $entry ) => $entry['result_entry']['id'], $result['created'] );
		$this->assertContains( 'g-123', $created_ids );
		$this->assertContains( 'g-456', $created_ids );

		// Assert - repository contains the fully sanitized classes (variants, props, meta) end-to-end.
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
				'variants' => [],
			],
		];

		$sanitized_global_classes = [
			'items' => $sanitized_items,
			'order' => [ 'g-123', 'g-456' ],
		];

		$this->assertEquals( $sanitized_global_classes, Global_Classes_Repository::make()->all()->get() );
	}

	public function test_import__invalid_style() {
		// Assert - invalid style data throws during parsing.
		$this->expectException( \Exception::class );

		// Act.
		( new Import_Runner() )->import( array_merge( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/invalid',
		], self::LEGACY_MANIFEST ), [] );
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
		Global_Classes_Repository::make( $old_kit )->put(
			$existing_classes['items'],
			$existing_classes['order']
		);

		// Simulate what site-settings runner does: create a new empty active kit.
		$new_kit_id = Plugin::$instance->kits_manager->create_new_kit( 'Imported Kit' );

		// Act - import with imported_data indicating a new kit was created.
		( new Import_Runner() )->import(
			array_merge( [
				'include' => [ 'settings' ],
				'extracted_directory_path' => __DIR__ . '/mocks/valid',
			], self::LEGACY_MANIFEST ),
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
		Global_Classes_Repository::make( $old_kit )->put(
			$existing_classes['items'],
			$existing_classes['order']
		);

		$new_kit_id = Plugin::$instance->kits_manager->create_new_kit( 'Imported Kit' );

		// Act.
		( new Import_Runner() )->import(
			array_merge( [
				'include' => [ 'settings' ],
				'extracted_directory_path' => __DIR__ . '/mocks/valid',
			], self::LEGACY_MANIFEST ),
			[ 'site-settings' => [ 'imported_kit_id' => $new_kit_id ] ]
		);

		// Assert - existing "Test1" preserved, imported "Test1" gets a suffix.
		$saved = Global_Classes_Repository::make()->all( true )->get();
		$labels = array_map( fn( $item ) => $item['label'], $saved['items'] );

		$this->assertContains( 'Test1', $labels );
		$this->assertContains( 'Test1_1', $labels );
	}

	public function test_import__directory_format__uses_streaming_path_and_imports_into_repository() {
		// Act - manifest 4.1.0+ triggers directory-based streaming format.
		$result = ( new Import_Runner() )->import( array_merge( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/streaming',
		], self::STREAMING_MANIFEST ), [] );

		// Assert - new result shape with both classes created.
		$this->assertCount( 2, $result['created'] );
		$this->assertEmpty( $result['skipped'] );
		$this->assertEmpty( $result['renamed'] );
		$this->assertEmpty( $result['replaced'] );
		$this->assertEmpty( $result['failed'] );

		$created_import_ids = array_map( fn( $entry ) => $entry['import_entry']['id'], $result['created'] );
		$this->assertContains( 'g-123', $created_import_ids );
		$this->assertContains( 'g-456', $created_import_ids );

		// Assert - repository contains both with their label and variant data.
		$saved = Global_Classes_Repository::make()->all( true )->get();
		$this->assertArrayHasKey( 'g-123', $saved['items'] );
		$this->assertArrayHasKey( 'g-456', $saved['items'] );
		$this->assertEquals( 'Test1', $saved['items']['g-123']['label'] );
		$this->assertNotEmpty( $saved['items']['g-123']['variants'] );
		$this->assertEquals( 'Test2', $saved['items']['g-456']['label'] );
	}

	public function test_import__directory_format__design_system_merge_renames_label_conflict() {
		// Arrange - existing class with same label as one being imported.
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

		// Act - design-system flow with 'merge' conflict resolution.
		$result = ( new Import_Runner() )->import( array_merge( [
			'include' => [ 'design-system' ],
			'extracted_directory_path' => __DIR__ . '/mocks/streaming',
			'customization' => [
				'design-system' => [ 'conflict_resolution' => 'merge' ],
			],
		], self::STREAMING_MANIFEST ), [] );

		// Assert - 'Test1' renamed, 'Test2' created as new.
		$this->assertCount( 1, $result['renamed'] );
		$this->assertEquals( 'Test1_1', $result['renamed'][0]['result_entry']['label'] );
		$this->assertCount( 1, $result['created'] );

		$saved = Global_Classes_Repository::make()->all( true )->get();
		$labels = array_map( fn( $item ) => $item['label'], $saved['items'] );
		$this->assertContains( 'Test1', $labels );
		$this->assertContains( 'Test1_1', $labels );
		$this->assertContains( 'Test2', $labels );
	}

	public function test_import__directory_format__design_system_override_all_replaces_existing() {
		// Arrange - existing classes that should be removed.
		$repository = Global_Classes_Repository::make();
		$repository->put(
			[
				'g-old' => [
					'id' => 'g-old',
					'type' => 'class',
					'label' => 'OldClass',
					'variants' => [],
				],
			],
			[ 'g-old' ]
		);

		// Act - design-system flow with 'override-all' conflict resolution.
		$result = ( new Import_Runner() )->import( array_merge( [
			'include' => [ 'design-system' ],
			'extracted_directory_path' => __DIR__ . '/mocks/streaming',
			'customization' => [
				'design-system' => [ 'conflict_resolution' => 'override-all' ],
			],
		], self::STREAMING_MANIFEST ), [] );

		// Assert - existing class removed, only imported classes remain.
		$this->assertCount( 2, $result['created'] );

		$saved = Global_Classes_Repository::make()->all( true )->get();
		$this->assertArrayNotHasKey( 'g-old', $saved['items'] );
		$this->assertArrayHasKey( 'g-123', $saved['items'] );
		$this->assertArrayHasKey( 'g-456', $saved['items'] );
	}
}
