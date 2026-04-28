<?php
namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Global_Classes_Order extends Elementor_Test_Base {
	private Kit $kit;
	private array $created_post_ids = [];

	public function setUp(): void {
		parent::setUp();

		( new Global_Class_Post_Type() )->register_post_type();

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function tearDown(): void {
		$this->kit->delete_meta( Global_Classes_Order::META_KEY );

		foreach ( $this->created_post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->created_post_ids = [];

		parent::tearDown();
	}

	public function test_get_order__should_return_empty_array_when_no_stored_order() {
		$order = Global_Classes_Order::make()->get_order();

		$this->assertSame( [], $order );
	}

	public function test_set_order__should_store_order_in_kit_meta() {
		$classes_order = Global_Classes_Order::make();
		$ids = [ 'g-1', 'g-2', 'g-3' ];

		$result = $classes_order->set_order( $ids );

		$this->assertTrue( $result );
		$this->assertSame( $ids, $classes_order->get_order() );
	}

	public function test_append_class_id__should_append_to_order() {
		$classes_order = Global_Classes_Order::make();
		$classes_order->set_order( [ 'g-1', 'g-2' ] );

		$result = $classes_order->append_class_id( 'g-3' );

		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-2', 'g-3' ], $classes_order->get_order() );
	}

	public function test_append_class_id__should_not_duplicate() {
		$classes_order = Global_Classes_Order::make();
		$classes_order->set_order( [ 'g-1', 'g-2' ] );

		$result = $classes_order->append_class_id( 'g-1' );

		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-2' ], $classes_order->get_order() );
	}

	public function test_prepend_class_id__should_add_to_beginning() {
		$classes_order = Global_Classes_Order::make();
		$classes_order->set_order( [ 'g-1', 'g-2' ] );

		$result = $classes_order->prepend_class_id( 'g-0' );

		$this->assertTrue( $result );
		$this->assertSame( [ 'g-0', 'g-1', 'g-2' ], $classes_order->get_order() );
	}

	public function test_prepend_class_id__should_not_duplicate() {
		$classes_order = Global_Classes_Order::make();
		$classes_order->set_order( [ 'g-1', 'g-2' ] );

		$result = $classes_order->prepend_class_id( 'g-2' );

		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-2' ], $classes_order->get_order() );
	}

	public function test_remove_class_id__should_remove_from_order() {
		$classes_order = Global_Classes_Order::make();
		$classes_order->set_order( [ 'g-1', 'g-2', 'g-3' ] );

		$result = $classes_order->remove_class_id( 'g-2' );

		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-3' ], $classes_order->get_order() );
	}

	public function test_remove_class_id__should_handle_non_existing() {
		$classes_order = Global_Classes_Order::make();
		$classes_order->set_order( [ 'g-1', 'g-2' ] );

		$result = $classes_order->remove_class_id( 'g-999' );

		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-2' ], $classes_order->get_order() );
	}

	public function test_get_labels__should_return_labels_for_existing_posts() {
		$post1 = Global_Class_Post::create( 'g-1', 'button-primary', [ 'type' => 'class', 'variants' => [] ] );
		$post2 = Global_Class_Post::create( 'g-2', 'card-shadow', [ 'type' => 'class', 'variants' => [] ] );
		$this->created_post_ids[] = $post1->get_post_id();
		$this->created_post_ids[] = $post2->get_post_id();

		$classes_order = Global_Classes_Order::make();
		$classes_order->set_order( [ 'g-1', 'g-2' ] );

		$labels = $classes_order->get_labels();

		$this->assertSame( [
			'g-1' => 'button-primary',
			'g-2' => 'card-shadow',
		], $labels );
	}

	public function test_get_labels__should_return_empty_when_no_order() {
		$labels = Global_Classes_Order::make()->get_labels();

		$this->assertSame( [], $labels );
	}

	public function test_rebuild_order_from_post_menu_order__should_create_order_from_existing_posts() {
		$post1 = Global_Class_Post::create( 'g-1', 'first', [ 'type' => 'class', 'variants' => [] ], 0 );
		$post2 = Global_Class_Post::create( 'g-2', 'second', [ 'type' => 'class', 'variants' => [] ], 1 );
		$post3 = Global_Class_Post::create( 'g-3', 'third', [ 'type' => 'class', 'variants' => [] ], 2 );
		$this->created_post_ids[] = $post1->get_post_id();
		$this->created_post_ids[] = $post2->get_post_id();
		$this->created_post_ids[] = $post3->get_post_id();

		$classes_order = Global_Classes_Order::make();

		$result = $classes_order->rebuild_order_from_post_menu_order();

		$this->assertTrue( $result );
		$this->assertSame( [ 'g-1', 'g-2', 'g-3' ], $classes_order->get_order() );
	}
}
