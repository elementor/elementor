<?php
namespace Elementor\Testing;

use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Fonts extends Elementor_Test_Base {

	public function test_getAllFonts() {
		$this->assertNotEmpty( \Elementor\Fonts::get_fonts() );
	}

	public function test_getFontType() {
		$this->assertEquals( 'system', \Elementor\Fonts::get_font_type( 'Arial' ) );
		$this->assertFalse( \Elementor\Fonts::get_font_type( 'NotFoundThisFont' ) );
	}

	public function test_getFontByGroups() {
		$this->assertArrayHasKey( 'Arial', \Elementor\Fonts::get_fonts_by_groups( [ 'system' ] ) );
		$this->assertArrayNotHasKey( 'Arial', \Elementor\Fonts::get_fonts_by_groups( [ 'googlefonts' ] ) );
	}
}
