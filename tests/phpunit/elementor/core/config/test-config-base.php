<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Config_Base;
use ElementorEditorTesting\Elementor_Test_Base;

class Config_Base_Test extends Config_Base {
	const PREFIX = 'elementor_';

	static $value;
	static $changed;


	public static function should_autoload(): bool {
		return false;
	}

	public static function get_key(): string {
		return 'test';
	}

	public static function get_default() {
		return 'default-value';
	}

	public static function get_value() {
		return static::$value;
	}

	public static function setter( $value ): bool {
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

	protected static function validate( $value ): bool {
		return is_string( $value );
	}

	protected static function has_permission( $value ): bool {
		return true;
	}
}

class Config_Base_Test_Sub_Option extends Config_Base_Test {
	public static function get_key(): string {
		return 'test_sub_option';
	}

	public static function get_default(): array {
		return [ 'default-value' ];
	}

	protected static function validate( $value ) : bool {
		return is_array( $value );
	}

	protected static function has_permission( $value ): bool {
		return true;
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
		Config_Base_Test_Sub_Option::$value = [ 'sub_option' => 'sub_value' ];

		// Assert.
		$this->assertEquals( 'sub_value', Config_Base_Test_Sub_Option::get_sub_option( 'sub_option' ) );
	}

	public function test__set_sub_option() {
		// Arrange.
		Config_Base_Test_Sub_Option::$value = [];

		// Act.
		Config_Base_Test_Sub_Option::set_sub_option( 'sub_option', 'sub_value' );

		// Assert.
		$this->assertEquals( [ 'sub_option' => 'sub_value' ], Config_Base_Test_Sub_Option::$value );
	}

	public function test__set_invalid_sub_option() {
		// Assert.
		$this->expectException( \Error::class );

		// Act.
		Config_Base_Test_Sub_Option::set_sub_option( 'sub_option', 'sub_value' );
	}

	public function test__delete_sub_option() {
		// Arrange.
		$this->test__set_sub_option();

		// Act.
		Config_Base_Test_Sub_Option::delete_sub_option( 'sub_option' );

		// Assert.
		$this->assertEquals( [], Config_Base_Test_Sub_Option::$value );
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

	// tearDown
	public function tearDown() {
		parent::tearDown();

		Config_Base_Test::$value = null;
		Config_Base_Test_Sub_Option::$value = null;
	}
}
