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
	private $css_base_class;
	/**
	 * @var array
	 */
	private $mock_control;
	/**
	 * @var array[]
	 */
	private $mock_controls_stack;

	public function setUp() {
		parent::setUp();

		// The CSS Base class is abstract, so it can't be instantiated. The inheriting Post class is used instead.
		$this->css_base_class = new \Elementor\Core\Files\CSS\Post( 0 );

		$this->mock_control = [
			'type' => 'number',
			'default' => 20,
		];

		$this->mock_controls_stack = [
			'number' => $this->mock_control,
		];
	}

	public function test_parse_property_placeholder__value_0_integer() {
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
		return $this->css_base_class->parse_property_placeholder(
			$this->mock_control,
			$value,
			$this->mock_controls_stack,
			function() {},
			''
		);
	}
}
