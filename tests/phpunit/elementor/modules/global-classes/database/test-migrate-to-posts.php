<?php

namespace Elementor\Tests\Phpunit\Modules\GlobalClasses\Database;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Database\Migrations\Migrate_To_Posts;
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

class Test_Migrate_To_Posts extends Elementor_Test_Base {
	private Kit $kit;
	private array $created_post_ids = [];
	private array $extra_kit_ids = [];

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
		$this->kit->delete_meta( Global_Classes_Post_IDs::META_KEY );

		$posts = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'any',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] );

		foreach ( $posts as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		foreach ( $this->created_post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->force_delete_kits( $this->extra_kit_ids );

		$this->created_post_ids = [];
		$this->extra_kit_ids    = [];

		parent::tearDown();
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

	public function test_migration__creates_posts_from_kit_meta() {
		// Arrange
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
				'g-2' => [
					'id' => 'g-2',
					'label' => 'card-shadow',
					'type' => 'class',
					'variants' => [],
				],
			],
			'order' => [ 'g-2', 'g-1' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $global_classes );

		// Act
		$migration = new Migrate_To_Posts();
		$migration->up();

		// Assert
		$post1 = Global_Class_Post::find_by_class_id( 'g-1' );
		$post2 = Global_Class_Post::find_by_class_id( 'g-2' );

		$this->assertNotNull( $post1 );
		$this->assertNotNull( $post2 );
		$this->assertSame( 'button-primary', $post1->get_label() );
		$this->assertSame( 'card-shadow', $post2->get_label() );

		$classes_order = Global_Classes_Order::make( $this->kit );
		$this->assertSame( [ 'g-2', 'g-1' ], $classes_order->get_order() );
	}

	public function test_migration__preserves_variants() {
		// Arrange
		$variants = [
			[
				'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ],
			],
			[
				'meta' => [ 'breakpoint' => 'mobile', 'state' => 'hover' ],
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'blue' ] ],
			],
		];

		$global_classes = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'label' => 'test-class',
					'type' => 'class',
					'variants' => $variants,
				],
			],
			'order' => [ 'g-1' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $global_classes );

		// Act
		$migration = new Migrate_To_Posts();
		$migration->up();

		// Assert
		$post = Global_Class_Post::find_by_class_id( 'g-1' );
		$data = $post->get_data();

		$this->assertSame( $variants, $data['variants'] );
	}

	public function test_migration__populates_label_map() {
		// Arrange
		$global_classes = [
			'items' => [
				'g-1' => [
					'id' => 'g-1',
					'label' => 'button-primary',
					'type' => 'class',
					'variants' => [],
				],
				'g-2' => [
					'id' => 'g-2',
					'label' => 'card-shadow',
					'type' => 'class',
					'variants' => [],
				],
			],
			'order' => [ 'g-2', 'g-1' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $global_classes );

		// Act
		$migration = new Migrate_To_Posts();
		$migration->up();

		// Assert - label map must be populated so the repository can surface classes to the frontend
		$repository = Global_Classes_Repository::make( $this->kit );
		$label_by_id = $repository->all_labels();

		$this->assertSame( [ 'g-2' => 'card-shadow', 'g-1' => 'button-primary' ], $label_by_id );
	}

	public function test_migration__skips_when_no_global_classes() {
		// Arrange - no global classes in kit meta

		// Act
		$migration = new Migrate_To_Posts();
		$migration->up();

		// Assert
		$posts = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'publish',
			'posts_per_page' => -1,
		] );

		$this->assertEmpty( $posts );
	}

	public function test_migration__skips_when_posts_already_exist() {
		// Arrange
		$global_classes = [
			'items' => [
				'g-1' => [ 'id' => 'g-1', 'label' => 'test', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-1' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $global_classes );

		$existing_post = Global_Class_Post::create( 'g-existing', 'existing-class', [ 'type' => 'class', 'variants' => [] ] );

		// Act
		$migration = new Migrate_To_Posts();
		$migration->up();

		// Assert - only the pre-existing post should exist
		$posts = get_posts( [
			'post_type' => Global_Class_Post_Type::CPT,
			'post_status' => 'publish',
			'posts_per_page' => -1,
		] );

		$this->assertCount( 1, $posts );
		$this->assertSame( $existing_post->get_post_id(), $posts[0]->ID );

		$this->assertNotEmpty( $this->kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND ) );
	}

	public function test_migration__migrates_all_kits_on_fresh_install() {
		// Arrange — active kit AND a second draft kit both have aggregate data; no CPTs exist yet.
		$second_kit_id = Plugin::$instance->kits_manager->create( [ 'post_title' => 'Draft Kit' ] );
		$second_kit    = Plugin::$instance->kits_manager->get_kit( $second_kit_id );
		$this->extra_kit_ids[] = $second_kit_id;

		$active_classes = [
			'items' => [
				'g-active-1' => [ 'id' => 'g-active-1', 'label' => 'active-class', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-active-1' ],
		];

		$draft_classes = [
			'items' => [
				'g-draft-1' => [ 'id' => 'g-draft-1', 'label' => 'draft-class', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-draft-1' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $active_classes );
		$second_kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $draft_classes );

		// Act
		$migration = new Migrate_To_Posts();
		$migration->up();

		// Assert — both kits have CPT posts and isolated post-id maps.
		$active_post = Global_Class_Post::find_by_class_id( 'g-active-1', false, $this->kit );
		$draft_post  = Global_Class_Post::find_by_class_id( 'g-draft-1', false, $second_kit );

		$this->assertNotNull( $active_post, 'Active kit class must be migrated' );
		$this->assertNotNull( $draft_post, 'Draft kit class must be migrated' );
		$this->assertSame( 'active-class', $active_post->get_label() );
		$this->assertSame( 'draft-class', $draft_post->get_label() );

		// Maps must be disjoint.
		$map_active = $this->kit->get_meta( Global_Classes_Post_IDs::META_KEY );
		$map_draft  = $second_kit->get_meta( Global_Classes_Post_IDs::META_KEY );

		$this->assertIsArray( $map_active );
		$this->assertIsArray( $map_draft );
		$this->assertEmpty(
			array_intersect( array_values( $map_active ), array_values( $map_draft ) ),
			'Post-id maps of different kits must not share post IDs'
		);
	}
}
