<?php
namespace Elementor\Testing\Includes;

use Elementor\User;

class Elementor_Test_User extends \WP_Ajax_UnitTestCase {

	private static $administrator;
	private static $subscriber;
	private $fake_notice_id = '123';

	public static function setUpBeforeClass() {
		parent::setUpBeforeClass();
		self::$administrator = self::factory()->user->create( [ 'role' => 'administrator' ] );
		self::$subscriber = self::factory()->user->create( [ 'role' => 'subscriber' ] );
	}

	public function test_should_return_false_because_of_invalid_post_type() {
		$post_id = $this->factory()->post->create( [ 'post_type' => 'invalid post type' ] );
		$this->assertFalse( User::is_current_user_can_edit( $post_id ) );
	}

	public function test_should_return_false_because_of_bad_post_Status() {
		$post_id = $this->factory()->post->create( [ 'post_status' => 'trash' ] );
		$this->assertFalse( User::is_current_user_can_edit( $post_id ) );
	}

	public function test_if_current_user_can_edit() {
		$post_id = $this->factory()->post->create();
		wp_set_current_user( self::$subscriber );

		$this->assertFalse( User::is_current_user_can_edit( $post_id ) );

		wp_set_current_user( self::$administrator );

		$this->assertTrue( User::is_current_user_can_edit( $post_id ) );
	}

	public function test_if_current_user_can_edit_specific_post_type() {
		wp_set_current_user( self::$administrator );
		$this->assertTrue( User::is_current_user_can_edit_post_type( 'page' ) );
		$this->assertTrue( User::is_current_user_can_edit_post_type( 'post' ) );
	}

	public function test_if_current_user_can_edit_post_type_that_is_not_existing() {
		wp_set_current_user( self::$administrator );
		$this->assertFalse( User::is_current_user_can_edit_post_type( 'invalid post type' ) );
	}

	/**
	 * @expectedException \Exception
	 * @group ajax
	 */
	public function test_should_throw_error_by_ajax_from_set_admin_notice_viewed() {
		User::init();

		$this->_handleAjax( 'elementor_set_admin_notice_viewed' );
	}

	public function test_should_not_notice_viewed() {
		$this->assertFalse( User::is_user_notice_viewed( $this->fake_notice_id ) );
	}

	/**
	 * @group ajax
	 */
	public function test_should_set_notice_as_viewed_by_admin() {
		User::init();
		$_POST['notice_id'] = $this->fake_notice_id;
		try {
			$this->_handleAjax( 'elementor_set_admin_notice_viewed' );
		} catch ( \WPAjaxDieContinueException $e ) {
			unset( $e );
		}

		$response = json_decode( $this->_last_response, true );

		$this->assertTrue( $response['success'] );
	}
}
