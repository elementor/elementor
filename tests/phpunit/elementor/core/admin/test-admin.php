<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin;

use Elementor\Core\Admin\Admin;
use Elementor\Core\Base\Document;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Admin extends Elementor_Test_Base {
	public function test_save_post() {
		// Arrange
		$admin = new Admin();
		$post = $this->factory()->create_and_get_custom_post( [] );
		$_POST['_elementor_edit_mode_nonce'] = wp_create_nonce( 'admin.php' );
		$_POST['_elementor_post_mode'] = 1;

		// Act
		$admin->save_post( $post->ID );

		// Assert
		$this->assertEquals( 'builder', get_post_meta( $post->ID, Document::BUILT_WITH_ELEMENTOR_META_KEY, true ) );
	}

	public function test_save_post__when_saved_outside_of_elementor_it_will_not_change() {
		// Arrange
		$admin = new Admin();
		$post = $this->factory()->create_and_get_custom_post( [] );

		// Act
		$admin->save_post( $post->ID );

		// Assert
		$this->assertEmpty( get_post_meta( $post->ID, Document::BUILT_WITH_ELEMENTOR_META_KEY, true ) );
	}
}
