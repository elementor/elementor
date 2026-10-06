<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Controls;

use Elementor\Modules\AtomicWidgets\Controls\Types\Svg_Control;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Svg_Control extends Elementor_Test_Base {
	public function test_get_props__defaults_icon_library_to_false() {
		// Arrange.
		$control = Svg_Control::bind_to( 'svg' );

		// Act.
		$props = $control->get_props();

		// Assert.
		$this->assertFalse( $props['showIconLibrary'] );
	}

	public function test_get_props__includes_true_when_icon_library_is_enabled() {
		// Arrange.
		$control = Svg_Control::bind_to( 'svg' )->set_show_icon_library( true );

		// Act.
		$props = $control->get_props();

		// Assert.
		$this->assertTrue( $props['showIconLibrary'] );
	}
}
