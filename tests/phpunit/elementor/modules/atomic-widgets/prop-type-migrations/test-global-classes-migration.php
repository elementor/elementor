<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Re-defining Mock Prop Type for this test file context
class Mock_String_GC_V2_Prop_Type extends String_Prop_Type {
	public static function get_key(): string {
		return 'string_v2';
	}
}

/**
 * @group prop-type-migrations
 */
class Test_Global_Classes_Migration extends Elementor_Test_Base {
	use MatchesSnapshots;

	private string $fixtures_path = __DIR__ . '/fixtures/orchestrator/migrations/';

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		Migrations_Orchestrator::destroy();
	}

	public function setUp(): void {
		parent::setUp();

		$test_name = $this->getName();
		$tests_needing_migration_schema = [
			'test_global_classes_migration_performs_update',
			'test_global_classes_migration_skips_malformed_items',
		];

		if ( in_array( $test_name, $tests_needing_migration_schema, true ) ) {
			add_filter( 'elementor/atomic-widgets/styles/schema', [ $this, 'add_title_prop_to_style_schema' ], 999999 );
		}
	}

	public function tearDown(): void {
		remove_filter( 'elementor/atomic-widgets/styles/schema', [ $this, 'add_title_prop_to_style_schema' ], 999999 );
		Migrations_Orchestrator::destroy();
		parent::tearDown();
	}

	public function add_title_prop_to_style_schema(): array {
		return [ 'title' => Mock_String_GC_V2_Prop_Type::make() ];
	}

	public function test_no_migration_needed_validation_passes() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );
		$post_id = 1001;

		$global_classes_data = [
			'items' => [
				[
					'id' => 'gc_1',
					'title' => 'My Class',
					'props' => [
						'css_prop' => [
							'$$type' => 'string',
							'value' => 'pretty style',
						],
					],
				],
			],
			'order' => ['gc_1'],
		];

		$schema = [
			'css_prop' => String_Prop_Type::make(),
		];

		$save_callback_called = false;
		$save_callback = function( $data ) use ( &$save_callback_called ) {
			$save_callback_called = true;
		};

		// Act
		$orchestrator->migrate_global_classes( $global_classes_data, $post_id, $save_callback, $schema );

		// Assert
		$this->assertFalse( $save_callback_called, 'Save callback should not be called when no changes are needed' );
		$this->assertEquals( 'Hello', $global_classes_data['items'][0]['props']['title']['value'] );
	}

	public function test_global_classes_migration_performs_update() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );
		$post_id = 1002;

		$global_classes_data = [
			'items' => [
				[
					'id' => 'gc_1',
					'title' => 'Migrate Me',
					'props' => [
						'css_prop' => [
							'$$type' => 'string',
							'value' => 'Old Value',
						],
					],
				],
			],
			'order' => ['gc_1'],
		];

		// We use Mock_String_GC_V2_Prop_Type which corresponds to 'string_v2'
		// The manifest has a migration 'string-to-string_v2'
		$schema = [
			'css_prop' => Mock_String_GC_V2_Prop_Type::make(),
		];

		$save_callback_called = false;
		$migrated_data_result = null;
		$save_callback = function( $data ) use ( &$save_callback_called, &$migrated_data_result ) {
			$save_callback_called = true;
			$migrated_data_result = $data;
		};

		// Act
		$orchestrator->migrate_global_classes( $global_classes_data, $post_id, $save_callback, $schema );

		// Assert
		$this->assertTrue( $save_callback_called, 'Save callback should be called when migration occurs' );
		
		$migrated_prop = $global_classes_data['items'][0]['props']['title'];
		$this->assertEquals( 'string_v2', $migrated_prop['$$type'], 'Type should be updated to string_v2' );
		// The migration string-to-string_v2.json usually sets/updates value or keeps it. 
		// Assuming the migration just changes type or keeps value. 
		// Let's verify against snapshot to be sure of the transformation outcome.
		$this->assertMatchesJsonSnapshot( $global_classes_data );
	}

	public function test_global_classes_migration_skips_malformed_items() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( $this->fixtures_path );
		$post_id = 1003;

		$global_classes_data = [
			'items' => [
				[
					'id' => 'gc_1',
					// No props key
					'title' => 'Broken Item',
				],
				[
					'id' => 'gc_2',
					'props' => [
						'css_prop' => [
							'$$type' => 'string',
							'value' => 'Valid',
						],
					],
				],
			],
			'order' => ['gc_1', 'gc_2'],
		];

		$schema = [
			'css_prop' => Mock_String_GC_V2_Prop_Type::make(),
		];

		$save_callback_called = false;
		$save_callback = function( $data ) use ( &$save_callback_called ) {
			$save_callback_called = true;
		};

		// Act
		$orchestrator->migrate_global_classes( $global_classes_data, $post_id, $save_callback, $schema );

		// Assert
		$this->assertTrue( $save_callback_called, 'Should still migrate valid items even if some are malformed' );
		$this->assertEquals( 'string_v2', $global_classes_data['items'][1]['props']['title']['$$type'] );
	}
}
