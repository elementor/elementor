<?php
namespace Elementor\Testing\Includes;

use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_User extends Elementor_Test_Base {

	const OPTION_KEY = 'some-option-key';

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
}
