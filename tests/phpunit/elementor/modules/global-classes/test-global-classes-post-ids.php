<?php
namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Post_IDs;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Global_Classes_Post_IDs extends Elementor_Test_Base {
	private Kit $kit;
	private array $created_post_ids = [];
	private array $created_kit_ids = [];

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();
		( new Global_Classes_Post_IDs() )->register_hooks();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function tearDown(): void {
		$this->kit->delete_meta( Global_Classes_Post_IDs::META_KEY );

		foreach ( $this->created_post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->force_delete_kits( $this->created_kit_ids );

		$this->created_post_ids = [];
		$this->created_kit_ids = [];

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

	public function test_create__adds_class_id_to_post_id_mapping() {
		// Arrange
		$class_id = 'g-create-1';

		// Act
		$post = Global_Class_Post::create( $class_id, 'my-class', [ 'type' => 'class', 'variants' => [] ], $this->kit );
		$this->created_post_ids[] = $post->get_post_id();

		// Assert
		$resolved = Global_Classes_Post_IDs::make( $this->kit )->get_post_id( $class_id );
		$this->assertSame( $post->get_post_id(), $resolved );
	}

	public function test_delete__removes_class_id_from_mapping() {
		// Arrange
		$class_id = 'g-delete-1';
		$post = Global_Class_Post::create( $class_id, 'my-class', [ 'type' => 'class', 'variants' => [] ], $this->kit );
		$post_id = $post->get_post_id();

		$this->assertSame( $post_id, Global_Classes_Post_IDs::make( $this->kit )->get_post_id( $class_id ) );

		// Act
		$post->delete();

		// Assert
		$map = $this->kit->get_meta( Global_Classes_Post_IDs::META_KEY );
		$this->assertIsArray( $map );
		$this->assertArrayNotHasKey( $class_id, $map );
	}

	public function test_external_delete__removes_class_id_from_mapping() {
		// Arrange
		$class_id = 'g-ext-delete-1';
		$post = Global_Class_Post::create( $class_id, 'my-class', [ 'type' => 'class', 'variants' => [] ], $this->kit );
		$post_id = $post->get_post_id();

		// Act — delete via wp_delete_post directly, bypassing Global_Class_Post::delete()
		wp_delete_post( $post_id, true );

		// Assert
		$map = $this->kit->get_meta( Global_Classes_Post_IDs::META_KEY );
		$this->assertIsArray( $map );
		$this->assertArrayNotHasKey( $class_id, $map );
	}

	public function test_recover_after_delete__class_can_be_created_and_found() {
		// Arrange
		$class_id = 'g-recover-1';
		$post = Global_Class_Post::create( $class_id, 'my-class', [ 'type' => 'class', 'variants' => [] ], $this->kit );
		$post->delete();

		// Act
		$new_post = Global_Class_Post::create( $class_id, 'my-class-2', [ 'type' => 'class', 'variants' => [] ], $this->kit );
		$this->created_post_ids[] = $new_post->get_post_id();

		// Assert
		$found = Global_Class_Post::find_by_class_id( $class_id );
		$this->assertNotNull( $found );
		$this->assertSame( $new_post->get_post_id(), $found->get_post_id() );
		$this->assertSame( $new_post->get_post_id(), Global_Classes_Post_IDs::make( $this->kit )->get_post_id( $class_id ) );
	}

	public function test_stale_map_entry__returns_null_and_clears_entry() {
		// Arrange — delete the CPT then re-inject its ID into the map to simulate a stale entry
		$class_id = 'g-stale-1';

		$post = Global_Class_Post::create( $class_id, 'my-class', [ 'type' => 'class', 'variants' => [] ], $this->kit );
		$dead_post_id = $post->get_post_id();
		$post->delete();

		$post_ids = Global_Classes_Post_IDs::make( $this->kit );
		$post_ids->set( $class_id, $dead_post_id );

		// Act
		$resolved = $post_ids->get_post_id( $class_id );

		// Assert — stale entry returns null and is removed from map
		$this->assertNull( $resolved );
		$map = $this->kit->get_meta( Global_Classes_Post_IDs::META_KEY );
		$this->assertArrayNotHasKey( $class_id, $map );
	}

	public function test_unmapped_class__returns_null_without_backfill() {
		// Arrange — create a CPT post for the class but do NOT add it to the map.
		$class_id = 'g-no-backfill-1';
		$data     = [ 'type' => 'class', 'variants' => [] ];

		$post_id = wp_insert_post( [
			'post_type'   => Global_Class_Post_Type::CPT,
			'post_title'  => 'my-class',
			'post_status' => 'publish',
		] );
		update_post_meta( $post_id, Global_Class_Post::META_KEY_ID, $class_id );
		update_post_meta( $post_id, Global_Class_Post::META_KEY_DATA, $data );
		$this->created_post_ids[] = $post_id;

		// Act — the class exists as a CPT but is not in the kit's map.
		$resolved = Global_Classes_Post_IDs::make( $this->kit )->get_post_id( $class_id );

		// Assert — no backfill: should return null and leave the map empty.
		$this->assertNull( $resolved );
		$map = $this->kit->get_meta( Global_Classes_Post_IDs::META_KEY );
		$this->assertEmpty( $map );
	}

	public function test_delete_hook__updates_non_active_kit_map() {
		// Arrange — create a second kit and associate a class with it (not the active kit)
		$second_kit_id = Plugin::$instance->kits_manager->create( [ 'post_title' => 'Second Kit' ] );
		$second_kit = Plugin::$instance->kits_manager->get_kit( $second_kit_id );
		$this->created_kit_ids[] = $second_kit_id;

		$class_id = 'g-wrong-kit-1';
		$post = Global_Class_Post::create( $class_id, 'my-class', [ 'type' => 'class', 'variants' => [] ], $second_kit );
		$post_id = $post->get_post_id();

		$this->assertSame( $post_id, Global_Classes_Post_IDs::make( $second_kit )->get_post_id( $class_id ) );

		// Act — delete the CPT while a different kit is active
		wp_delete_post( $post_id, true );

		// Assert — the second kit's map is cleaned up even though it wasn't the active kit
		$map = $second_kit->get_meta( Global_Classes_Post_IDs::META_KEY );
		$this->assertIsArray( $map );
		$this->assertArrayNotHasKey( $class_id, $map );
	}
}
