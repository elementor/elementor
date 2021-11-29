<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Options;

use ElementorEditorTesting\Elementor_Test_Base;

class Site_Option_Test extends \Elementor\Core\Options\Site_Option {
	public static function should_autoload() {
		return false;
	}

	public static function get_key() {
		return 'test';
	}

	public static function get_default() {
		return 'default-value';
	}
}

class Test_Site_Option extends Elementor_Test_Base {
	public function test__get() {
		// Act
		$this->set_test_value();

		// Assert
		$this->assertEquals('test' , Site_Option_Test::get() );
	}

	public function test__set() {
		// Act
		Site_Option_Test::set( 'test' );

		// Assert
		$this->assertEquals('test' , get_option( 'elementor_test' ) );
	}

	public function test__get_default() {
		// Assert
		$this->assertEquals('default-value' , Site_Option_Test::get() );
	}

	public function test_delete() {
		// Arrange
		$this->test__get();

		// Act
		Site_Option_Test::delete();

		// Assert
		$this->assertEmpty( get_option( 'elementor_test' ) );
	}

	public function tearDown() {
		parent::tearDown();

		// Cleanup
		delete_option( 'elementor_test' );
	}

	private function set_test_value() {
		update_option( 'elementor_test', 'test' );
	}
}
