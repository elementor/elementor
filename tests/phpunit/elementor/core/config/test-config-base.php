<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Config_Base;
use ElementorEditorTesting\Elementor_Test_Base;

class Config_Base_Test extends Config_Base {
	const PREFIX = 'elementor_';

	static $value;
	static $changed;

	public static function get_db_key(): string {
		return static::PREFIX . static::get_key();
	}

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

class Test_Config_Base extends Elementor_Test_Base {

	public function test__get_prefix() {
		// Assert.
		$this->assertEquals( 'elementor_', Config_Base_Test::get_prefix() );
	}

	public function test__get_db_key() {
		// Assert.
		$this->assertEquals( 'elementor_test', Config_Base_Test::get_db_key() );
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
	}
}
