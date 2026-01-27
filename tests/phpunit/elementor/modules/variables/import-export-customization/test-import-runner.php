<?php

namespace Elementor\Testing\Modules\Variables\ImportExportCustomization;

use Elementor\Modules\Variables\ImportExportCustomization\Runners\Import as Import_Runner;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Import_Runner extends Elementor_Test_Base {
	private const VARIABLES_META_KEY = '_elementor_global_variables';

	public function setUp(): void {
		parent::setUp();

		$this->clear_variables();
	}

	public function tearDown(): void {
		$this->clear_variables();

		parent::tearDown();
	}

	private function clear_variables(): void {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		if ( $kit ) {
			$kit->update_json_meta( self::VARIABLES_META_KEY, [] );
		}
	}

	public function test_import__valid_data() {
		// Act.
		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
		], [] );

		// Assert.
		$this->assertArrayHasKey( 'data', $result );
		$this->assertArrayHasKey( 'e-gv-123', $result['data'] );
		$this->assertArrayHasKey( 'e-gv-456', $result['data'] );
		$this->assertEquals( 'Primary Color', $result['data']['e-gv-123']['label'] );
		$this->assertEquals( 'Primary Font', $result['data']['e-gv-456']['label'] );

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$repository = new Variables_Repository( $kit );
		$collection = $repository->load();

		$this->assertCount( 2, $collection->all() );
		$this->assertEquals( 'Primary Color', $collection->get( 'e-gv-123' )->label() );
		$this->assertEquals( 'Primary Font', $collection->get( 'e-gv-456' )->label() );
	}

	public function test_import__invalid_data_missing_required_fields() {
		// Assert - Variable::from_array() throws InvalidArgumentException on missing fields.
		$this->expectException( \InvalidArgumentException::class );

		// Act.
		( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/invalid',
		], [] );
	}

	public function test_import__empty_data() {
		// Act.
		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/empty',
		], [] );

		// Assert.
		$this->assertSame( [], $result );

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$saved = $kit->get_json_meta( self::VARIABLES_META_KEY );

		$this->assertEmpty( $saved );
	}

	public function test_import__missing_file() {
		// Act.
		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/nonexistent',
		], [] );

		// Assert.
		$this->assertSame( [], $result );
	}

	public function test_import__skips_deleted_variables() {
		// Act.
		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/with-deleted',
		], [] );

		// Assert - only non-deleted variable should be in the collection.
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$repository = new Variables_Repository( $kit );
		$collection = $repository->load();

		$active_count = 0;
		foreach ( $collection->all() as $variable ) {
			if ( ! $variable->is_deleted() ) {
				$active_count++;
			}
		}

		$this->assertEquals( 1, $active_count );
	}

	public function test_import__merge_with_existing_variables() {
		// Arrange - create existing variables.
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$repository = new Variables_Repository( $kit );

		$existing_data = [
			'data' => [
				'e-gv-existing' => [
					'type' => 'color',
					'label' => 'Existing Color',
					'value' => '#000000',
					'order' => 1,
				],
			],
			'watermark' => 1,
			'version' => 1,
		];

		$collection = Variables_Collection::hydrate( $existing_data );
		$repository->save( $collection );

		// Act.
		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
		], [] );

		// Assert - should have merged (3 variables total).
		$updated_collection = $repository->load();

		$this->assertCount( 3, $updated_collection->all() );
		$this->assertNotNull( $updated_collection->get( 'e-gv-existing' ) );
	}

	public function test_import__label_conflict_resolution() {
		// Arrange - create existing variable with same label.
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$repository = new Variables_Repository( $kit );

		$existing_data = [
			'data' => [
				'e-gv-existing' => [
					'type' => 'color',
					'label' => 'Primary Color', // Same label as in valid mock.
					'value' => '#000000',
					'order' => 1,
				],
			],
			'watermark' => 1,
			'version' => 1,
		];

		$collection = Variables_Collection::hydrate( $existing_data );
		$repository->save( $collection );

		// Act.
		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
		], [] );

		// Assert - imported "Primary Color" should be renamed to "Primary Color_1".
		$updated_collection = $repository->load();

		$labels = [];
		foreach ( $updated_collection->all() as $variable ) {
			$labels[] = $variable->label();
		}

		$this->assertContains( 'Primary Color', $labels );
		$this->assertContains( 'Primary Color_1', $labels );
	}

	public function test_import__id_conflict_generates_new_id() {
		// Arrange - create existing variable with same ID.
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$repository = new Variables_Repository( $kit );

		$existing_data = [
			'data' => [
				'e-gv-123' => [ // Same ID as in valid mock.
					'type' => 'color',
					'label' => 'Existing Color',
					'value' => '#000000',
					'order' => 1,
				],
			],
			'watermark' => 1,
			'version' => 1,
		];

		$collection = Variables_Collection::hydrate( $existing_data );
		$repository->save( $collection );

		// Act.
		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
		], [] );

		// Assert - should have 3 variables, each with unique ID.
		$updated_collection = $repository->load();
		$all_ids = array_keys( $updated_collection->all() );

		$this->assertCount( 3, $all_ids );
		$this->assertCount( 3, array_unique( $all_ids ) ); // All IDs are unique.
	}

	public function test_import__override_all_replaces_existing() {
		// Arrange - create existing variables.
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$repository = new Variables_Repository( $kit );

		$existing_data = [
			'data' => [
				'e-gv-existing-1' => [
					'type' => 'color',
					'label' => 'Old Color 1',
					'value' => '#111111',
					'order' => 1,
				],
				'e-gv-existing-2' => [
					'type' => 'color',
					'label' => 'Old Color 2',
					'value' => '#222222',
					'order' => 2,
				],
			],
			'watermark' => 1,
			'version' => 1,
		];

		$collection = Variables_Collection::hydrate( $existing_data );
		$repository->save( $collection );

		// Act - import with override all.
		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
			'customization' => [
				'settings' => [
					'variablesOverrideAll' => true,
				],
			],
		], [] );

		// Assert - only imported variables remain.
		$updated_collection = $repository->load();

		$this->assertCount( 2, $updated_collection->all() );
		$this->assertNull( $updated_collection->get( 'e-gv-existing-1' ) );
		$this->assertNull( $updated_collection->get( 'e-gv-existing-2' ) );
		$this->assertNotNull( $updated_collection->get( 'e-gv-123' ) );
		$this->assertNotNull( $updated_collection->get( 'e-gv-456' ) );
	}

	public function test_import__disabled_via_customization() {
		// Act - import with variables disabled.
		$runner = new Import_Runner();

		$should_import = $runner->should_import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
			'customization' => [
				'settings' => [
					'variables' => false,
				],
			],
		] );

		// Assert.
		$this->assertFalse( $should_import );
	}

	public function test_import__enabled_by_default() {
		// Act.
		$runner = new Import_Runner();

		$should_import = $runner->should_import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
		] );

		// Assert.
		$this->assertTrue( $should_import );
	}

	public function test_import__preserves_original_id_when_no_conflict() {
		// Arrange - empty existing variables.
		$this->clear_variables();

		// Act.
		$result = ( new Import_Runner() )->import( [
			'include' => [ 'settings' ],
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
		], [] );

		// Assert - original IDs should be preserved.
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$repository = new Variables_Repository( $kit );
		$collection = $repository->load();

		$this->assertNotNull( $collection->get( 'e-gv-123' ) );
		$this->assertNotNull( $collection->get( 'e-gv-456' ) );
	}

	public function test_should_import__returns_false_when_settings_not_included() {
		// Act.
		$runner = new Import_Runner();

		$should_import = $runner->should_import( [
			'include' => [ 'templates' ], // settings not included.
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
		] );

		// Assert.
		$this->assertFalse( $should_import );
	}

	public function test_should_import__returns_false_when_no_extracted_path() {
		// Act.
		$runner = new Import_Runner();

		$should_import = $runner->should_import( [
			'include' => [ 'settings' ],
			// extracted_directory_path not provided.
		] );

		// Assert.
		$this->assertFalse( $should_import );
	}

	public function test_get_name() {
		// Act.
		$name = Import_Runner::get_name();

		// Assert.
		$this->assertEquals( 'global-variables', $name );
	}
}
