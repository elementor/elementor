<?php

namespace Elementor\Tests\Phpunit\Modules\GlobalClasses\Database;

use Elementor\Core\Kits\Documents\Kit;
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

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function tearDown(): void {
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

		parent::tearDown();
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
		$legacy_variants = [
			[
				'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'green' ] ],
			],
		];

		$post = Global_Class_Post::create( 'g-1', 'from-cpt', [ 'type' => 'class', 'variants' => [] ] );
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
		Global_Classes_Order::make( $this->kit )->set_order( [ 'g-1' ] );
		Global_Classes_Labels::make( $this->kit )->set_labels( [ 'g-1' => 'one' ] );
		Global_Class_Post::create( 'g-1', 'one', [ 'type' => 'class', 'variants' => [] ] );

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
}
