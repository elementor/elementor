<?php
namespace Elementor\Testing\Includes;

use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_User extends Elementor_Test_Base {

	const OPTION_KEY = 'some-option-key';
	const ADMIN_NOTICES_KEY = 'elementor_admin_notices';

	public function test_get_user_option_with_default__returns_default() {
		// Arrange.
		$user = $this->act_as_admin();

		// Act.
		$value = User::get_user_option_with_default( static::OPTION_KEY, $user->ID, 'default-value' );

		// Assert.
		$this->assertEquals( 'default-value', $value );
	}

	public function test_get_user_option_with_default__returns_value() {
		// Arrange.
		$user = $this->act_as_admin();

		update_user_option( $user->ID, static::OPTION_KEY, 'actual-value' );

		// Act.
		$value = User::get_user_option_with_default( static::OPTION_KEY, $user->ID, 'default-value' );

		// Assert.
		$this->assertEquals( 'actual-value', $value );
	}

	public function test_is_user_notice_viewed__returns_false_on_new_website() {
		// Arrange.
		$user = $this->act_as_admin();

		delete_user_meta( $user->ID, self::ADMIN_NOTICES_KEY );

		// Act.
		$is_viewed = User::is_user_notice_viewed( 'some-notice-id' );

		// Assert.
		$this->assertFalse( $is_viewed );
	}

	public function test_is_user_notice_viewed__BC__returns_true_when_viewed() {
		// Arrange.
		$user = $this->act_as_admin();
		$notices = [ 'test_notice' => 'true' ];

		update_user_meta( $user->ID, self::ADMIN_NOTICES_KEY, $notices );

		// Act.
		$is_viewed = User::is_user_notice_viewed( 'test_notice' );

		// Assert.
		$this->assertTrue( $is_viewed );
	}

	public function test_is_user_notice_viewed__BC__returns_false_when_not_viewed() {
		// Arrange.
		$user = $this->act_as_admin();
		$notices = [ 'test_notice' => 'true' ];

		update_user_meta( $user->ID, self::ADMIN_NOTICES_KEY, $notices );

		// Act.
		$is_viewed = User::is_user_notice_viewed( 'other_test_notice' );

		// Assert.
		$this->assertFalse( $is_viewed );
	}

	public function test_is_user_notice_viewed__returns_true_when_viewed() {
		// Arrange.
		$user = $this->act_as_admin();
		$notices = [ 'test_notice' => [ 'is_viewed' => true ] ];

		update_user_meta( $user->ID, self::ADMIN_NOTICES_KEY, $notices );

		// Act.
		$is_viewed = User::is_user_notice_viewed( 'test_notice' );

		// Assert.
		$this->assertTrue( $is_viewed );
	}

	public function test_is_user_notice_viewed__returns_false_when_not_viewed() {
		// Arrange.
		$user = $this->act_as_admin();
		$notices = [ 'test_notice' => [ 'is_viewed' => true ] ];

		update_user_meta( $user->ID, self::ADMIN_NOTICES_KEY, $notices );

		// Act.
		$is_viewed = User::is_user_notice_viewed( 'other_test_notice' );

		// Assert.
		$this->assertFalse( $is_viewed );
	}
}
