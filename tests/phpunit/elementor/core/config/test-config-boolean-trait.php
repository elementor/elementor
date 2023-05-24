<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Config_Base;
use Elementor\Tests\Phpunit\Elementor\Core\Config\Mock\Site_Config_Boolean;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Config_Boolean_Trait extends Elementor_Test_Base {

	public function test__on_change() {
		// Act.
		Site_Config_Boolean::set_true();

		// Assert.
		$this->assertEquals( [
			'new' => 1,
			'old' => null,
		], Site_Config_Boolean::$changed );
	}

	public function test__is_true() {
		// Arrange.
		update_option( 'elementor_test', true );

		// Assert.
		$this->assertTrue( Site_Config_Boolean::is_true() );
	}

	public function test__is_false() {
		// Arrange.
		update_option( 'elementor_test', false );

		// Assert.
		$this->assertTrue( Site_Config_Boolean::is_false() );
	}

	public function test__set_true() {
		// Act.
		Site_Config_Boolean::set_true();

		// Assert.
		$this->assertTrue( Config_Base::VALUE_TRUE === get_option( 'elementor_test' ) );
	}

	public function test__set_false() {
		// Act.
		Site_Config_Boolean::set_false();

		// Assert.
		$this->assertTrue( Config_Base::VALUE_FALSE === get_option( 'elementor_test' ) );
	}
}
