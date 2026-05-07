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

		$this->created_post_ids = [];

		parent::tearDown();
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
}
