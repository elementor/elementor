<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Controls;

use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Select_Control extends Elementor_Test_Base {
	public function test_get_props__omits_the_fallback_values_when_none_are_set() {
		// Arrange.
		$control = Select_Control::bind_to( 'select' );

		// Act.
		$props = $control->get_props();

		// Assert.
		$this->assertArrayNotHasKey( 'fallbackValues', $props );
	}

	public function test_get_props__returns_the_fallback_values() {
		// Arrange.
		$control = Select_Control::bind_to( 'select' )->set_fallback_values( [ 'tablet' => 'mobile' ] );

		// Act.
		$props = $control->get_props();

		// Assert.
		$this->assertSame( [ 'tablet' => 'mobile' ], $props['fallbackValues'] );
	}
}
