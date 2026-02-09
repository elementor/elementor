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

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		
		if ( ! defined( 'ELEMENTOR_MIGRATIONS_PATH' ) ) {
			define( 'ELEMENTOR_MIGRATIONS_PATH', __DIR__ . '/fixtures/orchestrator/migrations/' );
		}
		
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
			add_filter( 'elementor/atomic-widgets/styles/schema', [ $this, 'add_css_prop_prop_to_style_schema' ], 999999 );
		}
	}

	public function tearDown(): void {
		remove_filter( 'elementor/atomic-widgets/styles/schema', [ $this, 'add_css_prop_prop_to_style_schema' ], 999999 );
		Migrations_Orchestrator::destroy();
		parent::tearDown();
	}

	public function add_css_prop_prop_to_style_schema(): array {
		return [ 'css_prop' => Mock_String_GC_V2_Prop_Type::make() ];
	}

	public function test_no_migration_needed_validation_passes() {
		$orchestrator = Migrations_Orchestrator::make();
		$post_id = 1001;

		$global_classes_data = [
			'items' => [
				[
					'id' => 'gc_1',
					'title' => 'My Class',
					'props' => [
						'css_prop' => [
							'$$type' => 'string',
							'value' => 'Pretty style',
						],
					],
				],
			],
			'order' => ['gc_1'],
		];

		$save_callback_called = false;
		$save_callback = function( $data ) use ( &$save_callback_called ) {
			$save_callback_called = true;
		};

		$orchestrator->migrate( $global_classes_data, $post_id, $save_callback );

		$this->assertFalse( $save_callback_called, 'Save callback should not be called when no changes are needed' );
		$this->assertEquals( 'Pretty style', $global_classes_data['items'][0]['props']['css_prop']['value'] );
	}

	public function test_global_classes_migration_performs_update() {
		$orchestrator = Migrations_Orchestrator::make();
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

		$save_callback_called = false;
		$migrated_data_result = null;
		$save_callback = function( $data ) use ( &$save_callback_called, &$migrated_data_result ) {
			$save_callback_called = true;
			$migrated_data_result = $data;
		};

		$orchestrator->migrate( $global_classes_data, $post_id, $save_callback );

		$this->assertTrue( $save_callback_called, 'Save callback should be called when migration occurs' );
		
		$migrated_prop = $global_classes_data['items'][0]['props']['css_prop'];
		$this->assertEquals( 'string_v2', $migrated_prop['$$type'], 'Type should be updated to string_v2' );
		$this->assertMatchesJsonSnapshot( $global_classes_data );
	}

	public function test_global_classes_migration_skips_malformed_items() {
		$orchestrator = Migrations_Orchestrator::make();
		$post_id = 1003;

		$global_classes_data = [
			'items' => [
				[
					'id' => 'gc_1',
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

		$save_callback_called = false;
		$save_callback = function( $data ) use ( &$save_callback_called ) {
			$save_callback_called = true;
		};

		$orchestrator->migrate( $global_classes_data, $post_id, $save_callback );

		$this->assertTrue( $save_callback_called, 'Should still migrate valid items even if some are malformed' );
		$this->assertEquals( 'string_v2', $global_classes_data['items'][1]['props']['css_prop']['$$type'] );
	}
}
