<?php

namespace Elementor\Tests\Phpunit\Modules\GlobalClasses\Database;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Database\Migrations\Migrate_To_Posts;
use Elementor\Modules\GlobalClasses\Document_Global_Classes_Tracker;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Index;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Migrate_To_Posts extends Elementor_Test_Base {
	private Kit $kit;
	private array $created_post_ids = [];

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();

		Global_Classes_Repository::reset_storage_mode_cache();
	}

	public function tearDown(): void {
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
		$this->kit->delete_meta( Global_Classes_Index::META_KEY );

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

		$this->created_post_ids = [];

		Global_Classes_Repository::reset_storage_mode_cache();

		parent::tearDown();
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

		$index = Global_Classes_Index::make();
		$this->assertSame( [ 'g-2', 'g-1' ], $index->get_order() );
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

	public function test_migration__cleans_up_kit_meta() {
		// Arrange
		$global_classes = [
			'items' => [
				'g-1' => [ 'id' => 'g-1', 'label' => 'test', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-1' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $global_classes );
		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_PREVIEW, $global_classes );

		// Act
		$migration = new Migrate_To_Posts();
		$migration->up();

		// Assert
		$this->assertEmpty( $this->kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND ) );
		$this->assertEmpty( $this->kit->get_json_meta( Global_Classes_Repository::META_KEY_PREVIEW ) );
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

	public function test_migration__repository_uses_posts_after_migration() {
		// Arrange
		$global_classes = [
			'items' => [
				'g-1' => [ 'id' => 'g-1', 'label' => 'test', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-1' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $global_classes );

		$this->assertFalse( Global_Classes_Repository::make()->is_using_posts() );

		// Act
		$migration = new Migrate_To_Posts();
		$migration->up();

		// Assert
		$this->assertTrue( Global_Classes_Repository::make()->is_using_posts() );
	}
}
