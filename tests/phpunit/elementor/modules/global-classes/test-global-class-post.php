<?php
namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Post_IDs;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Class_Post_With_Mocked_Time extends Global_Class_Post {
	private int $fixed_timestamp;

	public function set_fixed_timestamp( int $timestamp ): void {
		$this->fixed_timestamp = $timestamp;
	}

	protected function get_current_timestamp(): int {
		return $this->fixed_timestamp;
	}
}

class Test_Global_Class_Post extends Elementor_Test_Base {
	private array $created_post_ids = [];
	private array $created_kit_ids = [];

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();
	}

	public function tearDown(): void {
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

	public function test_create__should_not_mark_post_as_edited() {
		$post = Global_Class_Post::create( 'g-fresh', 'fresh-class', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post->get_post_id();

		$this->assertFalse( $post->was_edited() );
	}

	public function test_was_edited__no_edit_timestamp_not_edited() {
		$post = Global_Class_Post::create( 'g-legacy-edited', 'legacy', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post->get_post_id();

		delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_EDITED ); // Mock v4.01-beta1 creation

		$reloaded = Global_Class_Post::from_post_id( $post->get_post_id() );

		$this->assertFalse( $reloaded->was_edited() );
		$this->assertFalse( $reloaded->has_edit_timestamp() );
	}

	public function test_create__should_create_post_with_correct_data() {
		// Arrange
		$class_id = 'g-123';
		$label = 'my-button';
		$data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ],
				],
			],
		];

		// Act
		$post = Global_Class_Post::create( $class_id, $label, $data );
		$this->created_post_ids[] = $post->get_post_id();

		// Assert
		$this->assertNotNull( $post );
		$this->assertSame( $class_id, $post->get_class_id() );
		$this->assertSame( $label, $post->get_label() );
		$this->assertSame( $data, $post->get_data() );
	}

	public function test_find_by_class_id__should_find_existing_post() {
		// Arrange
		$class_id = 'g-456';
		$post = Global_Class_Post::create( $class_id, 'test-class', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post->get_post_id();

		// Act
		$found = Global_Class_Post::find_by_class_id( $class_id );

		// Assert
		$this->assertNotNull( $found );
		$this->assertSame( $class_id, $found->get_class_id() );
		$this->assertSame( $post->get_post_id(), $found->get_post_id() );
	}

	public function test_find_by_class_id__should_return_null_for_non_existing() {
		// Act
		$found = Global_Class_Post::find_by_class_id( 'non-existing-id' );

		// Assert
		$this->assertNull( $found );
	}

	public function test_from_post_id__should_return_post_for_valid_id() {
		// Arrange
		$post = Global_Class_Post::create( 'g-789', 'test-class', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post->get_post_id();

		// Act
		$found = Global_Class_Post::from_post_id( $post->get_post_id() );

		// Assert
		$this->assertNotNull( $found );
		$this->assertSame( 'g-789', $found->get_class_id() );
	}

	public function test_from_post_id__should_return_null_for_invalid_id() {
		// Act
		$found = Global_Class_Post::from_post_id( 99999 );

		// Assert
		$this->assertNull( $found );
	}

	public function test_to_array__should_return_correct_structure() {
		// Arrange
		$class_id = 'g-abc';
		$label = 'button-primary';
		$data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'background' => [ '$$type' => 'color', 'value' => 'blue' ] ],
				],
			],
		];
		$post = Global_Class_Post::create( $class_id, $label, $data );
		$this->created_post_ids[] = $post->get_post_id();

		// Act
		$array = $post->to_array();

		// Assert
		$this->assertSame( [
			'id' => $class_id,
			'label' => $label,
			'type' => 'class',
			'variants' => $data['variants'],
		], $array );
	}

	public function test_update_data__marks_post_as_has_edit_timestamp_on_post_edit() {
		// Arrange
		$post = Global_Class_Post::create( 'g-modified', 'modified-test', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post->get_post_id();
		delete_post_meta( $post->get_post_id(), Global_Class_Post::META_KEY_EDITED ); // Mock v4.01-beta1 creation

		/** @var Global_Class_Post_With_Mocked_Time $post_with_fixed_time */
		$post_with_fixed_time = Global_Class_Post_With_Mocked_Time::from_post_id( $post->get_post_id() );
		$post_with_fixed_time->set_fixed_timestamp( time() + 60 );

		$new_data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'navy' ] ],
				],
			],
		];

		// Act
		$post_with_fixed_time->set_preview( false );
		$post_with_fixed_time->update_data( $new_data );

		// Assert
		$this->assertTrue( $post_with_fixed_time->has_edit_timestamp() );
		$this->assertTrue( $post_with_fixed_time->was_edited() );
	}

	public function test_update_data__should_update_frontend_data() {
		// Arrange
		$post = Global_Class_Post::create( 'g-update', 'update-test', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post->get_post_id();

		$new_data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => 'hover' ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'green' ] ],
				],
			],
		];

		// Act
		$post->set_preview( false );
		$result = $post->update_data( $new_data );

		// Assert
		$this->assertTrue( $result );
		$this->assertSame( $new_data, $post->get_data() );
	}

	public function test_update_data__preview_should_not_affect_frontend() {
		// Arrange
		$frontend_data = [ 'type' => 'class', 'variants' => [] ];
		$post = Global_Class_Post::create( 'g-preview', 'preview-test', $frontend_data );
		$this->created_post_ids[] = $post->get_post_id();

		$preview_data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'purple' ] ],
				],
			],
		];

		// Act
		$post->set_preview( true );
		$post->update_data( $preview_data );

		// Assert - frontend context should still return frontend data
		$frontend_post = Global_Class_Post::from_post_id( $post->get_post_id(), false );
		$this->assertSame( $frontend_data, $frontend_post->get_data() );

		// Assert - preview context should return preview data
		$preview_post = Global_Class_Post::from_post_id( $post->get_post_id(), true );
		$this->assertSame( $preview_data, $preview_post->get_data() );
	}

	public function test_delete__should_remove_post() {
		// Arrange
		$post = Global_Class_Post::create( 'g-delete', 'delete-test', [ 'type' => 'class', 'variants' => [] ] );
		$post_id = $post->get_post_id();

		// Act
		$result = $post->delete();

		// Assert
		$this->assertTrue( $result );
		$this->assertNull( Global_Class_Post::from_post_id( $post_id ) );
	}

	public function test_clone_to_other_kit__creates_new_post_with_same_data() {
		// Arrange
		$source_kit = Plugin::$instance->kits_manager->get_active_kit();
		$target_kit_id = Plugin::$instance->kits_manager->create( [ 'post_title' => 'Target Kit' ] );
		$target_kit = Plugin::$instance->kits_manager->get_kit( $target_kit_id );
		$this->created_kit_ids[] = $target_kit_id;

		$class_id = 'g-clone-1';
		$label = 'button-primary';
		$data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ],
				],
			],
		];
		$source_post = Global_Class_Post::create( $class_id, $label, $data, $source_kit );
		$this->created_post_ids[] = $source_post->get_post_id();

		// Act
		$cloned_post = Global_Class_Post::clone_to_other_kit( $class_id, $source_kit, $target_kit );
		$this->created_post_ids[] = $cloned_post->get_post_id();

		// Assert
		$this->assertNotNull( $cloned_post );
		$this->assertNotSame( $source_post->get_post_id(), $cloned_post->get_post_id() );
		$this->assertSame( $class_id, $cloned_post->get_class_id() );
		$this->assertSame( $label, $cloned_post->get_label() );
		$this->assertSame( $data, $cloned_post->get_data() );
	}

	public function test_clone_to_other_kit__registers_post_with_target_kit() {
		// Arrange
		$source_kit = Plugin::$instance->kits_manager->get_active_kit();
		$target_kit_id = Plugin::$instance->kits_manager->create( [ 'post_title' => 'Target Kit' ] );
		$target_kit = Plugin::$instance->kits_manager->get_kit( $target_kit_id );
		$this->created_kit_ids[] = $target_kit_id;

		$class_id = 'g-clone-register-1';
		$source_post = Global_Class_Post::create( $class_id, 'my-class', [ 'type' => 'class', 'variants' => [] ], $source_kit );
		$this->created_post_ids[] = $source_post->get_post_id();

		// Act
		$cloned_post = Global_Class_Post::clone_to_other_kit( $class_id, $source_kit, $target_kit );
		$this->created_post_ids[] = $cloned_post->get_post_id();

		// Assert
		$resolved_post_id = Global_Classes_Post_IDs::make( $target_kit )->get_post_id( $class_id );
		$this->assertSame( $cloned_post->get_post_id(), $resolved_post_id );
	}

	public function test_clone_to_other_kit__copies_preview_data_when_exists() {
		// Arrange
		$source_kit = Plugin::$instance->kits_manager->get_active_kit();
		$target_kit_id = Plugin::$instance->kits_manager->create( [ 'post_title' => 'Target Kit' ] );
		$target_kit = Plugin::$instance->kits_manager->get_kit( $target_kit_id );
		$this->created_kit_ids[] = $target_kit_id;

		$class_id = 'g-clone-preview-1';
		$frontend_data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'blue' ] ],
				],
			],
		];
		$preview_data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'green' ] ],
				],
			],
		];

		$source_post = Global_Class_Post::create( $class_id, 'preview-class', $frontend_data, $source_kit );
		$this->created_post_ids[] = $source_post->get_post_id();
		$source_post->set_preview( true );
		$source_post->update_data( $preview_data );

		// Act
		$cloned_post = Global_Class_Post::clone_to_other_kit( $class_id, $source_kit, $target_kit );
		$this->created_post_ids[] = $cloned_post->get_post_id();

		// Assert
		$cloned_frontend = Global_Class_Post::from_post_id( $cloned_post->get_post_id(), false );
		$cloned_preview = Global_Class_Post::from_post_id( $cloned_post->get_post_id(), true );

		$this->assertSame( $frontend_data, $cloned_frontend->get_data() );
		$this->assertSame( $preview_data, $cloned_preview->get_data() );
	}

	public function test_clone_to_other_kit__preserves_edited_timestamp() {
		// Arrange
		$source_kit = Plugin::$instance->kits_manager->get_active_kit();
		$target_kit_id = Plugin::$instance->kits_manager->create( [ 'post_title' => 'Target Kit' ] );
		$target_kit = Plugin::$instance->kits_manager->get_kit( $target_kit_id );
		$this->created_kit_ids[] = $target_kit_id;

		$class_id = 'g-clone-timestamp-1';
		$source_post = Global_Class_Post::create( $class_id, 'timestamp-class', [ 'type' => 'class', 'variants' => [] ], $source_kit );
		$this->created_post_ids[] = $source_post->get_post_id();

		$fixed_timestamp = time() + 1000;
		update_post_meta( $source_post->get_post_id(), Global_Class_Post::META_KEY_EDITED, $fixed_timestamp );

		// Act
		$cloned_post = Global_Class_Post::clone_to_other_kit( $class_id, $source_kit, $target_kit );
		$this->created_post_ids[] = $cloned_post->get_post_id();

		// Assert
		$cloned_timestamp = get_post_meta( $cloned_post->get_post_id(), Global_Class_Post::META_KEY_EDITED, true );
		$this->assertSame( $fixed_timestamp, (int) $cloned_timestamp );
	}

	public function test_clone_to_other_kit__returns_null_when_source_class_not_found() {
		// Arrange
		$source_kit = Plugin::$instance->kits_manager->get_active_kit();
		$target_kit_id = Plugin::$instance->kits_manager->create( [ 'post_title' => 'Target Kit' ] );
		$target_kit = Plugin::$instance->kits_manager->get_kit( $target_kit_id );
		$this->created_kit_ids[] = $target_kit_id;

		// Act
		$cloned_post = Global_Class_Post::clone_to_other_kit( 'non-existent-class', $source_kit, $target_kit );

		// Assert
		$this->assertNull( $cloned_post );
	}

	public function test_clone_to_other_kit__creates_independent_post() {
		// Arrange
		$source_kit = Plugin::$instance->kits_manager->get_active_kit();
		$target_kit_id = Plugin::$instance->kits_manager->create( [ 'post_title' => 'Target Kit' ] );
		$target_kit = Plugin::$instance->kits_manager->get_kit( $target_kit_id );
		$this->created_kit_ids[] = $target_kit_id;

		$class_id = 'g-clone-independent-1';
		$original_data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ],
				],
			],
		];
		$source_post = Global_Class_Post::create( $class_id, 'independent-class', $original_data, $source_kit );
		$this->created_post_ids[] = $source_post->get_post_id();

		$cloned_post = Global_Class_Post::clone_to_other_kit( $class_id, $source_kit, $target_kit );
		$this->created_post_ids[] = $cloned_post->get_post_id();

		// Act
		$modified_data = [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'blue' ] ],
				],
			],
		];
		$cloned_post->set_preview( false );
		$cloned_post->update_data( $modified_data );

		// Assert
		$reloaded_source = Global_Class_Post::from_post_id( $source_post->get_post_id() );
		$reloaded_cloned = Global_Class_Post::from_post_id( $cloned_post->get_post_id() );

		$this->assertSame( $original_data, $reloaded_source->get_data() );
		$this->assertSame( $modified_data, $reloaded_cloned->get_data() );
	}
}
