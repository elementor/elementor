<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use ElementorEditorTesting\Elementor_Test_Base;

class Test_Config_Array_Trait extends Elementor_Test_Base {

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
	// tearDown
	public function tearDown() {
		parent::tearDown();

		Config_Base_Test_Sub_Option::$value = null;
	}
}
