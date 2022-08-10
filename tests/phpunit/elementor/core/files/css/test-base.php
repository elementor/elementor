<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Files\Css;

use ElementorEditorTesting\Elementor_Test_Base;

/**
 * Test the CSS Base class
 */
class Test_Base extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Core\Files\CSS\Post
	 */
	private static $css_base_class;
	/**
	 * @var array
	 */
	private static $mock_control;
	/**
	 * @var array[]
	 */
	private static $mock_controls_stack;

	public static function setUpBeforeClass() {
		// The CSS Base class is abstract, so it can't be instantiated. The inheriting Post class is used instead.
		self::$css_base_class = new \Elementor\Core\Files\CSS\Post( 0 );

		self::$mock_control = [
			'type' => 'number',
			'default' => 20,
		];

		self::$mock_controls_stack = [
			'number' => self::$mock_control,
		];
	}

	public function test_parse_property_placeholder__value_0() {
		// Arrange.
		$value = 0;

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( $value, $control_value );
	}

	public function test_parse_property_placeholder__value_0_string() {
		// Arrange.
		$value = '0';

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( $value, $control_value );
	}

	public function test_parse_property_placeholder__value_empty_string() {
		// Arrange.
		$value = '';

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( null, $control_value );
	}

	public function test_parse_property_placeholder__value_null() {
		// Arrange.
		$value = null;

		// Act
		$control_value = $this->get_parsed_value( $value );

		// Assert.
		$this->assertEquals( $value, $control_value );
	}

	private function get_parsed_value( $value ) {
		return self::$css_base_class->parse_property_placeholder(
			self::$mock_control,
			$value,
			self::$mock_controls_stack,
			function() {},
			''
		);
	}
}
