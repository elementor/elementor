<?php

use \Elementor\User;
use \Elementor\Core\Ajax_Manager;

class Elementor_Test_User extends WP_Ajax_UnitTestCase {


	public function test_should_return_false_when_sending_bad_type_to_is_current_user_can_edit() {
		$post_id = $this->factory->post->create( [ 'post_type' => 'banana' ] );
		$this->assertFalse( User::is_current_user_can_edit( $post_id ) );
	}

	public function test_should_tell_if_current_user_can_edit_bad_post_status() {
		$post_id = $this->factory->post->create( [ 'post_status' => 'trash' ] );
		$this->assertFalse( User::is_current_user_can_edit( $post_id ) );
	}

	public function test_should_tell_if_current_user_can_edit_user_cant_edit() {
		$post_id = $this->factory->post->create( [ 'post_status' => 'post' ] );
		$this->assertFalse(User::is_current_user_can_edit($post_id));
	}

	public function test_should_tell_if_current_user_can_edit_passes_all() {
		wp_set_current_user( $this->factory->user->create( [ 'role' => 'administrator' ] ) );

		$post_id = $this->factory->post->create( [ 'post_status' => 'post' ] );

		$this->assertTrue(User::is_current_user_can_edit($post_id));
	}

	public function test_is_current_user_can_edit_post_type_should_return_true() {
		$this->assertTrue( User::is_current_user_can_edit_post_type( 'page' ) );
	}

	public function test_is_current_user_can_edit_post_type_should_return_false_when_the_post_type_dose_not_exists() {
		$this->assertFalse( User::is_current_user_can_edit_post_type( 'banana' ) );
	}

	public function test_is_current_user_can_edit_post_type_should_return_false_when_the_post_type_dose_supported() {
		wp_set_current_user( $this->factory->user->create( [ 'role' => 'Subscriber' ] ) );

		$this->assertFalse( User::is_current_user_can_edit_post_type( 'attachment' ) );

		wp_set_current_user( $this->factory->user->create( [ 'role' => 'administrator' ] ) );
	}

	public function test_should_throw_error_by_ajax_set_admin_notice_viewed() {
		$this->expectExceptionMessage( __( 'Invalid request.', 'elementor' ) );

		User::init();

		$this->_handleAjax( 'elementor_set_admin_notice_viewed' );
	}

	public function test_should_not_notice_viewed() {
		$this->assertFalse(User::is_user_notice_viewed(1));
	}

	/**
	 *
	 */
	public function test_should_set_admin_notice_viewed_by_ajax() {
		User::init();
		$_POST['notice_id'] = '123';
		try {
			$this->_handleAjax( 'elementor_set_admin_notice_viewed' );
		} catch ( WPAjaxDieContinueException $e ) {
			unset( $e );
		}

		$response = json_decode( $this->_last_response, true );

		$this->assertTrue( $response['success'] );
	}


	// TODO learn how to use elementor ajax systems.
	/*public function test_should_set_elementor_admin_notice_viewed() {
		User::init();
		\Elementor\Plugin::$instance->ajax->handle_ajax_request();

		$this->assertSame( '', 'asd' );
	}*/
	// TODO end.





}