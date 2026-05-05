<?php
namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Class_Post_Type extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();
	}

	public function tearDown(): void {
		parent::tearDown();
	}

	public function test_register_post_type__should_register_e_global_class_cpt() {
		// Arrange
		$post_type = new Global_Class_Post_Type();

		// Act
		$post_type->register_post_type();

		// Assert
		$this->assertTrue( post_type_exists( Global_Class_Post_Type::CPT ) );
	}

	public function test_register_post_type__should_not_be_public() {
		// Arrange
		$post_type = new Global_Class_Post_Type();

		// Act
		$post_type->register_post_type();
		$post_type_obj = get_post_type_object( Global_Class_Post_Type::CPT );

		// Assert
		$this->assertFalse( $post_type_obj->public );
		$this->assertFalse( $post_type_obj->publicly_queryable );
		$this->assertFalse( $post_type_obj->show_ui );
		$this->assertFalse( $post_type_obj->show_in_menu );
	}
}
