<?php
namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Class_Post extends Elementor_Test_Base {
	private array $created_post_ids = [];

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();
	}

	public function tearDown(): void {
		foreach ( $this->created_post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->created_post_ids = [];

		parent::tearDown();
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
		$post = Global_Class_Post::create( $class_id, $label, $data, 5 );
		$this->created_post_ids[] = $post->get_post_id();

		// Assert
		$this->assertNotNull( $post );
		$this->assertSame( $class_id, $post->get_class_id() );
		$this->assertSame( $label, $post->get_label() );
		$this->assertSame( 5, $post->get_order() );
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
}
