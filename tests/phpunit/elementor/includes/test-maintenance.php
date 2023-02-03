<?php
namespace Elementor\Testing\Includes;

use ElementorEditorTesting\Elementor_Test_Base;

class Test_Maintenance extends Elementor_Test_Base {

	const OPTION_KEY = 'elementor_font_display';

	public function test_new_install_options() {
		// Arrange.
		$user = $this->act_as_admin();
		delete_option( 'elementor_install_history' );

		// Act.
		\Elementor\Maintenance::insert_defaults_options();

		// Assert.
		$this->assertEquals( 'swap', get_option( static::OPTION_KEY ) );
	}

	public function test_not_new_install_options() {
		// Arrange.
		$user = $this->act_as_admin();
		update_option( 'elementor_install_history', [ '1.0.0' ] );

		// Act.
		\Elementor\Maintenance::insert_defaults_options();

		// Assert.
		$this->assertNotEquals( 'swap', get_option( static::OPTION_KEY ) );
	}
}
