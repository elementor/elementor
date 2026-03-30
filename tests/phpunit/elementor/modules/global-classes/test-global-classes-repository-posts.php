<?php
namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Index;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Repository_Posts extends Elementor_Test_Base {
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

		foreach ( $this->created_post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->created_post_ids = [];

		Global_Classes_Repository::reset_storage_mode_cache();

		parent::tearDown();
	}

	public function test_is_using_posts__returns_false_when_no_posts() {
		// Act
		$repository = Global_Classes_Repository::make();

		// Assert
		$this->assertFalse( $repository->is_using_posts() );
	}

	public function test_is_using_posts__returns_true_when_posts_exist() {
		// Arrange
		$post = Global_Class_Post::create( 'g-1', 'test-class', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post->get_post_id();

		Global_Classes_Repository::reset_storage_mode_cache();

		// Act
		$repository = Global_Classes_Repository::make();

		// Assert
		$this->assertTrue( $repository->is_using_posts() );
	}

	public function test_all__returns_from_kit_meta_when_no_posts() {
		// Arrange
		$classes = [
			'items' => [
				'g-1' => [ 'id' => 'g-1', 'label' => 'test', 'type' => 'class', 'variants' => [] ],
			],
			'order' => [ 'g-1' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $classes );

		// Act
		$result = Global_Classes_Repository::make()->all();

		// Assert
		$this->assertSame( [ 'g-1' ], $result->get_order()->all() );
		$this->assertSame( 'test', $result->get_items()->get( 'g-1' )['label'] );
	}

	public function test_all__returns_from_posts_when_posts_exist() {
		// Arrange
		$post1 = Global_Class_Post::create( 'g-1', 'button-primary', [
			'type' => 'class',
			'variants' => [ [ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [] ] ],
		] );
		$post2 = Global_Class_Post::create( 'g-2', 'card-shadow', [
			'type' => 'class',
			'variants' => [],
		] );
		$this->created_post_ids[] = $post1->get_post_id();
		$this->created_post_ids[] = $post2->get_post_id();

		Global_Classes_Index::make()->set_order( [ 'g-2', 'g-1' ] );
		Global_Classes_Repository::reset_storage_mode_cache();

		// Act
		$result = Global_Classes_Repository::make()->all();

		// Assert
		$this->assertSame( [ 'g-2', 'g-1' ], $result->get_order()->all() );
		$this->assertSame( 'button-primary', $result->get_items()->get( 'g-1' )['label'] );
		$this->assertSame( 'card-shadow', $result->get_items()->get( 'g-2' )['label'] );
	}

	public function test_get__returns_class_from_posts() {
		// Arrange
		$post = Global_Class_Post::create( 'g-123', 'my-class', [
			'type' => 'class',
			'variants' => [ [ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [] ] ],
		] );
		$this->created_post_ids[] = $post->get_post_id();

		Global_Classes_Index::make()->set_order( [ 'g-123' ] );
		Global_Classes_Repository::reset_storage_mode_cache();

		// Act
		$result = Global_Classes_Repository::make()->get( 'g-123' );

		// Assert
		$this->assertNotNull( $result );
		$this->assertSame( 'g-123', $result['id'] );
		$this->assertSame( 'my-class', $result['label'] );
	}

	public function test_get__returns_null_for_non_existing() {
		// Arrange
		$post = Global_Class_Post::create( 'g-1', 'exists', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post->get_post_id();

		Global_Classes_Index::make()->set_order( [ 'g-1' ] );
		Global_Classes_Repository::reset_storage_mode_cache();

		// Act
		$result = Global_Classes_Repository::make()->get( 'g-non-existing' );

		// Assert
		$this->assertNull( $result );
	}

	public function test_put__creates_new_posts() {
		// Arrange
		$post = Global_Class_Post::create( 'g-existing', 'existing', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post->get_post_id();

		Global_Classes_Index::make()->set_order( [ 'g-existing' ] );
		Global_Classes_Repository::reset_storage_mode_cache();

		$new_items = [
			'g-existing' => [ 'id' => 'g-existing', 'label' => 'existing', 'type' => 'class', 'variants' => [] ],
			'g-new' => [ 'id' => 'g-new', 'label' => 'new-class', 'type' => 'class', 'variants' => [] ],
		];

		// Act
		Global_Classes_Repository::make()->put( $new_items, [ 'g-new', 'g-existing' ] );

		// Assert
		$new_post = Global_Class_Post::find_by_class_id( 'g-new' );
		$this->assertNotNull( $new_post );
		$this->created_post_ids[] = $new_post->get_post_id();
		$this->assertSame( 'new-class', $new_post->get_label() );

		$index = Global_Classes_Index::make();
		$this->assertSame( [ 'g-new', 'g-existing' ], $index->get_order() );
	}

	public function test_put__deletes_removed_posts() {
		// Arrange
		$post1 = Global_Class_Post::create( 'g-keep', 'keep', [ 'type' => 'class', 'variants' => [] ] );
		$post2 = Global_Class_Post::create( 'g-delete', 'delete', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post1->get_post_id();

		Global_Classes_Index::make()->set_order( [ 'g-keep', 'g-delete' ] );
		Global_Classes_Repository::reset_storage_mode_cache();

		$new_items = [
			'g-keep' => [ 'id' => 'g-keep', 'label' => 'keep', 'type' => 'class', 'variants' => [] ],
		];

		// Act
		Global_Classes_Repository::make()->put( $new_items, [ 'g-keep' ] );

		// Assert
		$deleted_post = Global_Class_Post::find_by_class_id( 'g-delete' );
		$this->assertNull( $deleted_post );

		$kept_post = Global_Class_Post::find_by_class_id( 'g-keep' );
		$this->assertNotNull( $kept_post );
	}

	public function test_put__updates_existing_posts() {
		// Arrange
		$post = Global_Class_Post::create( 'g-update', 'old-label', [
			'type' => 'class',
			'variants' => [],
		] );
		$this->created_post_ids[] = $post->get_post_id();

		Global_Classes_Index::make()->set_order( [ 'g-update' ] );
		Global_Classes_Repository::reset_storage_mode_cache();

		$updated_items = [
			'g-update' => [
				'id' => 'g-update',
				'label' => 'new-label',
				'type' => 'class',
				'variants' => [ [ 'meta' => [ 'breakpoint' => 'desktop', 'state' => null ], 'props' => [ 'color' => 'red' ] ] ],
			],
		];

		// Act
		Global_Classes_Repository::make()->put( $updated_items, [ 'g-update' ] );

		// Assert
		$updated_post = Global_Class_Post::find_by_class_id( 'g-update' );
		$this->assertSame( 'new-label', $updated_post->get_label() );

		$data = $updated_post->get_data();
		$this->assertCount( 1, $data['variants'] );
	}
}
