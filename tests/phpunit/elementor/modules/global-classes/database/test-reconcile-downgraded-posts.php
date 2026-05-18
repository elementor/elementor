<?php

namespace Elementor\Tests\Phpunit\Modules\GlobalClasses\Database;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Upgrade\Manager;
use Elementor\Modules\GlobalClasses\Database\Migrations\Migrate_To_Posts;
use Elementor\Modules\GlobalClasses\Database\Migrations\Reconcile_Downgraded_Posts;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Reconcile_Downgraded_Posts extends Elementor_Test_Base {
	private Kit $kit;

	private $install_history_snapshot = null;

	private $legacy_signal_page_ids = [];

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();

		$saved = get_option( Manager::get_install_history_meta(), false );
		$this->install_history_snapshot = is_array( $saved ) ? $saved : null;
		$this->legacy_signal_page_ids = [];
	}

	public function tearDown(): void {
		foreach ( $this->legacy_signal_page_ids as $page_id ) {
			wp_delete_post( $page_id, true );
		}
		$this->legacy_signal_page_ids = [];

		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
		$this->kit->delete_meta( Global_Classes_Order::META_KEY );
		$this->kit->delete_meta( Global_Classes_Labels::META_KEY );

		$posts = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'any',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] );

		foreach ( $posts as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		if ( null === $this->install_history_snapshot ) {
			delete_option( Manager::get_install_history_meta() );
		} else {
			update_option( Manager::get_install_history_meta(), $this->install_history_snapshot );
		}

		parent::tearDown();
	}

	private function given_legacy_edit_document_signal(): void {
		$intro_ts = time() - 2 * WEEK_IN_SECONDS;
		$history = is_array( $this->install_history_snapshot ) ? $this->install_history_snapshot : [];
		$history['4.1.0'] = $intro_ts;
		update_option( Manager::get_install_history_meta(), $history );

		$page_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_status' => 'publish',
		] );

		update_post_meta( $page_id, '_elementor_version', '4.0.5' );

		$modified_gmt = gmdate( 'Y-m-d H:i:s', $intro_ts + DAY_IN_SECONDS );

		wp_update_post( [
			'ID' => $page_id,
			'post_modified_gmt' => $modified_gmt,
			'post_modified' => get_date_from_gmt( $modified_gmt ),
		] );

		$this->legacy_signal_page_ids[] = $page_id;
	}

	private function given_post_storage_intro_without_legacy_document_signal(): void {
		$history = is_array( $this->install_history_snapshot ) ? $this->install_history_snapshot : [];
		$history['4.1.0'] = time() - WEEK_IN_SECONDS;
		update_option( Manager::get_install_history_meta(), $history );
	}

	public function test_migrate_then_reconcile__is_idempotent_for_fresh_cpts() {
		$global_classes = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'label' => 'button-primary',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
							'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'blue' ] ],
						],
					],
				],
			],
			'order' => [ 'g-1' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $global_classes );

		( new Migrate_To_Posts() )->up();
		$post_after_migrate = Global_Class_Post::find_by_class_id( 'g-1' );
		$data_after_migrate = $post_after_migrate->get_data();

		( new Reconcile_Downgraded_Posts() )->up();
		$post_after_reconcile = Global_Class_Post::find_by_class_id( 'g-1' );

		$this->assertSame( $data_after_migrate['variants'], $post_after_reconcile->get_data()['variants'] );
		$this->assertSame( 'button-primary', $post_after_reconcile->get_label() );
	}

	public function test_reconcile__updates_untouched_cpt_from_legacy() {
		$this->given_legacy_edit_document_signal();

		$legacy_variants = [
			[
				'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'green' ] ],
			],
		];

		$post = Global_Class_Post::create( 'g-1', 'from-cpt', [ 'type' => 'class', 'variants' => [] ] );
		delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_EDITED ); // Mock v4.01-beta1 creation

		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'from-cpt' ] );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'label' => 'from-legacy',
					'type' => 'class',
					'variants' => $legacy_variants,
				],
			],
			'order' => [ 'g-1' ],
		] );

		( new Reconcile_Downgraded_Posts() )->up();

		$reloaded = Global_Class_Post::find_by_class_id( 'g-1' );
		$this->assertSame( 'from-legacy', $reloaded->get_label() );
		$this->assertSame( $legacy_variants, $reloaded->get_data()['variants'] );
	}

	public function test_reconcile__skips_cpt_when_renamed() {
		$post = Global_Class_Post::create( 'g-1', 'original', [ 'type' => 'class', 'variants' => [] ] );
		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'original' ] );

		$post->update_label( 'renamed' );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'label' => 'legacy-label',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
							'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'blue' ] ],
						],
					],
				],
			],
			'order' => [ 'g-1' ],
		] );

		( new Reconcile_Downgraded_Posts() )->up();

		$reloaded = Global_Class_Post::find_by_class_id( 'g-1' );
		$this->assertSame( 'renamed', $reloaded->get_label() );
		$this->assertSame( [], $reloaded->get_data()['variants'] );
	}

	public function test_reconcile__skips_cpt_when_data_updated_via_update_data() {
		$post = Global_Class_Post::create( 'g-1', 'label', [ 'type' => 'class', 'variants' => [] ] );
		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'label' ] );

		$post->set_preview( false );
		$post->update_data( [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'cyan' ] ],
				],
			],
		] );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'label' => 'label',
					'type' => 'class',
					'variants' => [],
				],
			],
			'order' => [ 'g-1' ],
		] );

		( new Reconcile_Downgraded_Posts() )->up();

		$reloaded = Global_Class_Post::find_by_class_id( 'g-1' );
		$this->assertSame( 'cyan', $reloaded->get_data()['variants'][0]['props']['color']['value'] );
	}

	public function test_reconcile__creates_missing_class_from_legacy() {
		$this->given_legacy_edit_document_signal();

		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'one' ] );
		$post = Global_Class_Post::create( 'g-1', 'one', [ 'type' => 'class', 'variants' => [] ] );
		delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_EDITED );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [ 'id' => 'g-1', 'label' => 'one', 'type' => 'class', 'variants' => [] ],
				'g-new' => [ 'id' => 'g-new', 'label' => 'new-one', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-1', 'g-new' ],
		] );

		( new Reconcile_Downgraded_Posts() )->up();

		$new = Global_Class_Post::find_by_class_id( 'g-new' );
		$this->assertNotNull( $new );
		$this->assertSame( 'new-one', $new->get_label() );
	}

	public function test_reconcile__skips_overwrite_when_no_legacy_edit_document_signal() {
		$this->given_post_storage_intro_without_legacy_document_signal();

		$legacy_variants = [
			[
				'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'green' ] ],
			],
		];

		$post = Global_Class_Post::create( 'g-1', 'from-cpt', [ 'type' => 'class', 'variants' => [] ] );
		delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_EDITED );

		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'from-cpt' ] );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'label' => 'from-legacy',
					'type' => 'class',
					'variants' => $legacy_variants,
				],
			],
			'order' => [ 'g-1' ],
		] );

		( new Reconcile_Downgraded_Posts() )->up();

		$reloaded = Global_Class_Post::find_by_class_id( 'g-1' );
		$this->assertSame( 'from-cpt', $reloaded->get_label() );
		$this->assertSame( [], $reloaded->get_data()['variants'] );
	}

	public function test_reconcile__second_run_updates_from_legacy_when_edit_timestamp_cleared() {
		$this->given_legacy_edit_document_signal();

		$legacy_variants_first = [
			[
				'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'green' ] ],
			],
		];
		$legacy_variants_second = [
			[
				'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ],
			],
		];

		$post = Global_Class_Post::create( 'g-1', 'from-cpt', [ 'type' => 'class', 'variants' => [] ] );
		delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_EDITED );

		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'from-cpt' ] );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'label' => 'from-legacy',
					'type' => 'class',
					'variants' => $legacy_variants_first,
				],
			],
			'order' => [ 'g-1' ],
		] );

		( new Reconcile_Downgraded_Posts() )->up();

		$reloaded = Global_Class_Post::find_by_class_id( 'g-1' );
		$this->assertSame( 'green', $reloaded->get_data()['variants'][0]['props']['color']['value'] );

		delete_post_meta( $reloaded->get_post_id(), Global_Class_Post::META_KEY_EDITED );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'label' => 'from-legacy-2',
					'type' => 'class',
					'variants' => $legacy_variants_second,
				],
			],
			'order' => [ 'g-1' ],
		] );

		( new Reconcile_Downgraded_Posts() )->up();

		$reloaded_after_second = Global_Class_Post::find_by_class_id( 'g-1' );
		$this->assertSame( 'from-legacy-2', $reloaded_after_second->get_label() );
		$this->assertSame( 'red', $reloaded_after_second->get_data()['variants'][0]['props']['color']['value'] );
	}

	public function test_reconcile__preserves_orphan_cpt_not_in_legacy() {
		Global_Class_Post::create( 'g-orphan', 'orphan', [ 'type' => 'class', 'variants' => [] ] );
		Global_Class_Post::create( 'g-1', 'one', [ 'type' => 'class', 'variants' => [] ] );
		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1', 'g-orphan' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [
			'g-1' => 'one',
			'g-orphan' => 'orphan',
		] );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [ 'id' => 'g-1', 'label' => 'one', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-1' ],
		] );

		( new Reconcile_Downgraded_Posts() )->up();

		$this->assertNotNull( Global_Class_Post::find_by_class_id( 'g-orphan' ) );
		$this->assertSame( [ 'g-1', 'g-orphan' ], Global_Classes_Order::make( $this->kit )->get_order() );
	}

	public function test_reconcile__same_label_same_id__no_change() {
		// Arrange - label already correctly mapped to the same id
		Global_Class_Post::create( 'g-1', 'button', [ 'type' => 'class', 'variants' => [] ] );
		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'button' ] );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [ 'id' => 'g-1', 'label' => 'button', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-1' ],
		] );

		// Act
		( new Reconcile_Downgraded_Posts() )->up();

		// Assert - label unchanged in both the post and the kit label map
		$post = Global_Class_Post::find_by_class_id( 'g-1' );
		$this->assertSame( 'button', $post->get_label() );
		$this->assertSame( [ 'g-1' => 'button' ], Global_Classes_Labels::make( $this->kit )->get_labels() );
	}

	public function test_reconcile__same_label_different_id__generates_unique_label() {
		// Arrange - two legacy items share the same label; g-2 arrives second and must get a DUP_ prefix.
		// g-1 has no edit timestamp (simulates a pre-timestamp CPT row) so it goes through Group B,
		// which requires the legacy-edit signal to allow overwriting.
		$this->given_legacy_edit_document_signal();

		$post1 = Global_Class_Post::create( 'g-1', 'button', [ 'type' => 'class', 'variants' => [] ] );
		delete_post_meta( $post1->get_post_id(), Global_Class_Post::META_KEY_EDITED );

		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'button' ] );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [ 'id' => 'g-1', 'label' => 'button', 'type' => 'class', 'variants' => [] ],
				'g-2' => [ 'id' => 'g-2', 'label' => 'button', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-1', 'g-2' ],
		] );

		// Act
		( new Reconcile_Downgraded_Posts() )->up();

		// Assert - g-1 keeps its label; g-2 gets a unique DUP_ variant
		$post1 = Global_Class_Post::find_by_class_id( 'g-1' );
		$post2 = Global_Class_Post::find_by_class_id( 'g-2' );

		$this->assertSame( 'button', $post1->get_label() );
		$this->assertStringStartsWith( 'DUP_', $post2->get_label() );

		$label_map = Global_Classes_Labels::make( $this->kit )->get_labels();
		$this->assertSame( 'button', $label_map['g-1'] );
		$this->assertStringStartsWith( 'DUP_', $label_map['g-2'] );
		$this->assertNotSame( $label_map['g-1'], $label_map['g-2'] );
	}

	public function test_reconcile__label_not_in_map_but_id_has_different_label__updates_to_legacy_label() {
		// Arrange - CPT exists with a stale label that no longer matches the legacy source
		$post = Global_Class_Post::create( 'g-1', 'old-label', [ 'type' => 'class', 'variants' => [] ] );
		delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_EDITED );

		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'old-label' ] );

		$this->given_legacy_edit_document_signal();

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [ 'id' => 'g-1', 'label' => 'new-label', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-1' ],
		] );

		// Act
		( new Reconcile_Downgraded_Posts() )->up();

		// Assert - post and kit label map both reflect the legacy label
		$reloaded = Global_Class_Post::find_by_class_id( 'g-1' );
		$this->assertSame( 'new-label', $reloaded->get_label() );
		$this->assertSame( [ 'g-1' => 'new-label' ], Global_Classes_Labels::make( $this->kit )->get_labels() );
	}

	public function test_reconcile__three_classes_share_label__all_get_unique_labels() {
		// Arrange - none of the CPT rows have edit timestamps so all go through Group B,
		// which requires the legacy-edit signal.
		$this->given_legacy_edit_document_signal();

		$post1 = Global_Class_Post::create( 'g-1', 'shared', [ 'type' => 'class', 'variants' => [] ] );
		delete_post_meta( $post1->get_post_id(), Global_Class_Post::META_KEY_EDITED );

		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'shared' ] );

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, [
			'items' => [
				'g-1' => [ 'id' => 'g-1', 'label' => 'shared', 'type' => 'class', 'variants' => [] ],
				'g-2' => [ 'id' => 'g-2', 'label' => 'shared', 'type' => 'class', 'variants' => [] ],
				'g-3' => [ 'id' => 'g-3', 'label' => 'shared', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-1', 'g-2', 'g-3' ],
		] );

		// Act
		( new Reconcile_Downgraded_Posts() )->up();

		// Assert - all three end up with distinct labels
		$label_map = Global_Classes_Labels::make( $this->kit )->get_labels();

		$this->assertCount( 3, array_unique( array_values( $label_map ) ) );
		$this->assertSame( 'shared', $label_map['g-1'] );
		$this->assertStringStartsWith( 'DUP_', $label_map['g-2'] );
		$this->assertStringStartsWith( 'DUP_', $label_map['g-3'] );
		$this->assertNotSame( $label_map['g-2'], $label_map['g-3'] );
	}
}
