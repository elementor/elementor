<?php

namespace Elementor\Tests\Phpunit\Modules\GlobalClasses\Database;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Database\Migrations\Migrate_All_Kits_Post_IDs;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Post_IDs;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @covers \Elementor\Modules\GlobalClasses\Database\Migrations\Migrate_All_Kits_Post_IDs
 */
class Test_Migrate_All_Kits_Post_IDs extends Elementor_Test_Base {
	private Kit $active_kit;

	/** @var int[] Kit post IDs created for extra kits, cleaned up in tearDown. */
	private array $extra_kit_ids = [];

	/** @var int[] CPT post IDs created directly (not via repository) for tearDown cleanup. */
	private array $raw_post_ids = [];

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();
		( new Global_Classes_Post_IDs() )->register_hooks();

		$this->active_kit  = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function tearDown(): void {
		$this->active_kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$this->active_kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
		$this->active_kit->delete_meta( Global_Classes_Order::META_KEY );
		$this->active_kit->delete_meta( Global_Classes_Labels::META_KEY );
		$this->active_kit->delete_meta( Global_Classes_Post_IDs::META_KEY );

		$cpt_posts = get_posts( [
			'post_type'      => Global_Class_Post_Type::CPT,
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
		] );

		foreach ( $cpt_posts as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		foreach ( $this->raw_post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->force_delete_kits( $this->extra_kit_ids );

		$this->extra_kit_ids = [];
		$this->raw_post_ids  = [];

		parent::tearDown();
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	private function create_extra_kit( string $title = 'Extra Kit' ): Kit {
		$kit_id = Plugin::$instance->kits_manager->create( [ 'post_title' => $title ] );
		$this->extra_kit_ids[] = $kit_id;

		return Plugin::$instance->kits_manager->get_kit( $kit_id );
	}

	private function force_delete_kits( array $kit_ids ): void {
		if ( empty( $kit_ids ) ) {
			return;
		}

		$skip_confirmation = new \ReflectionProperty( Plugin::$instance->kits_manager, 'should_skip_trash_kit_confirmation' );
		$skip_confirmation->setAccessible( true );
		$skip_confirmation->setValue( Plugin::$instance->kits_manager, true );

		foreach ( $kit_ids as $kit_id ) {
			wp_delete_post( $kit_id, true );
		}

		$skip_confirmation->setValue( Plugin::$instance->kits_manager, false );
	}

	private function make_aggregate( array $items_by_id, array $order = [] ): array {
		return [
			'items' => $items_by_id,
			'order' => $order ?: array_keys( $items_by_id ),
		];
	}

	private function make_class_item( string $id, string $label = '' ): array {
		return [
			'id'       => $id,
			'label'    => $label ?: $id,
			'type'     => 'class',
			'variants' => [],
		];
	}

	private function insert_raw_cpt( string $class_id, string $label = 'raw' ): int {
		$post_id = wp_insert_post( [
			'post_type'   => Global_Class_Post_Type::CPT,
			'post_title'  => $label,
			'post_status' => 'publish',
		] );
		update_post_meta( $post_id, Global_Class_Post::META_KEY_ID, $class_id );
		update_post_meta( $post_id, Global_Class_Post::META_KEY_DATA, [ 'type' => 'class', 'variants' => [] ] );

		$this->raw_post_ids[] = $post_id;

		return $post_id;
	}

	// -------------------------------------------------------------------------
	// Pass A: restructure unmigrated kits
	// -------------------------------------------------------------------------

	public function test_pass_a__migrates_non_active_kit_with_aggregate_and_no_order() {
		// Arrange — extra kit has old aggregate data but no order meta.
		$extra_kit = $this->create_extra_kit();
		$extra_kit->update_json_meta(
			Global_Classes_Repository::META_KEY_FRONTEND,
			$this->make_aggregate( [
				'g-a1' => $this->make_class_item( 'g-a1', 'alpha' ),
				'g-a2' => $this->make_class_item( 'g-a2', 'beta' ),
			], [ 'g-a2', 'g-a1' ] )
		);

		// Act
		( new Migrate_All_Kits_Post_IDs() )->up();

		// Assert — both classes have CPT posts.
		$order = Global_Classes_Order::make( $extra_kit )->set_preview( false )->get_order();
		$this->assertSame( [ 'g-a2', 'g-a1' ], $order );

		$post1 = Global_Class_Post::find_by_class_id( 'g-a1', false, $extra_kit );
		$post2 = Global_Class_Post::find_by_class_id( 'g-a2', false, $extra_kit );

		$this->assertNotNull( $post1, 'CPT post for g-a1 should exist' );
		$this->assertNotNull( $post2, 'CPT post for g-a2 should exist' );
		$this->assertSame( 'alpha', $post1->get_label() );
		$this->assertSame( 'beta', $post2->get_label() );
	}

	public function test_pass_a__skips_kits_that_already_have_order_meta() {
		// Arrange — active kit already has order meta (simulating previous migration).
		$items = [ 'g-skip1' => $this->make_class_item( 'g-skip1', 'already-done' ) ];
		Global_Classes_Repository::make( $this->active_kit )->put(
			$items,
			[ 'g-skip1' ]
		);

		$post_id_before = Global_Classes_Post_IDs::make( $this->active_kit )->get_post_id( 'g-skip1' );

		// Act
		( new Migrate_All_Kits_Post_IDs() )->up();

		// Assert — the existing CPT post was not replaced.
		$post_id_after = Global_Classes_Post_IDs::make( $this->active_kit )->get_post_id( 'g-skip1' );
		$this->assertSame( $post_id_before, $post_id_after );
	}

	// -------------------------------------------------------------------------
	// Pass B: fill missing post-id map entries
	// -------------------------------------------------------------------------

	public function test_pass_b__fills_missing_map_entry_by_reusing_unclaimed_cpt_post() {
		// Arrange — kit has order meta but its post-id map is missing one entry.
		// There is an existing CPT post for that class not claimed by any kit.
		$extra_kit = $this->create_extra_kit();

		// Set order meta directly (simulate already-migrated state with one entry missing from map).
		Global_Classes_Order::make( $extra_kit )->set_preview( false )->set_order( [ 'g-b1' ] );

		$orphan_post_id = $this->insert_raw_cpt( 'g-b1', 'orphan' );

		// Act
		( new Migrate_All_Kits_Post_IDs() )->up();

		// Assert — the orphan CPT is now mapped to the kit.
		$resolved = Global_Classes_Post_IDs::make( $extra_kit )->get_post_id( 'g-b1' );
		$this->assertSame( $orphan_post_id, $resolved );
	}

	public function test_pass_b__creates_fresh_post_when_all_cpt_candidates_are_claimed_by_other_kit() {
		// Arrange — kit A claims the only CPT for g-b2; kit B also needs g-b2 but must not reuse it.
		$kit_a = $this->create_extra_kit( 'Kit A' );
		$kit_b = $this->create_extra_kit( 'Kit B' );

		// Kit A: already migrated with the class mapped.
		$post_a = Global_Class_Post::create( 'g-b2', 'shared-class', [ 'type' => 'class', 'variants' => [] ], $kit_a );
		Global_Classes_Order::make( $kit_a )->set_preview( false )->set_order( [ 'g-b2' ] );

		// Kit B: has order meta but no map entry, and no unclaimed CPT exists.
		Global_Classes_Order::make( $kit_b )->set_preview( false )->set_order( [ 'g-b2' ] );
		$kit_b->update_json_meta(
			Global_Classes_Repository::META_KEY_FRONTEND,
			$this->make_aggregate( [ 'g-b2' => $this->make_class_item( 'g-b2', 'shared-class' ) ] )
		);

		// Act
		( new Migrate_All_Kits_Post_IDs() )->up();

		// Assert — kit B has a different CPT post than kit A.
		$resolved_a = Global_Classes_Post_IDs::make( $kit_a )->get_post_id( 'g-b2' );
		$resolved_b = Global_Classes_Post_IDs::make( $kit_b )->get_post_id( 'g-b2' );

		$this->assertNotNull( $resolved_b, 'Kit B should have a post_id for g-b2' );
		$this->assertNotSame( $post_a->get_post_id(), $resolved_b, 'Kit B must not share kit A\'s post' );
		$this->assertSame( $post_a->get_post_id(), $resolved_a, 'Kit A\'s mapping should be unchanged' );
	}

	public function test_pass_b__skips_class_when_no_cpt_and_no_aggregate_data() {
		// Arrange — kit has order meta referencing a class for which neither a CPT nor aggregate exists.
		$extra_kit = $this->create_extra_kit();
		Global_Classes_Order::make( $extra_kit )->set_preview( false )->set_order( [ 'g-ghost' ] );

		// Act
		( new Migrate_All_Kits_Post_IDs() )->up();

		// Assert — nothing should be mapped; no fatal.
		$resolved = Global_Classes_Post_IDs::make( $extra_kit )->get_post_id( 'g-ghost' );
		$this->assertNull( $resolved );
	}

	// -------------------------------------------------------------------------
	// Pass C: de-duplicate shared post IDs across kits
	// -------------------------------------------------------------------------

	public function test_pass_c__forks_shared_post_id_to_give_each_kit_exclusive_ownership() {
		// Arrange — two kits share the same CPT post for the same class_id
		// (simulates the historical lazy-backfill cross-contamination).
		$kit_owner = $this->create_extra_kit( 'Owner Kit' );
		$kit_loser = $this->create_extra_kit( 'Loser Kit' );

		// Ensure kit_owner has a smaller ID so it wins the owner determination.
		$this->assertLessThan( $kit_loser->get_id(), $kit_owner->get_id(), 'Owner kit must have a smaller ID' );

		$shared_post = Global_Class_Post::create( 'g-c1', 'shared', [ 'type' => 'class', 'variants' => [] ], $kit_owner );
		$shared_post_id = $shared_post->get_post_id();

		// Manually inject the same post_id into the loser kit's map.
		Global_Classes_Post_IDs::make( $kit_loser )->set( 'g-c1', $shared_post_id );

		// Both kits already have order meta (pass A/B are no-ops for them).
		Global_Classes_Order::make( $kit_owner )->set_preview( false )->set_order( [ 'g-c1' ] );
		Global_Classes_Order::make( $kit_loser )->set_preview( false )->set_order( [ 'g-c1' ] );

		// Act
		( new Migrate_All_Kits_Post_IDs() )->up();

		// Assert — owner keeps the original post; loser gets a fresh (different) post.
		$owner_post_id = Global_Classes_Post_IDs::make( $kit_owner )->get_post_id( 'g-c1' );
		$loser_post_id = Global_Classes_Post_IDs::make( $kit_loser )->get_post_id( 'g-c1' );

		$this->assertSame( $shared_post_id, $owner_post_id, 'Owner kit must retain the original post' );
		$this->assertNotNull( $loser_post_id, 'Loser kit must have a post_id after forking' );
		$this->assertNotSame( $shared_post_id, $loser_post_id, 'Loser kit must own a different CPT post' );

		// The forked post should carry the same label as the source.
		$forked = Global_Class_Post::from_post_id( $loser_post_id );
		$this->assertNotNull( $forked );
		$this->assertSame( 'shared', $forked->get_label() );
	}

	// -------------------------------------------------------------------------
	// Isolation guarantee
	// -------------------------------------------------------------------------

	public function test_after_migration__no_post_id_is_shared_across_kit_maps() {
		// Arrange — two kits, one with aggregate only (unmigrated), one fully migrated but with
		// its map polluted by a shared entry from kit B.
		$kit_a = $this->create_extra_kit( 'Kit A' );
		$kit_b = $this->create_extra_kit( 'Kit B' );

		// Kit A: unmigrated.
		$kit_a->update_json_meta(
			Global_Classes_Repository::META_KEY_FRONTEND,
			$this->make_aggregate( [ 'g-iso-1' => $this->make_class_item( 'g-iso-1', 'iso-class' ) ] )
		);

		// Kit B: migrated and mapped.
		$post_b = Global_Class_Post::create( 'g-iso-2', 'iso-b', [ 'type' => 'class', 'variants' => [] ], $kit_b );
		Global_Classes_Order::make( $kit_b )->set_preview( false )->set_order( [ 'g-iso-2' ] );

		// Simulate cross-contamination: kit A also claims kit B's post.
		Global_Classes_Post_IDs::make( $kit_a )->set( 'g-iso-2', $post_b->get_post_id() );

		// Act
		( new Migrate_All_Kits_Post_IDs() )->up();

		// Collect all maps after migration.
		$map_a = $kit_a->get_meta( Global_Classes_Post_IDs::META_KEY );
		$map_b = $kit_b->get_meta( Global_Classes_Post_IDs::META_KEY );

		$all_a = is_array( $map_a ) ? array_values( $map_a ) : [];
		$all_b = is_array( $map_b ) ? array_values( $map_b ) : [];

		$intersection = array_intersect( $all_a, $all_b );

		$this->assertEmpty(
			$intersection,
			'After migration, no post_id should be shared between kit maps. Shared: ' . implode( ', ', $intersection )
		);
	}
}
