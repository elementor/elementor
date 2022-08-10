<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Css;

use ElementorEditorTesting\Elementor_Test_Base;

/**
 * Test the CSS Base class
 */
class Test_Base extends Elementor_Test_Base {

	public function test_parse_property_placeholder() {
		// Arrange.
		// The CSS Base class is abstract, so it can't be instantiated. The inheriting Post class is used instead.
		$css_base_class = new \Elementor\Core\Files\CSS\Post( 0 );

		// Create mock data.
		$control = [
			'type' => 'number',
			'default' => '20',
		];

		$controls_stack = [
			$control,
		];

		//array $control, $value, array $controls_stack, $value_callback, $placeholder, $parser_control_name = null
		$control_value = $css_base_class->parse_property_placeholder(
			$control,
			0,
			$controls_stack,
			function() {},
			''
		);

		// Assert. Check that when the control value is 0, `parse_property_placeholder()` returns 0.
		$this->assertEquals( 0, $control_value );
	}
}
