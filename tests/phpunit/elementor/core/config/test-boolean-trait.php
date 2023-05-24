<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Config\Config_Base;
use ElementorEditorTesting\Elementor_Test_Base;

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
		$this->assertTrue( Config_Base::VALUE_TRUE === Config_Boolean_Trait_Test::$value );
	}

	public function test__set_false() {
		// Act.
		Config_Boolean_Trait_Test::set_false();

		// Assert.
		$this->assertTrue( Config_Base::VALUE_FALSE === Config_Boolean_Trait_Test::$value );
	}

	// tearDown
	public function tearDown() {
		parent::tearDown();

		Config_Boolean_Trait_Test::$value = null;
	}
}
