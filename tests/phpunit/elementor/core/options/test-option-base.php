<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Config_Base;
use ElementorEditorTesting\Elementor_Test_Base;

class Config_Base_Test extends \Elementor\Core\Config\Config_Base {
	static $value;
	static $changed;

	public static function should_autoload() {
		return false;
	}

	public static function get_key() {
		return 'test';
	}

	public static function get_default() {
		return 'default-value';
	}

	public static function get() {
		return static::$value;
	}

	public static function setter( $value ) {
		static::$value = $value;
		return true;
	}

	public static function delete() {
		static::$value = null;
	}

	public static function on_change( $new_value, $old_value = null ) {
		static::$changed = [
			'new' => $new_value,
			'old' => $old_value,
		];
	}
}

class Test_Option_Base extends Elementor_Test_Base {

	public function test__get_prefix() {
		// Assert.
		$this->assertEquals( 'elementor_', Config_Base_Test::get_prefix() );
	}

	public function test__get_full_key() {
		// Assert.
		$this->assertEquals( 'elementor_test', Config_Base_Test::get_full_key() );
	}

	public function test__get_sub_option() {
		// Arrange.
		Config_Base_Test::$value = [ 'sub_option' => 'sub_value' ];

		// Assert.
		$this->assertEquals( 'sub_value', Config_Base_Test::get_sub_option( 'sub_option' ) );
	}

	public function test__set_sub_option() {
		// Arrange.
		Config_Base_Test::$value = [];

		// Act.
		Config_Base_Test::set_sub_option( 'sub_option', 'sub_value' );

		// Assert.
		$this->assertEquals( [ 'sub_option' => 'sub_value' ], Config_Base_Test::$value );
	}

	public function test__set_invalid_sub_option() {
		// Assert.
		$this->expectException( \Error::class );

		// Act.
		Config_Base_Test::set_sub_option( 'sub_option', 'sub_value' );
	}

	public function test__delete_sub_option() {
		// Arrange.
		$this->test__set_sub_option();

		// Act.
		Config_Base_Test::delete_sub_option( 'sub_option' );

		// Assert.
		$this->assertEquals( [], Config_Base_Test::$value );
	}

	public function test__on_change() {
		// Act.
		Config_Base_Test::set( 'new-value' );

		// Assert.
		$this->assertEquals( [
			'new' => 'new-value',
			'old' => null,
		], Config_Base_Test::$changed );
	}

	public function test__is_on() {
		// Arrange.
		Config_Base_Test::$value = Config_Base::OPTION_YES;

		// Assert.
		$this->assertTrue( Config_Base_Test::is_on() );
	}

	public function test__is_off() {
		// Arrange.
		Config_Base_Test::$value = Config_Base::OPTION_NO;

		// Assert.
		$this->assertTrue( Config_Base_Test::is_off(), 'is_off() should return true if value is "no"' );

		// Arrange.
		Config_Base_Test::$value = null;

		// Assert.
		$this->assertTrue( Config_Base_Test::is_off(), 'is_off() should return true if value is null' );
	}

	public function test__set_on() {
		// Act.
		Config_Base_Test::set_on();

		// Assert.
		$this->assertTrue(  Config_Base::OPTION_YES === Config_Base_Test::$value );
	}

	public function test__set_off() {
		// Act.
		Config_Base_Test::set_off();

		// Assert.
		$this->assertTrue(  null === Config_Base_Test::$value );
	}

	// tearDown
	public function tearDown() {
		parent::tearDown();

		Config_Base_Test::$value = null;
	}
}
