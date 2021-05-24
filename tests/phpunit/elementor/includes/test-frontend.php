<?php
namespace Elementor\Testing\Includes;

use Elementor\Plugin;
use Elementor\Frontend;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Frontend extends Elementor_Test_Base {
	public function test_get_builder_content__should_switch_back_to_to_the_last_document() {
		$main_document = $this->factory()->documents->create_and_get();
		$sub_document = $this->factory()->documents->create_and_get();

		Plugin::$instance->documents->switch_to_document( $main_document );

		Plugin::$instance->frontend->get_builder_content( $sub_document->get_id() );

		$this->assertEquals( $main_document->get_id(), Plugin::$instance->documents->get_current()->get_id() );

	}

	public function test_get_builder_content__should_switch_back_to_the_last_document_for_empty_document() {
		$main_document = $this->factory()->documents->create_and_get();
		$sub_document = $this->factory()->documents->create_and_get( [ 'meta_input' => [ '_elementor_data' => null ] ] );

		Plugin::$instance->documents->switch_to_document( $main_document );

		Plugin::$instance->frontend->get_builder_content( $sub_document->get_id() );

		$this->assertEquals( $main_document->get_id(), Plugin::$instance->documents->get_current()->get_id() );
	}

	public function test_body_classes() {
		// Arrange
		$document = $this->factory()->documents->publish_and_get();

		query_posts( [
			'p' => $document->get_id(),
		] );
		the_post();

		$frontend = new Frontend();

		// Act
		$result = $frontend->body_class( [] );

		// Assert
		$this->assertTrue( in_array( 'elementor-default', $result, true ) );
		$this->assertTrue( in_array( 'elementor-page elementor-page-' . $document->get_id() , $result, true ) );
	}

	public function test_body_classes__when_the_post_is_not_edit_with_elementor() {
		// Arrange
		$post = $this->factory()->post->create_and_get();

		query_posts( [
			'p' => $post->ID,
		] );
		the_post();

		$frontend = new Frontend();

		// Act
		$result = $frontend->body_class( [] );

		// Assert
		$this->assertTrue( in_array( 'elementor-default', $result, true ) );
		$this->assertFalse( in_array( 'elementor-page elementor-page-' . $post->ID , $result, true ) );
	}
}
