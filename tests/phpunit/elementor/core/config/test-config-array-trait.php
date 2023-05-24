<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Tests\Phpunit\Elementor\Core\Config\Mock\Site_Config_Array;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Config_Array_Trait extends Elementor_Test_Base {

	// test default value
	public function test__get_default() {
		// Assert.
		$this->assertEquals( [ 'default-value' ], Site_Config_Array::get_value() );
	}

	public function test__get_sub_option() {
		// Arrange.
		update_option( 'elementor_test', [ 'sub_option' => 'sub_value' ] );

		// Assert.
		$this->assertEquals( 'sub_value', Site_Config_Array::get_sub_option( 'sub_option' ) );
	}

	public function test__set_sub_option() {
		update_option( 'elementor_test', [] );

		// Act.
		Site_Config_Array::set_sub_option( 'sub_option', 'sub_value' );

		// Assert.
		$this->assertEquals( [ 'sub_option' => 'sub_value' ], get_option( 'elementor_test' ) );
	}

	public function test__set_invalid_sub_option() {
		// Assert.
		$this->expectException( \Exception::class, 'Invalid sub option' );

		// Act.
		Site_Config_Array::set( 'sub_value' );
	}

	public function test__delete_sub_option() {
		// Arrange.
		$this->test__set_sub_option();

		// Act.
		Site_Config_Array::delete_sub_option( 'sub_option' );

		// Assert.
		$this->assertEquals( [], get_option( 'elementor_test', null )  );
	}
}
