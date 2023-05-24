<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Tests\Phpunit\Elementor\Core\Config\Mock\User_Config;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_User_Option extends Elementor_Test_Base {

	public function test__get() {
		$this->act_as_subscriber();

		// Act
		update_user_option( get_current_user_id(), User_Config::get_db_key(), 'test' );

		// Assert
		$this->assertEquals( 'test', User_Config::get_value() );
	}

	public function test__get_default() {
		// Assert
		$this->assertEquals( 'default-value', User_Config::get_value() );
	}

	public function test__set() {
		// Arrange
		$this->act_as_admin();

		// Act
		User_Config::set( 'test' );

		// Assert
		$this->assertEquals( 'test', get_user_option( 'elementor_test', get_current_user_id() ) );
	}

	public function test_delete() {
		$this->act_as_admin();

		// Arrange
		$this->test__get();

		// Act
		User_Config::delete();

		// Assert
		$this->assertEmpty( get_user_option( 'elementor_test', get_current_user_id() ) );
	}
}
