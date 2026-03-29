<?php
namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Index;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Index extends Elementor_Test_Base {
	private Kit $kit;
	private array $created_post_ids = [];

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function tearDown(): void {
		$this->kit->delete_meta( Global_Classes_Index::META_KEY );

		foreach ( $this->created_post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->created_post_ids = [];

		parent::tearDown();
	}

	public function test_get_order__should_return_empty_array_when_no_index() {
		// Act
		$order = Global_Classes_Index::make()->get_order();

		// Assert
		$this->assertSame( [], $order );
	}

	public function test_set_order__should_store_order_in_kit_meta() {
		// Arrange
		$index = Global_Classes_Index::make();
		$ids = [ 'g-1', 'g-2', 'g-3' ];

		// Act
		$result = $index->set_order( $ids );

		// Assert
		$this->assertTrue( $result );
		$this->assertSame( $ids, $index->get_order() );
	}

	public function test_add_class__should_append_to_order() {
		// Arrange
		$index = Global_Classes_Index::make();
		$index->set_order( [ 'g-1', 'g-2' ] );

		// Act
		$result = $index->add_class( 'g-3' );

		// Assert
		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-2', 'g-3' ], $index->get_order() );
	}

	public function test_add_class__should_not_duplicate() {
		// Arrange
		$index = Global_Classes_Index::make();
		$index->set_order( [ 'g-1', 'g-2' ] );

		// Act
		$result = $index->add_class( 'g-1' );

		// Assert
		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-2' ], $index->get_order() );
	}

	public function test_prepend_class__should_add_to_beginning() {
		// Arrange
		$index = Global_Classes_Index::make();
		$index->set_order( [ 'g-1', 'g-2' ] );

		// Act
		$result = $index->prepend_class( 'g-0' );

		// Assert
		$this->assertTrue( $result );
		$this->assertSame( [ 'g-0', 'g-1', 'g-2' ], $index->get_order() );
	}

	public function test_prepend_class__should_not_duplicate() {
		// Arrange
		$index = Global_Classes_Index::make();
		$index->set_order( [ 'g-1', 'g-2' ] );

		// Act
		$result = $index->prepend_class( 'g-2' );

		// Assert
		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-2' ], $index->get_order() );
	}

	public function test_remove_class__should_remove_from_order() {
		// Arrange
		$index = Global_Classes_Index::make();
		$index->set_order( [ 'g-1', 'g-2', 'g-3' ] );

		// Act
		$result = $index->remove_class( 'g-2' );

		// Assert
		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-3' ], $index->get_order() );
	}

	public function test_remove_class__should_handle_non_existing() {
		// Arrange
		$index = Global_Classes_Index::make();
		$index->set_order( [ 'g-1', 'g-2' ] );

		// Act
		$result = $index->remove_class( 'g-999' );

		// Assert
		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-2' ], $index->get_order() );
	}

	public function test_get_labels__should_return_labels_for_existing_posts() {
		// Arrange
		$post1 = Global_Class_Post::create( 'g-1', 'button-primary', [ 'type' => 'class', 'variants' => [] ] );
		$post2 = Global_Class_Post::create( 'g-2', 'card-shadow', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post1->get_post_id();
		$this->created_post_ids[] = $post2->get_post_id();

		$index = Global_Classes_Index::make();
		$index->set_order( [ 'g-1', 'g-2' ] );

		// Act
		$labels = $index->get_labels();

		// Assert
		$this->assertSame( [
			'g-1' => 'button-primary',
			'g-2' => 'card-shadow',
		], $labels );
	}

	public function test_get_labels__should_return_empty_when_no_order() {
		// Act
		$labels = Global_Classes_Index::make()->get_labels();

		// Assert
		$this->assertSame( [], $labels );
	}

	public function test_build_from_posts__should_create_order_from_existing_posts() {
		// Arrange
		$post1 = Global_Class_Post::create( 'g-1', 'first', [ 'type' => 'class', 'variants' => [] ], 0 );
		$post2 = Global_Class_Post::create( 'g-2', 'second', [ 'type' => 'class', 'variants' => [] ], 1 );
		$post3 = Global_Class_Post::create( 'g-3', 'third', [ 'type' => 'class', 'variants' => [] ], 2 );
		$this->created_post_ids[] = $post1->get_post_id();
		$this->created_post_ids[] = $post2->get_post_id();
		$this->created_post_ids[] = $post3->get_post_id();

		$index = Global_Classes_Index::make();

		// Act
		$result = $index->build_from_posts();

		// Assert
		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-2', 'g-3' ], $index->get_order() );
	}
}
