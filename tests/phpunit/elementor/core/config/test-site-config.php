<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Exceptions\InvalidAppException;
use Elementor\Core\Config\Exceptions\PermissionDeniedException;
use Elementor\Core\Config\Exceptions\InvalidValueException;
use Elementor\Tests\Phpunit\Elementor\Core\Config\Mock\Site_Config;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Site_Config extends Elementor_Test_Base {
	public function test__get() {
		// Act
		update_option( 'elementor_test', 'test' );

		// Assert
		$this->assertEquals( 'test', Site_Config::get_value() );
	}

	public function test__set() {
		$this->act_as_admin();

		// Act
		Site_Config::set( 'test' );

		// Assert
		$this->assertEquals( 'test', get_option( 'elementor_test' ) );
	}

	public function test__set_from_front_is_avoided() {
		// Arrange
		$this->act_as_admin();
		$this->set_is_backend( false );

		// Assert
		$this->expectException( InvalidAppException::class );

		// Act
		Site_Config::set( 'test' );
	}

	public function test__set_as_editor_is_avoided() {
		// Arrange
		$this->act_as_editor();
		$this->set_is_backend( true );

		// Assert
		$this->expectException( PermissionDeniedException::class );

		// Act
		Site_Config::set( 'test' );
	}

	public function test__set_invalid_value() {
		$this->act_as_admin();
		$this->set_is_backend( true );

		// Assert
		$this->expectException( InvalidValueException::class );

		// Act
		Site_Config::set( [] );
	}

	public function test__get_default() {
		// Assert
		$this->assertEquals( 'default-value', Site_Config::get_value() );
	}

	public function test_delete() {
		$this->act_as_admin();

		// Arrange
		$this->test__get();

		// Act
		Site_Config::delete();

		// Assert
		$this->assertEmpty( get_option( 'elementor_test' ) );
	}

	public function test__get_db_key() {
		// Assert.
		$this->assertEquals( 'elementor_test', Site_Config::get_db_key() );
	}

	public function test__on_change() {
		$this->act_as_admin();

		// Act.
		Site_Config::set( 'new-value' );

		// Assert.
		$this->assertEquals( [
			'new' => 'new-value',
			'old' => null,
		], Site_Config::$changed );
	}

	protected static function validate( $value ): bool {
		return is_string( $value );
	}

	private function set_is_backend( bool $value ) {
		// Mock is_admin() function.
		$GLOBALS['current_screen'] = new class( $value ) {

			private $value;

			public function __construct( $value ) {
				$this->value = $value;
			}

			public function in_admin() {
				return $this->value;
			}
		};
	}
}
