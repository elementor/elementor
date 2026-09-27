<?php

namespace Elementor\Tests\Phpunit\Includes\Widgets;

use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Widget_Common_Base extends Elementor_Test_Base {
	public function test_mask_shape_control_uses_selectors_dictionary() {
		// Arrange.
		$common_widget = Plugin::instance()->widgets_manager->get_widget_types( 'common' );

		// Act.
		$mask_shape_control = $common_widget->get_controls( '_mask_shape' );

		// Assert.
		$this->assertSame(
			'url( ' . ELEMENTOR_ASSETS_URL . 'mask-shapes/circle.svg )',
			$mask_shape_control['selectors_dictionary']['circle']
		);

		$this->assertSame( 'none', $mask_shape_control['selectors_dictionary']['custom'] );
		$this->assertSame(
			[
				'{{WRAPPER}}:not( .elementor-widget-image ) .elementor-widget-container, {{WRAPPER}}.elementor-widget-image .elementor-widget-container img' => '-webkit-mask-image: {{VALUE}};',
			],
			$mask_shape_control['selectors']
		);
	}
}
