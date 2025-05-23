<?php
namespace Elementor\Testing\Includes;

use Elementor\Fonts;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Fonts extends Elementor_Test_Base {

	public function setUp() {
		parent::setUp();

		Fonts::reset_local_cache();
	}

	public function test_is_google_fonts_enabled__returns_true() {
		// Act.
		$is_enabled = Fonts::is_google_fonts_enabled();

		// Assert.
		$this->assertTrue( $is_enabled );
	}

	public function test_is_google_fonts_enabled__returns_false() {
		// Arrange.
		update_option( 'elementor_google_font', '0' );

		// Act.
		$is_enabled = Fonts::is_google_fonts_enabled();

		// Assert.
		$this->assertFalse( $is_enabled );
	}

	public function test_get_font_groups__with_google() {
		// Act.
		$font_groups = Fonts::get_font_groups();

		// Assert.
		$this->assertArrayHasKey( Fonts::SYSTEM, $font_groups );
		$this->assertArrayHasKey( Fonts::GOOGLE, $font_groups );
		$this->assertArrayHasKey( Fonts::EARLYACCESS, $font_groups );
	}

	public function test_get_font_groups__without_google() {
		// Arrange.
		update_option( 'elementor_google_font', '0' );

		// Act.
		$font_groups = Fonts::get_font_groups();

		// Assert.
		$this->assertArrayHasKey( Fonts::SYSTEM, $font_groups );
		$this->assertArrayNotHasKey( Fonts::GOOGLE, $font_groups );
		$this->assertArrayNotHasKey( Fonts::EARLYACCESS, $font_groups );
	}
}
