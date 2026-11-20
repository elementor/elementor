<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Controls;

use Elementor\Modules\AtomicWidgets\Controls\Types\Svg_Control;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Svg_Control extends Elementor_Test_Base {
	public function test_get_props__returns_the_svg_media_type() {
		// Arrange.
		$control = Svg_Control::bind_to( 'svg' );

		// Act.
		$props = $control->get_props();

		// Assert.
		$this->assertSame( [ 'type' => 'svg-media' ], $props );
	}
}
