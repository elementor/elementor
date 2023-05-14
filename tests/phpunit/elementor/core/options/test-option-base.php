<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Config_Base;
use Elementor\Core\Config\Config_Boolean_Trait;
use ElementorEditorTesting\Elementor_Test_Base;

class Config_Base_Test extends \Elementor\Core\Config\Config_Base {
	use Config_Boolean_Trait;

	const PREFIX = 'elementor_';

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

class Test_Config_Base extends Elementor_Test_Base {

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

	public function test__is_true() {
		// Arrange.
		Config_Base_Test::$value = Config_Base::VALUE_TRUE;

		// Assert.
		$this->assertTrue( Config_Base_Test::is_true() );
	}

	public function test__is_false() {
		// Arrange.
		Config_Base_Test::$value = Config_Base::VALUE_FALSE;

		// Assert.
		$this->assertTrue( Config_Base_Test::is_false(), 'is_false() should return true if value is "no"' );

		// Arrange.
		Config_Base_Test::$value = null;

		// Assert.
		$this->assertTrue( Config_Base_Test::is_false(), 'is_false() should return true if value is null' );
	}

	public function test__set_true() {
		// Act.
		Config_Base_Test::set_true();

		// Assert.
		$this->assertTrue(  Config_Base::VALUE_TRUE === Config_Base_Test::$value );
	}

	public function test__set_false() {
		// Act.
		Config_Base_Test::set_false();

		// Assert.
		$this->assertTrue(  Config_Base::VALUE_FALSE === Config_Base_Test::$value );
	}

	// tearDown
	public function tearDown() {
		parent::tearDown();

		Config_Base_Test::$value = null;
	}
}
