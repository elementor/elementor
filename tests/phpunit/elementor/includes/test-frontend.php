<?php
namespace Elementor\Testing\Includes;

use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Frontend extends Elementor_Test_Base {
	public function test_get_builder_content__should_switch_back_to_to_the_last_document() {
		$main_document = $this->factory()->documents->create_and_get();
		$sub_document = $this->factory()->documents->create_elementor_document();

		Plugin::$instance->documents->switch_to_document( $main_document );

		Plugin::$instance->frontend->get_builder_content( $sub_document->get_id() );

		$this->assertEquals( $main_document->get_id(), Plugin::$instance->documents->get_current()->get_id() );

	}

	public function test_get_builder_content__should_switch_back_to_the_last_document_for_empty_document() {
		$main_document = $this->factory()->documents->create_and_get();
		$sub_document = $this->factory()->documents->create_elementor_document( [ 'meta_input' => [ '_elementor_data' => null ] ] );

		Plugin::$instance->documents->switch_to_document( $main_document );

		Plugin::$instance->frontend->get_builder_content( $sub_document->get_id() );

		$this->assertEquals( $main_document->get_id(), Plugin::$instance->documents->get_current()->get_id() );
	}
}
