<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Css;

use ElementorEditorTesting\Elementor_Test_Base;

/**
 * Test the CSS Base class
 */
class Test_Base extends Elementor_Test_Base {

	public function test_parse_property_placeholder_edge_cases() {
		// Arrange.
		// The CSS Base class is abstract, so it can't be instantiated. The inheriting Post class is used instead.
		$css_base_class = new \Elementor\Core\Files\CSS\Post( 0 );

		// Create mock data.
		$control = [
			'type' => 'number',
			'default' => 20,
		];

		$controls_stack = [
			'number' => $control,
		];

		/**
		 * value of 0
		 */
		$value = 0;

		// Act
		$control_value_0 = $css_base_class->parse_property_placeholder(
			$control,
			$value,
			$controls_stack,
			function() {},
			''
		);

		// Assert.
		$this->assertEquals( $value, $control_value_0 );

		/**
		 * value of '0'
		 */
		// Arrange.
		$value = '0';

		// Act
		$control_value_0_string = $css_base_class->parse_property_placeholder(
			$control,
			$value,
			$controls_stack,
			function() {},
			''
		);

		// Assert.
		$this->assertEquals( $value, $control_value_0_string );

		/**
		 * value of ''
		 */
		// Arrange.
		$value = '';

		// Act
		$control_value_0_string = $css_base_class->parse_property_placeholder(
			$control,
			$value,
			$controls_stack,
			function() {},
			''
		);

		// Assert.
		$this->assertEquals( null, $control_value_0_string );

		/**
		 * value of null
		 */
		// Arrange.
		$value = null;

		// Act
		$control_value_0_string = $css_base_class->parse_property_placeholder(
			$control,
			$value,
			$controls_stack,
			function() {},
			''
		);

		// Assert.
		$this->assertEquals( $value, $control_value_0_string );
	}
}
