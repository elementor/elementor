<?php

namespace Elementor\Testing\Modules\GlobalClasses\ImportExportCustomization;

use Elementor\Core\Kits\Manager as Kits_Manager;
use Elementor\Modules\DesignSystemSync\Classes\Global_Classes_Sync_Map;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExportUtils\Import_Utils;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Import_Utils_Sync_Map extends Elementor_Test_Base {

	private string $mock_dir;

	public function setUp(): void {
		$this->ensure_active_kit_is_valid();

		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();
		$this->mock_dir = __DIR__ . '/mocks/streaming/global-classes-sync';
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

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			$kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
			$kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
			$kit->delete_meta( Global_Classes_Labels::META_KEY_FRONTEND );
			$kit->delete_meta( Global_Classes_Labels::META_KEY_PREVIEW );
			$kit->delete_meta( Global_Classes_Order::META_KEY );
			$kit->delete_meta( Global_Classes_Order::META_KEY_PREVIEW );
			$kit->delete_meta( Global_Classes_Sync_Map::META_KEY );
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

	public static function tearDownAfterClass(): void {
		delete_option( Kits_Manager::OPTION_ACTIVE );
		delete_option( Kits_Manager::OPTION_PREVIOUS );

		parent::tearDownAfterClass();
	}

	private function seed_existing_class( string $id, string $label, bool $sync_to_v3 ): void {
		$item = [
			'id' => $id,
			'type' => 'class',
			'label' => $label,
			'variants' => [],
		];

		if ( $sync_to_v3 ) {
			$item['sync_to_v3'] = true;
		}

		Global_Classes_Repository::make()->put( [ $id => $item ], [ $id ] );
	}

	private function get_synced_ids(): array {
		$ids = Global_Classes_Sync_Map::make( Plugin::$instance->kits_manager->get_active_kit() )->get_synced_ids();

		sort( $ids );

		return $ids;
	}

	public function test_import__populates_sync_map_for_synced_class() {
		// Act
		Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'skip' ] );

		// Assert
		$this->assertEquals( [ 'g-sync-1' ], $this->get_synced_ids() );
	}

	public function test_import__maps_regenerated_id_when_class_id_collides() {
		// Arrange
		$this->seed_existing_class( 'g-sync-1', 'Unrelated', false );

		// Act
		$result = Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'skip' ] );

		// Assert
		$created = array_values( array_filter(
			$result['created'],
			fn( $entry ) => 'Synced1' === $entry['result_entry']['label']
		) );

		$this->assertCount( 1, $created );

		$regenerated_id = $created[0]['result_entry']['id'];

		$this->assertNotEquals( 'g-sync-1', $regenerated_id );
		$this->assertEquals( [ $regenerated_id ], $this->get_synced_ids() );
	}

	public function test_replace__tracks_existing_class_when_incoming_is_synced() {
		// Arrange
		$this->seed_existing_class( 'g-existing', 'Synced1', false );

		// Act
		Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'replace' ] );

		// Assert
		$this->assertEquals( [ 'g-existing' ], $this->get_synced_ids() );
	}

	public function test_replace__untracks_existing_synced_class_when_incoming_is_unsynced() {
		// Arrange
		$this->seed_existing_class( 'g-existing', 'Unsynced1', true );

		$this->assertEquals( [ 'g-existing' ], $this->get_synced_ids() );

		// Act
		Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'replace' ] );

		// Assert
		$this->assertEquals( [ 'g-sync-1' ], $this->get_synced_ids() );
	}

	public function test_merge__tracks_renamed_class_under_new_id() {
		// Arrange
		$this->seed_existing_class( 'g-existing', 'Synced1', false );

		// Act
		$result = Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'merge' ] );

		// Assert
		$this->assertCount( 1, $result['renamed'] );
		$this->assertEquals( 'g-sync-1', $result['renamed'][0]['result_entry']['id'] );
		$this->assertNotEquals( 'Synced1', $result['renamed'][0]['result_entry']['label'] );

		$this->assertEquals( [ 'g-sync-1' ], $this->get_synced_ids() );
	}

	public function test_skip__preserves_existing_sync_map_entry() {
		// Arrange
		$this->seed_existing_class( 'g-existing', 'Synced1', true );

		// Act
		Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'skip' ] );

		// Assert
		$this->assertEquals( [ 'g-existing' ], $this->get_synced_ids() );
	}

	public function test_override_all__clears_sync_map_entries_for_deleted_classes() {
		// Arrange
		$this->seed_existing_class( 'g-existing', 'Unrelated', true );

		// Act
		Import_Utils::import_classes( $this->mock_dir, [ 'conflict_resolution' => 'override-all' ] );

		// Assert
		$this->assertEquals( [ 'g-sync-1' ], $this->get_synced_ids() );
	}
}
