<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\SiteNavigation;

use Elementor\Modules\SiteNavigation\Rest_Fields\Page_User_Can;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Page_User_Can extends Elementor_Test_Base {

	public function test_register_rest_field_registers_page_and_post_when_user_can_requested() {
		// Arrange.
		global $wp_rest_additional_fields;
		$wp_rest_additional_fields = [];

		$_GET['_fields'] = 'id,title,user_can';

		$subject = new Page_User_Can();

		// Act.
		$subject->register_rest_field();

		// Assert.
		$this->assertArrayHasKey( 'page', $wp_rest_additional_fields );
		$this->assertArrayHasKey( 'post', $wp_rest_additional_fields );
		$this->assertArrayHasKey( 'user_can', $wp_rest_additional_fields['page'] );
		$this->assertArrayHasKey( 'user_can', $wp_rest_additional_fields['post'] );

		unset( $_GET['_fields'] );
	}

	public function test_register_rest_field_skips_when_user_can_not_requested() {
		// Arrange.
		global $wp_rest_additional_fields;
		$wp_rest_additional_fields = [];

		$_GET['_fields'] = 'id,title';

		$subject = new Page_User_Can();

		// Act.
		$subject->register_rest_field();

		// Assert.
		$this->assertEmpty( $wp_rest_additional_fields );

		unset( $_GET['_fields'] );
	}

	public function test_get_callback_reflects_edit_and_delete_caps() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_type' => 'page' ] );

		$subject = new Page_User_Can();

		// Act.
		$result = $subject->get_callback( [ 'id' => $post_id ] );

		// Assert.
		$this->assertTrue( $result['edit'] );
		$this->assertTrue( $result['delete'] );
	}
}