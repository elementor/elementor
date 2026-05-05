<?php

namespace Elementor\Modules\DesignSystemSync\Classes;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group design-system-sync
 */
class Test_Global_Classes_Sync_Map extends Elementor_Test_Base {
	private function get_kit() {
		return Plugin::$instance->kits_manager->get_active_kit();
	}

	private function make(): Global_Classes_Sync_Map {
		return Global_Classes_Sync_Map::make( $this->get_kit() );
	}

	public function tearDown(): void {
		$kit = $this->get_kit();

		if ( $kit ) {
			$kit->delete_meta( Global_Classes_Sync_Map::META_KEY );
		}

		parent::tearDown();
	}

	public function test_get_synced_ids__returns_empty_when_no_meta_stored() {
		// Act
		$ids = $this->make()->get_synced_ids();

		// Assert
		$this->assertSame( [], $ids );
	}

	public function test_set_map_and_get_synced_ids__returns_stored_ids() {
		// Arrange
		$this->make()->set_map( [ 'g-1' => true, 'g-2' => true ] );

		// Act
		$ids = $this->make()->get_synced_ids();

		// Assert
		$this->assertEqualsCanonicalizing( [ 'g-1', 'g-2' ], $ids );
	}

	public function test_is_synced__returns_true_for_stored_id() {
		// Arrange
		$this->make()->set_map( [ 'g-1' => true ] );

		// Act & Assert
		$this->assertTrue( $this->make()->is_synced( 'g-1' ) );
	}

	public function test_is_synced__returns_false_for_absent_id() {
		// Arrange
		$this->make()->set_map( [ 'g-1' => true ] );

		// Act & Assert
		$this->assertFalse( $this->make()->is_synced( 'g-99' ) );
	}

	public function test_apply_changes__adds_synced_items() {
		// Arrange
		$sync_map = $this->make();

		// Act
		$sync_map->apply_changes(
			[
				'g-1' => [ 'sync_to_v3' => true ],
				'g-2' => [ 'sync_to_v3' => true ],
			],
			[]
		);

		// Assert
		$this->assertEqualsCanonicalizing( [ 'g-1', 'g-2' ], $this->make()->get_synced_ids() );
	}

	public function test_apply_changes__removes_deleted_ids() {
		// Arrange
		$this->make()->set_map( [ 'g-1' => true, 'g-2' => true ] );

		// Act
		$this->make()->apply_changes( [], [ 'g-1' ] );

		// Assert
		$this->assertEqualsCanonicalizing( [ 'g-2' ], $this->make()->get_synced_ids() );
	}

	public function test_apply_changes__untracks_item_when_sync_to_v3_becomes_false() {
		// Arrange
		$this->make()->set_map( [ 'g-1' => true ] );

		// Act
		$this->make()->apply_changes( [ 'g-1' => [ 'sync_to_v3' => false ] ], [] );

		// Assert
		$this->assertSame( [], $this->make()->get_synced_ids() );
	}

	public function test_apply_changes__tracks_item_when_sync_to_v3_becomes_true() {
		// Arrange
		$this->make()->set_map( [] );

		// Act
		$this->make()->apply_changes( [ 'g-1' => [ 'sync_to_v3' => true ] ], [] );

		// Assert
		$this->assertEqualsCanonicalizing( [ 'g-1' ], $this->make()->get_synced_ids() );
	}

	public function test_apply_changes__preserves_existing_unmodified_synced_ids() {
		// Arrange
		$this->make()->set_map( [ 'g-1' => true, 'g-2' => true ] );

		// Act — only g-3 is touched, g-1 and g-2 are untouched
		$this->make()->apply_changes( [ 'g-3' => [ 'sync_to_v3' => true ] ], [] );

		// Assert
		$this->assertEqualsCanonicalizing( [ 'g-1', 'g-2', 'g-3' ], $this->make()->get_synced_ids() );
	}

	public function test_apply_changes__handles_combined_add_remove_toggle() {
		// Arrange — g-1 synced, g-2 synced, g-3 not tracked
		$this->make()->set_map( [ 'g-1' => true, 'g-2' => true ] );

		// Act — delete g-1, toggle g-2 off, add g-3 synced
		$this->make()->apply_changes(
			[
				'g-2' => [ 'sync_to_v3' => false ],
				'g-3' => [ 'sync_to_v3' => true ],
			],
			[ 'g-1' ]
		);

		// Assert
		$this->assertEqualsCanonicalizing( [ 'g-3' ], $this->make()->get_synced_ids() );
	}
}
