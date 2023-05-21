<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Config_Base;
use Elementor\Core\Config\Config_Boolean_Trait;
use ElementorEditorTesting\Elementor_Test_Base;

class Config_Boolean_Trait_Test extends \Elementor\Core\Config\Config_Base {
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
		return static::VALUE_FALSE;
	}

	public static function get() {
		return static::$value;
	}

	public static function setter( $value ) {
		static::$value = $value;
		return true;
	}

	public static function deleter(): bool {
		static::$value = null;
		return true;
	}

	public static function on_change( $new_value, $old_value = null ) {
		static::$changed = [
			'new' => $new_value,
			'old' => $old_value,
		];
	}

	protected static function validate( $value ) {
		return is_bool( $value );
	}

	protected static function has_permission($value) {
		return true;
	}
}

class Test_Config_Boolean_Trait extends Elementor_Test_Base {

	public function test__on_change() {
		// Act.
		Config_Boolean_Trait_Test::set_true();

		// Assert.
		$this->assertEquals( [
			'new' => 1,
			'old' => null,
		], Config_Boolean_Trait_Test::$changed );
	}

	public function test__is_true() {
		// Arrange.
		Config_Boolean_Trait_Test::$value = Config_Base::VALUE_TRUE;

		// Assert.
		$this->assertTrue( Config_Boolean_Trait_Test::is_true() );
	}

	public function test__is_false() {
		// Arrange.
		Config_Boolean_Trait_Test::$value = Config_Base::VALUE_FALSE;

		// Assert.
		$this->assertTrue( Config_Boolean_Trait_Test::is_false(), 'is_false() should return true if value is "no"' );

		// Arrange.
		Config_Boolean_Trait_Test::$value = null;

		// Assert.
		$this->assertTrue( Config_Boolean_Trait_Test::is_false(), 'is_false() should return true if value is null' );
	}

	public function test__set_true() {
		// Act.
		Config_Boolean_Trait_Test::set_true();

		// Assert.
		$this->assertTrue(  Config_Base::VALUE_TRUE === Config_Boolean_Trait_Test::$value );
	}

	public function test__set_false() {
		// Act.
		Config_Boolean_Trait_Test::set_false();

		// Assert.
		$this->assertTrue(  Config_Base::VALUE_FALSE === Config_Boolean_Trait_Test::$value );
	}

	// tearDown
	public function tearDown() {
		parent::tearDown();

		Config_Boolean_Trait_Test::$value = null;
	}
}
